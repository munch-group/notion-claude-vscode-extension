import * as vscode from 'vscode';
import { NotionService } from '../services/notionService';

export class NotionPagesProvider implements vscode.TreeDataProvider<NotionPageItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NotionPageItem | undefined | null | void> = new vscode.EventEmitter<NotionPageItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<NotionPageItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private pages: any[] = [];

    constructor(private notionService: NotionService) {}

    refresh(): void {
        this.loadPages();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: NotionPageItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: NotionPageItem): Promise<NotionPageItem[]> {
        if (!element) {
            // Root level - show all pages
            if (this.pages.length === 0) {
                await this.loadPages();
            }
            
            return this.pages.map(page => new NotionPageItem(
                this.extractPageTitle(page),
                page.id,
                vscode.TreeItemCollapsibleState.None
            ));
        }
        
        return [];
    }

    private async loadPages(): Promise<void> {
        try {
            this.pages = await this.notionService.searchPages();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load Notion pages: ${error}`);
            this.pages = [];
        }
    }

    private extractPageTitle(page: any): string {
        if (page.properties?.Name?.title?.[0]?.text?.content) {
            return page.properties.Name.title[0].text.content;
        }
        if (page.properties?.title?.[0]?.text?.content) {
            return page.properties.title[0].text.content;
        }
        return 'Untitled';
    }
}

export class NotionPageItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly pageId: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        
        this.tooltip = `${this.label} (${this.pageId})`;
        this.contextValue = 'notionPage';
        
        // Add command to import the page when clicked
        this.command = {
            command: 'notion-claude.importPage',
            title: 'Import Page',
            arguments: [this.pageId]
        };
    }
}