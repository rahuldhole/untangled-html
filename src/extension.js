const vscode = require('vscode');

function activate(context) {
    let bracketsColored = false;
    
    // Define angle bracket scopes across all supported languages.
    // VS Code textMateRules accepts scope as an array — a single rule covers everything.
    // TextMate prefix matching means 'punctuation.definition.tag' also matches
    // 'punctuation.definition.tag.begin.html', '.end.jsx', '.begin.svelte', etc.
    const bracketScopes = [
        // Broad catch-all (covers current + future grammars via prefix matching)
        'punctuation.definition.tag',
        'punctuation.definition.tag.begin',
        'punctuation.definition.tag.end',

        // HTML
        'punctuation.definition.tag.html',
        'punctuation.definition.tag.begin.html',
        'punctuation.definition.tag.end.html',

        // JSX (JavaScript)
        'punctuation.definition.tag.begin.js',
        'punctuation.definition.tag.end.js',
        'punctuation.definition.tag.begin.js.jsx',
        'punctuation.definition.tag.end.js.jsx',

        // TSX (TypeScript)
        'punctuation.definition.tag.begin.ts',
        'punctuation.definition.tag.end.ts',
        'punctuation.definition.tag.begin.ts.tsx',
        'punctuation.definition.tag.end.ts.tsx',
        'punctuation.definition.tag.begin.tsx',
        'punctuation.definition.tag.end.tsx',

        // Vue
        'punctuation.definition.tag.begin.html.vue',
        'punctuation.definition.tag.end.html.vue',

        // Svelte
        'punctuation.definition.tag.begin.svelte',
        'punctuation.definition.tag.end.svelte',

        // Astro
        'punctuation.definition.tag.begin.astro',
        'punctuation.definition.tag.end.astro',

        // ERB (Ruby on Rails)
        'punctuation.definition.tag.begin.html.erb',
        'punctuation.definition.tag.end.html.erb',

        // MDX
        'punctuation.definition.tag.begin.mdx',
        'punctuation.definition.tag.end.mdx',

        // Liquid (Shopify)
        'punctuation.definition.tag.begin.html.liquid',
        'punctuation.definition.tag.end.html.liquid',

        // PHP / Blade
        'punctuation.definition.tag.begin.html.php',
        'punctuation.definition.tag.end.html.php',

        // Handlebars
        'punctuation.definition.tag.begin.html.handlebars',
        'punctuation.definition.tag.end.html.handlebars',

        // XML
        'punctuation.definition.tag.xml',
        'punctuation.definition.tag.begin.xml',
        'punctuation.definition.tag.end.xml',
    ];

    // Helper: check if a rule was created by this extension
    function isOurRule(rule) {
        const scope = rule.scope;
        if (Array.isArray(scope)) {
            return scope.some(s => bracketScopes.includes(s));
        }
        return bracketScopes.includes(scope);
    }

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

            // Remove any existing rules from this extension (handles both string and array scopes)
            globalColorCustomizations['textMateRules'] = globalColorCustomizations['textMateRules'].filter(rule =>
                !isOurRule(rule)
            );

            if (!bracketsColored) {
                // Add a single rule with all scopes as an array
                globalColorCustomizations['textMateRules'].push({
                    scope: bracketScopes,
                    settings: {
                        foreground: editorBackground
                    }
                });
                bracketsColored = true;
                vscode.window.setStatusBarMessage('Angle brackets: hidden (Global)', 2000);
            } else {
                bracketsColored = false;
                vscode.window.setStatusBarMessage('Angle brackets: visible (Global)', 2000);
            }

            await config.update(
                'editor.tokenColorCustomizations',
                globalColorCustomizations,
                vscode.ConfigurationTarget.Global
            );
        } catch (error) {
            console.error('Error toggling brackets:', error);
            vscode.window.showErrorMessage('Failed to toggle angle brackets visibility');
        }
    });

    context.subscriptions.push(toggleBrackets);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};