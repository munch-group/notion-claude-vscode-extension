import Anthropic from '@anthropic-ai/sdk';
import * as vscode from 'vscode';

export class ClaudeService {
    private anthropic: Anthropic | null = null;

    private getClient(): Anthropic {
        if (!this.anthropic) {
            const config = vscode.workspace.getConfiguration('notion-claude');
            const apiKey = config.get<string>('anthropicApiKey');
            
            if (!apiKey) {
                throw new Error('Anthropic API key not configured. Use "Configure API Keys" command.');
            }
            
            this.anthropic = new Anthropic({ apiKey });
        }
        return this.anthropic;
    }

    async editContent(content: string, instruction: string): Promise<string> {
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
        } catch (error) {
            throw new Error(`Claude API error: ${error}`);
        }
    }

    async analyzeContent(content: string, analysisType: string = 'general'): Promise<string> {
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
        } catch (error) {
            throw new Error(`Claude API error: ${error}`);
        }
    }

    async generateContent(prompt: string, context: string = ''): Promise<string> {
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
        } catch (error) {
            throw new Error(`Claude API error: ${error}`);
        }
    }

    async translateContent(content: string, targetLanguage: string): Promise<string> {
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
        } catch (error) {
            throw new Error(`Claude API error: ${error}`);
        }
    }
}