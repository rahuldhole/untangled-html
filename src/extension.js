const vscode = require('vscode');
const { getParserForDocument, FALLBACK_EXTENSIONS } = require('./parsers');

function activate(context) {
    let isHidden = context.globalState.get('untangledHtml.isHidden', true);
    let decorationType = null;
    let debounceTimer = null;

    // ─── TextMate Scopes ──────────────────────────────────────────────
    // Used for languages with proper grammar support (HTML, JSX, TSX, etc.)
    // TextMate prefix matching means 'punctuation.definition.tag' also
    // matches '.begin.html', '.end.jsx', '.begin.svelte', etc.
    const bracketScopes = [
        // Broad catch-all
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

    // Languages where TextMate scopes reliably handle bracket hiding
    // (these have proper grammar support built-in or via popular extensions)
    const GRAMMAR_LANGUAGES = new Set([
        'html', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact',
        'php', 'handlebars', 'xml', 'xsl', 'svg',
    ]);

    // ─── Helpers ──────────────────────────────────────────────────────

    function isOurRule(rule) {
        const scope = rule.scope;
        if (Array.isArray(scope)) {
            return scope.some(s => bracketScopes.includes(s));
        }
        return bracketScopes.includes(scope);
    }


    /** Returns true if the editor's language or file extension needs the decoration fallback */
    function needsDecorationFallback(editor) {
        if (!editor || !editor.document) return false;
        
        const fileName = editor.document.fileName;
        if (fileName) {
            const dotIdx = fileName.lastIndexOf('.');
            if (dotIdx !== -1) {
                const ext = fileName.substring(dotIdx).toLowerCase();
                if (FALLBACK_EXTENSIONS.has(ext)) {
                    return true;
                }
                // Handle double extensions like .html.erb
                const secondDotIdx = fileName.lastIndexOf('.', dotIdx - 1);
                if (secondDotIdx !== -1) {
                    const doubleExt = fileName.substring(secondDotIdx).toLowerCase();
                    if (doubleExt === '.html.erb') {
                        return true;
                    }
                }
            }
        }
        
        return !GRAMMAR_LANGUAGES.has(editor.document.languageId);
    }

    /** Apply regex-based decorations to editors that need them */
    function applyDecorations() {
        if (!isHidden || !decorationType) return;
        for (const editor of vscode.window.visibleTextEditors) {
            if (needsDecorationFallback(editor)) {
                const parseFn = getParserForDocument(editor.document);
                const ranges = parseFn(editor.document);
                editor.setDecorations(decorationType, ranges);
            } else {
                // Clear decorations for grammar-supported editors (textMateRules handle them)
                editor.setDecorations(decorationType, []);
            }
        }
    }

    /** Debounced version for text change events */
    function debouncedApplyDecorations() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => applyDecorations(), 300);
    }

    // ─── TextMate Rules Management ────────────────────────────────────

    async function updateTextMateRules(hide, editorBackground) {
        const config = vscode.workspace.getConfiguration();
        const inspection = config.inspect('editor.tokenColorCustomizations');
        const globalColorCustomizations = inspection.globalValue ? JSON.parse(JSON.stringify(inspection.globalValue)) : {};

        let currentRules = globalColorCustomizations['textMateRules'] || [];
        let newRules = currentRules.filter(rule => !isOurRule(rule));

        if (hide) {
            newRules.push({
                scope: bracketScopes,
                settings: { foreground: editorBackground }
            });
        }

        if (JSON.stringify(currentRules) !== JSON.stringify(newRules)) {
            globalColorCustomizations['textMateRules'] = newRules;
            await config.update(
                'editor.tokenColorCustomizations',
                globalColorCustomizations,
                vscode.ConfigurationTarget.Global
            );
        }
    }

    // ─── State Management ─────────────────────────────────────────────

    async function applyCurrentState(showStatus = false) {
        try {
            const editorConfig = vscode.workspace.getConfiguration('editor');
            const editorBackground = editorConfig.get('background') || '#00000000';

            if (isHidden) {
                await updateTextMateRules(true, editorBackground);
                if (!decorationType) {
                    decorationType = vscode.window.createTextEditorDecorationType({
                        color: 'transparent',
                        opacity: '0'
                    });
                }
                applyDecorations();
                if (showStatus) vscode.window.setStatusBarMessage('Angle brackets: hidden (Global)', 2000);
            } else {
                await updateTextMateRules(false);
                if (decorationType) {
                    decorationType.dispose();
                    decorationType = null;
                }
                if (showStatus) vscode.window.setStatusBarMessage('Angle brackets: visible (Global)', 2000);
            }
            await context.globalState.update('untangledHtml.isHidden', isHidden);
        } catch (error) {
            console.error('Error applying state:', error);
            if (showStatus) vscode.window.showErrorMessage('Failed to apply angle brackets visibility');
        }
    }

    // Apply default state on startup
    applyCurrentState();

    // ─── Toggle Command ───────────────────────────────────────────────

    const toggleBrackets = vscode.commands.registerCommand('extension.toggleBrackets', async () => {
        isHidden = !isHidden;
        await applyCurrentState(true);
    });

    // ─── Event Listeners ──────────────────────────────────────────────
    // Re-apply decorations when editors change or text is modified

    context.subscriptions.push(
        toggleBrackets,
        vscode.window.onDidChangeActiveTextEditor(() => applyDecorations()),
        vscode.window.onDidChangeVisibleTextEditors(() => applyDecorations()),
        vscode.workspace.onDidChangeTextDocument((e) => {
            if (!isHidden || !decorationType) return;
            const editor = vscode.window.visibleTextEditors.find(
                ed => ed.document === e.document
            );
            if (editor && needsDecorationFallback(editor)) {
                debouncedApplyDecorations();
            }
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};