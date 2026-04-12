const vscode = require('vscode');

function activate(context) {
    let bracketsColored = false;
    
    // Define HTML bracket scopes more comprehensively
    const bracketScopes = [
        'punctuation.definition.tag.html',
        'punctuation.definition.tag.begin.html',
        'punctuation.definition.tag.end.html'
    ];

    let toggleBrackets = vscode.commands.registerCommand('extension.toggleBrackets', async () => {
        try {
            // Get current theme colors
            const config = vscode.workspace.getConfiguration();
            const editorConfig = vscode.workspace.getConfiguration('editor');
            const editorBackground = editorConfig.get('background') || '#00000000';

            // Update configuration at global (User) level instead of workspace
            // This prevents adding .vscode/settings.json to the repository and git diffs
            const inspection = config.inspect('editor.tokenColorCustomizations');
            const globalColorCustomizations = inspection.globalValue || {};
            
            // Initialize textMateRules in global config if doesn't exist
            if (!globalColorCustomizations['textMateRules']) {
                globalColorCustomizations['textMateRules'] = [];
            }

            // Apply our changes to the global textMateRules
            globalColorCustomizations['textMateRules'] = globalColorCustomizations['textMateRules'].filter(rule =>
                !bracketScopes.includes(rule.scope)
            );

            if (!bracketsColored) {
                bracketScopes.forEach(scope => {
                    globalColorCustomizations['textMateRules'].push({
                        scope: scope,
                        settings: {
                            foreground: editorBackground
                        }
                    });
                });
                bracketsColored = true;
                vscode.window.setStatusBarMessage('HTML angle brackets: hidden (Global)', 2000);
            } else {
                bracketsColored = false;
                vscode.window.setStatusBarMessage('HTML angle brackets: visible (Global)', 2000);
            }

            await config.update(
                'editor.tokenColorCustomizations',
                globalColorCustomizations,
                vscode.ConfigurationTarget.Global
            );
        } catch (error) {
            console.error('Error toggling brackets:', error);
            vscode.window.showErrorMessage('Failed to toggle HTML brackets visibility');
        }
    });

    context.subscriptions.push(toggleBrackets);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};