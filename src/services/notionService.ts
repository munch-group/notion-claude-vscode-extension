import { Client } from '@notionhq/client';
import * as vscode from 'vscode';

export class NotionService {
    private notion: Client | null = null;

    private getClient(): Client {
        if (!this.notion) {
            const config = vscode.workspace.getConfiguration('notion-claude');
            const apiKey = config.get<string>('notionApiKey');
            
            if (!apiKey) {
                throw new Error('Notion API key not configured. Use "Configure API Keys" command.');
            }
            
            this.notion = new Client({ auth: apiKey });
        }
        return this.notion;
    }

    async importPage(pageId: string): Promise<{ title: string; content: string }> {
        const notion = this.getClient();
        
        // Clean page ID from URL if needed
        const cleanPageId = pageId.replace(/.*\/([a-zA-Z0-9-]+)(\?.*)?$/, '$1').replace(/-/g, '');
        
        try {
            const page = await notion.pages.retrieve({ page_id: cleanPageId });
            const blocks = await notion.blocks.children.list({ block_id: cleanPageId });
            
            const title = this.extractPageTitle(page);
            const content = this.convertBlocksToMarkdown(blocks.results);
            
            return { title, content };
        } catch (error) {
            throw new Error(`Failed to import page: ${error}`);
        }
    }

    async updatePage(pageId: string, content: string): Promise<void> {
        const notion = this.getClient();
        
        try {
            // Convert markdown to Notion blocks
            const blocks = this.convertMarkdownToBlocks(content);
            
            // Get existing blocks and clear them (simplified approach)
            // In a real implementation, you'd want to diff and update efficiently
            await notion.blocks.children.append({
                block_id: pageId,
                children: [
                    {
                        object: 'block',
                        type: 'divider',
                        divider: {}
                    },
                    {
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [{
                                type: 'text',
                                text: { content: `Updated via VS Code on ${new Date().toLocaleString()}` },
                                annotations: { italic: true, color: 'gray' }
                            }]
                        }
                    },
                    ...blocks
                ]
            });
        } catch (error) {
            throw new Error(`Failed to update page: ${error}`);
        }
    }

    async createPage(title: string, content: string): Promise<string> {
        const notion = this.getClient();
        
        try {
            const blocks = this.convertMarkdownToBlocks(content);
            
            // For simplicity, create as a page in the user's workspace
            // In a real implementation, you'd want to let users choose the parent
            const page = await notion.pages.create({
                parent: { type: 'page_id', page_id: 'your-workspace-page-id' }, // This needs to be configured
                properties: {
                    title: {
                        title: [{ text: { content: title } }]
                    }
                },
                children: blocks
            });
            
            return page.id;
        } catch (error) {
            throw new Error(`Failed to create page: ${error}`);
        }
    }

    async searchPages(query: string = ''): Promise<any[]> {
        const notion = this.getClient();
        
        try {
            const response = await notion.search({
                query,
                filter: { property: 'object', value: 'page' }
            });
            
            return response.results;
        } catch (error) {
            throw new Error(`Failed to search pages: ${error}`);
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

    private convertBlocksToMarkdown(blocks: any[]): string {
        let markdown = '';
        
        for (const block of blocks) {
            switch (block.type) {
                case 'paragraph':
                    if (block.paragraph.rich_text) {
                        markdown += this.extractTextFromRichText(block.paragraph.rich_text) + '\n\n';
                    }
                    break;
                case 'heading_1':
                    if (block.heading_1.rich_text) {
                        markdown += '# ' + this.extractTextFromRichText(block.heading_1.rich_text) + '\n\n';
                    }
                    break;
                case 'heading_2':
                    if (block.heading_2.rich_text) {
                        markdown += '## ' + this.extractTextFromRichText(block.heading_2.rich_text) + '\n\n';
                    }
                    break;
                case 'heading_3':
                    if (block.heading_3.rich_text) {
                        markdown += '### ' + this.extractTextFromRichText(block.heading_3.rich_text) + '\n\n';
                    }
                    break;
                case 'bulleted_list_item':
                    if (block.bulleted_list_item.rich_text) {
                        markdown += '- ' + this.extractTextFromRichText(block.bulleted_list_item.rich_text) + '\n';
                    }
                    break;
                case 'numbered_list_item':
                    if (block.numbered_list_item.rich_text) {
                        markdown += '1. ' + this.extractTextFromRichText(block.numbered_list_item.rich_text) + '\n';
                    }
                    break;
                // Add more block types as needed
            }
        }
        
        return markdown.trim();
    }

    private convertMarkdownToBlocks(markdown: string): any[] {
        const lines = markdown.split('\n');
        const blocks = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            if (trimmed.startsWith('# ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_1',
                    heading_1: {
                        rich_text: [{ type: 'text', text: { content: trimmed.substring(2) } }]
                    }
                });
            } else if (trimmed.startsWith('## ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ type: 'text', text: { content: trimmed.substring(3) } }]
                    }
                });
            } else if (trimmed.startsWith('### ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: {
                        rich_text: [{ type: 'text', text: { content: trimmed.substring(4) } }]
                    }
                });
            } else if (trimmed.startsWith('- ')) {
                blocks.push({
                    object: 'block',
                    type: 'bulleted_list_item',
                    bulleted_list_item: {
                        rich_text: [{ type: 'text', text: { content: trimmed.substring(2) } }]
                    }
                });
            } else {
                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: trimmed } }]
                    }
                });
            }
        }
        
        return blocks;
    }

    private extractTextFromRichText(richText: any[]): string {
        return richText.map(text => text.plain_text || text.text?.content || '').join('');
    }
}