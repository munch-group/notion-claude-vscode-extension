"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeService = void 0;
const sdk_1 = require("@anthropic-ai/sdk");
const vscode = require("vscode");
class ClaudeService {
    constructor() {
        this.anthropic = null;
    }
    getClient() {
        if (!this.anthropic) {
            const config = vscode.workspace.getConfiguration('notion-claude');
            const apiKey = config.get('anthropicApiKey');
            if (!apiKey) {
                throw new Error('Anthropic API key not configured. Use "Configure API Keys" command.');
            }
            this.anthropic = new sdk_1.default({ apiKey });
        }
        return this.anthropic;
    }
    async editContent(content, instruction) {
        const anthropic = this.getClient();
        try {
            const promptText = `Please modify the following content based on this instruction: "${instruction}"

Return ONLY the modified content, without any explanations or commentary.

Content to modify:
${content}`;
            const message = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                messages: [
                    {
                        role: "user",
                        content: promptText
                    }
                ]
            });
            const responseContent = message.content[0];
            return responseContent.type === 'text' ? responseContent.text : '';
        }
        catch (error) {
            throw new Error(`Claude API error: ${error}`);
        }
    }
    async analyzeContent(content, analysisType = 'general') {
        const anthropic = this.getClient();
        try {
            let promptText = '';
            switch (analysisType) {
                case 'summary':
                    promptText = 'Please provide a concise summary of the following content:';
                    break;
                case 'keypoints':
                    promptText = 'Extract the key points from this content as a bullet list:';
                    break;
                case 'improve':
                    promptText = 'Please improve the writing quality, clarity, and structure of this content:';
                    break;
                default:
                    promptText = 'Analyze this content and provide insights:';
            }
            const message = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                messages: [
                    {
                        role: "user",
                        content: `${promptText}\n\n${content}`
                    }
                ]
            });
            const responseContent = message.content[0];
            return responseContent.type === 'text' ? responseContent.text : '';
        }
        catch (error) {
            throw new Error(`Claude API error: ${error}`);
        }
    }
    async generateContent(prompt, context = '') {
        const anthropic = this.getClient();
        try {
            const fullPrompt = context
                ? `Context: ${context}\n\nTask: ${prompt}`
                : prompt;
            const message = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                messages: [
                    {
                        role: "user",
                        content: fullPrompt
                    }
                ]
            });
            const responseContent = message.content[0];
            return responseContent.type === 'text' ? responseContent.text : '';
        }
        catch (error) {
            throw new Error(`Claude API error: ${error}`);
        }
    }
    async translateContent(content, targetLanguage) {
        const anthropic = this.getClient();
        try {
            const promptText = `Please translate the following content to ${targetLanguage}. Return only the translated content:\n\n${content}`;
            const message = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                messages: [
                    {
                        role: "user",
                        content: promptText
                    }
                ]
            });
            const responseContent = message.content[0];
            return responseContent.type === 'text' ? responseContent.text : '';
        }
        catch (error) {
            throw new Error(`Claude API error: ${error}`);
        }
    }
}
exports.ClaudeService = ClaudeService;
//# sourceMappingURL=claudeService.js.map