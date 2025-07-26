# Change Log

All notable changes to the "notion-claude-editor" extension will be documented in this file.

## [0.1.0] - 2024-01-XX

### Added
- Initial release of Notion Claude Editor
- Import Notion pages directly into VS Code as markdown
- Edit content with Claude AI and view diffs before accepting changes
- Export modified content back to Notion
- Browse Notion pages in VS Code sidebar
- Secure API key configuration
- Context menu integration for quick Claude editing
- Support for markdown formatting and Notion block types

### Features
- **Import from Notion**: Pull any Notion page by ID or URL
- **AI-Powered Editing**: Use Claude to modify content with natural language instructions
- **Visual Diff Support**: See exactly what changes before accepting them
- **Export to Notion**: Push changes back to existing pages or create new ones
- **Page Browser**: Navigate your Notion workspace from VS Code sidebar
- **Context Integration**: Right-click on selected text to edit with Claude
- **Secure Configuration**: Encrypted storage of API keys in VS Code settings

### Technical
- TypeScript implementation with full type safety
- Integration with Notion API v2.2.15
- Integration with Anthropic Claude API
- Proper error handling and user feedback
- Optimized for VS Code extension best practices