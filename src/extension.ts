import * as vscode from 'vscode';
import { NotionService } from './services/notionService';
import { ClaudeService } from './services/claudeService';
import { NotionPagesProvider } from './providers/notionPagesProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Notion Claude Editor is now active!');

    // Initialize services
    const notionService = new NotionService();
    const claudeService = new ClaudeService();
    
    // Register tree view provider
    const notionPagesProvider = new NotionPagesProvider(notionService);
    vscode.window.createTreeView('notion-claude.pageExplorer', {
        treeDataProvider: notionPagesProvider
    });

    // Set context when extension is enabled
    vscode.commands.executeCommand('setContext', 'notion-claude.enabled', true);

    // Register commands
    const disposables = [
        vscode.commands.registerCommand('notion-claude.configure', async () => {
            await configureApiKeys();
        }),

        vscode.commands.registerCommand('notion-claude.importPage', async () => {
            await importNotionPage(notionService);
        }),

        vscode.commands.registerCommand('notion-claude.browsePages', async () => {
            notionPagesProvider.refresh();
        }),

        vscode.commands.registerCommand('notion-claude.editWithClaude', async () => {
            await editWithClaude(claudeService);
        }),

        vscode.commands.registerCommand('notion-claude.exportToNotion', async () => {
            await exportToNotion(notionService);
        })
    ];

    context.subscriptions.push(...disposables);
}

async function configureApiKeys() {
    const config = vscode.workspace.getConfiguration('notion-claude');
    
    const notionKey = await vscode.window.showInputBox({
        prompt: 'Enter your Notion API Key',
        password: true,
        value: config.get('notionApiKey', '')
    });
    
    if (notionKey) {
        await config.update('notionApiKey', notionKey, vscode.ConfigurationTarget.Global);
    }
    
    const anthropicKey = await vscode.window.showInputBox({
        prompt: 'Enter your Anthropic API Key',
        password: true,
        value: config.get('anthropicApiKey', '')
    });
    
    if (anthropicKey) {
        await config.update('anthropicApiKey', anthropicKey, vscode.ConfigurationTarget.Global);
    }
    
    vscode.window.showInformationMessage('API keys configured successfully!');
}

async function importNotionPage(notionService: NotionService) {
    const pageId = await vscode.window.showInputBox({
        prompt: 'Enter Notion Page ID or URL',
        placeHolder: 'abc123def456... or https://notion.so/page-name-abc123...'
    });
    
    if (!pageId) return;
    
    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Importing Notion page...",
            cancellable: false
        }, async (progress) => {
            const { title, content } = await notionService.importPage(pageId);
            
            // Create new document
            const doc = await vscode.workspace.openTextDocument({
                content: content,
                language: 'markdown'
            });
            
            await vscode.window.showTextDocument(doc);
            
            // Store page ID in document metadata
            const uri = doc.uri;
            context.workspaceState.update(`notion-page-${uri.toString()}`, pageId);
            
            vscode.window.showInformationMessage(`Imported "${title}" from Notion`);
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to import page: ${error}`);
    }
}

async function editWithClaude(claudeService: ClaudeService) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    const textToEdit = selectedText || editor.document.getText();
    
    if (!textToEdit.trim()) {
        vscode.window.showWarningMessage('No text to edit');
        return;
    }

    const prompt = await vscode.window.showInputBox({
        prompt: 'How would you like Claude to modify this content?',
        placeHolder: 'e.g., "make this more concise", "add bullet points", "improve clarity"'
    });
    
    if (!prompt) return;

    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Claude is editing your content...",
            cancellable: false
        }, async (progress) => {
            const modifiedContent = await claudeService.editContent(textToEdit, prompt);
            
            // Show diff and let user accept/reject
            const choice = await vscode.window.showInformationMessage(
                'Claude has modified your content. Review the changes.',
                'Show Diff',
                'Accept',
                'Reject'
            );
            
            if (choice === 'Show Diff') {
                await showDiff(textToEdit, modifiedContent, 'Claude Edit');
            } else if (choice === 'Accept') {
                await applyEdit(editor, selection, modifiedContent, selectedText ? true : false);
                vscode.window.showInformationMessage('Changes applied successfully!');
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Claude editing failed: ${error}`);
    }
}

async function showDiff(original: string, modified: string, title: string) {
    const originalUri = vscode.Uri.parse(`untitled:Original`);
    const modifiedUri = vscode.Uri.parse(`untitled:Modified`);
    
    await vscode.workspace.openTextDocument(originalUri).then(doc => {
        return vscode.window.showTextDocument(doc).then(editor => {
            return editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), original);
            });
        });
    });
    
    await vscode.workspace.openTextDocument(modifiedUri).then(doc => {
        return vscode.window.showTextDocument(doc).then(editor => {
            return editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), modified);
            });
        });
    });
    
    await vscode.commands.executeCommand('vscode.diff', originalUri, modifiedUri, title);
}

async function applyEdit(editor: vscode.TextEditor, selection: vscode.Selection, newContent: string, isSelection: boolean) {
    await editor.edit(editBuilder => {
        if (isSelection) {
            editBuilder.replace(selection, newContent);
        } else {
            const fullRange = new vscode.Range(
                editor.document.positionAt(0),
                editor.document.positionAt(editor.document.getText().length)
            );
            editBuilder.replace(fullRange, newContent);
        }
    });
}

async function exportToNotion(notionService: NotionService) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }

    const content = editor.document.getText();
    const uri = editor.document.uri;
    
    // Check if this document is linked to a Notion page
    const pageId = context.workspaceState.get(`notion-page-${uri.toString()}`);
    
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Exporting to Notion...",
            cancellable: false
        }, async (progress) => {
            if (pageId) {
                // Update existing page
                await notionService.updatePage(pageId as string, content);
                vscode.window.showInformationMessage('Page updated in Notion successfully!');
            } else {
                // Create new page
                const title = await vscode.window.showInputBox({
                    prompt: 'Enter page title',
                    placeHolder: 'My New Page'
                });
                
                if (title) {
                    const newPageId = await notionService.createPage(title, content);
                    context.workspaceState.update(`notion-page-${uri.toString()}`, newPageId);
                    vscode.window.showInformationMessage(`New page "${title}" created in Notion!`);
                }
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Export failed: ${error}`);
    }
}

export function deactivate() {}

// Make context available globally
let context: vscode.ExtensionContext;