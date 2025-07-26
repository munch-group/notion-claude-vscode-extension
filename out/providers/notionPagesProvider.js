"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionPageItem = exports.NotionPagesProvider = void 0;
const vscode = require("vscode");
class NotionPagesProvider {
    constructor(notionService) {
        this.notionService = notionService;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.pages = [];
    }
    refresh() {
        this.loadPages();
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            // Root level - show all pages
            if (this.pages.length === 0) {
                await this.loadPages();
            }
            return this.pages.map(page => new NotionPageItem(this.extractPageTitle(page), page.id, vscode.TreeItemCollapsibleState.None));
        }
        return [];
    }
    async loadPages() {
        try {
            this.pages = await this.notionService.searchPages();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load Notion pages: ${error}`);
            this.pages = [];
        }
    }
    extractPageTitle(page) {
        if (page.properties?.Name?.title?.[0]?.text?.content) {
            return page.properties.Name.title[0].text.content;
        }
        if (page.properties?.title?.[0]?.text?.content) {
            return page.properties.title[0].text.content;
        }
        return 'Untitled';
    }
}
exports.NotionPagesProvider = NotionPagesProvider;
class NotionPageItem extends vscode.TreeItem {
    constructor(label, pageId, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.pageId = pageId;
        this.collapsibleState = collapsibleState;
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
exports.NotionPageItem = NotionPageItem;
//# sourceMappingURL=notionPagesProvider.js.map