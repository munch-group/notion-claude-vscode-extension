# Notion Claude Editor - VS Code Extension

A VS Code extension that integrates Notion with Claude AI for seamless content editing directly in your editor.

## Features

### 🚀 Core Functionality
- **Import Notion Pages** - Pull any Notion page directly into VS Code as markdown
- **Edit with Claude** - Use Claude AI to modify content with inline diff support
- **Export to Notion** - Push changes back to Notion with one command
- **Page Browser** - Browse your Notion workspace in the VS Code sidebar

### ✨ Advanced Features
- **Real-time Diff View** - See exactly what Claude changed before accepting
- **Context-Aware Editing** - Select text to edit specific sections
- **Smart Sync** - Maintains links between VS Code files and Notion pages
- **Multiple Analysis Types** - Summary, key points, improvements, translations

## Installation

### Prerequisites
1. **VS Code** 1.74.0 or higher
2. **Notion Integration**:
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Create a new integration
   - Copy the API key
   - Share your pages/databases with the integration

3. **Anthropic API Key**:
   - Sign up at [Anthropic Console](https://console.anthropic.com/)
   - Generate an API key

### Setup
1. Install the extension from VS Code Marketplace (when published)
2. Open Command Palette (`Ctrl/Cmd+Shift+P`)
3. Run `Notion Claude: Configure API Keys`
4. Enter your Notion and Anthropic API keys

## Usage

### Import a Notion Page
1. Open Command Palette
2. Run `Notion Claude: Import Notion Page`
3. Enter page ID or URL
4. Page opens as markdown in VS Code

### Edit with Claude
1. Select text (or use entire document)
2. Right-click → `Edit with Claude`
3. Describe how you want to modify the content
4. Review diff and accept/reject changes

### Export to Notion
1. Open any markdown file
2. Click the cloud upload icon in the editor title
3. Choose to update existing page or create new one

### Browse Notion Pages
1. Check the "Notion Pages" panel in Explorer
2. Click any page to import it
3. Use refresh button to reload the list

## Commands

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `Notion Claude: Import Notion Page` | Import page from Notion | - |
| `Notion Claude: Edit with Claude` | Edit selected content with AI | - |
| `Notion Claude: Export to Notion` | Save changes back to Notion | - |
| `Notion Claude: Browse Notion Pages` | Refresh page browser | - |
| `Notion Claude: Configure API Keys` | Set up API credentials | - |

## Configuration

### Settings
- `notion-claude.notionApiKey` - Your Notion Integration API Key
- `notion-claude.anthropicApiKey` - Your Anthropic API Key  
- `notion-claude.autoSync` - Automatically sync changes to Notion (default: false)

### Customization
Add to your VS Code settings.json:
```json
{
  "notion-claude.autoSync": false,
  "notion-claude.notionApiKey": "your-key-here",
  "notion-claude.anthropicApiKey": "your-key-here"
}
```

## Development

### Build from Source
```bash
cd vscode-extension
npm install
npm run compile
```

### Package Extension
```bash
npm install -g vsce
vsce package
```

### Install Locally
```bash
code --install-extension notion-claude-editor-0.1.0.vsix
```

## Examples

### Editing Workflow
1. Import a meeting notes page from Notion
2. Select a paragraph about action items
3. Use "Edit with Claude" → "convert to bullet points"
4. Review the diff and accept changes
5. Export back to Notion

### Content Creation
1. Create new markdown file in VS Code
2. Write initial content
3. Use Claude to improve, expand, or restructure
4. Export as new Notion page

## Security

- API keys are stored securely in VS Code settings
- No data is stored on external servers
- All processing happens locally or through official APIs

## Roadmap

- [ ] Real-time collaboration sync
- [ ] Database integration (not just pages)
- [ ] Custom Claude prompts/templates
- [ ] Batch operations
- [ ] Rich media support (images, embeds)
- [ ] Version history integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Check the wiki for detailed guides
- Community: Join our Discord for discussions