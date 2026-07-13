const vscode = require('vscode');

function activate(context) {
    let isHidden = false;
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

    /**
     * Find angle bracket ranges in a document using regex.
     * Matches complete HTML/XML-like tags and extracts just the bracket characters.
     * Handles quoted attribute values and nested curly braces so that > inside them isn't misdetected.
     */
    function findTagBracketRanges(document) {
        const text = document.getText();
        // Skip very large files for performance
        if (text.length > 500000) return [];

        const ranges = [];
        let match;

        // Match complete HTML/XML-like tags:
        //   <tag ...>   </tag>   <tag ... />   <!-- ... -->   <!DOCTYPE ...>
        // The character class handles:
        //   [^>"'{}]  — any char except >, ", ', {, } (stops at tag close)
        //   "[^"]*"   — double-quoted strings (allows > inside quotes)
        //   '[^']*'   — single-quoted strings (allows > inside quotes)
        //   \{[^{}]*(?:\{[^{}]*\}[^{}]*)*\} — expression blocks (allows one level of nested curly braces like style={{color:'red'}})
        const TAG_REGEX = /<\/?\s*[a-zA-Z][\w\-.:]*(?:\s(?:[^>"'{}]|"[^"]*"|'[^']*'|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})*)?\s*\/?>/g;
        const COMMENT_REGEX = /<!--[\s\S]*?-->/g;

        // Process tags
        while ((match = TAG_REGEX.exec(text)) !== null) {
            const tagStr = match[0];
            const startIdx = match.index;

            // Opening bracket: < or </
            const openLen = tagStr.startsWith('</') ? 2 : 1;
            ranges.push(new vscode.Range(
                document.positionAt(startIdx),
                document.positionAt(startIdx + openLen)
            ));

            // Closing bracket: > or />
            const closeLen = tagStr.endsWith('/>') ? 2 : 1;
            ranges.push(new vscode.Range(
                document.positionAt(startIdx + tagStr.length - closeLen),
                document.positionAt(startIdx + tagStr.length)
            ));
        }

        // Process HTML comments: hide <!-- and -->
        while ((match = COMMENT_REGEX.exec(text)) !== null) {
            const startIdx = match.index;
            const endIdx = startIdx + match[0].length;

            // Hide <!--
            ranges.push(new vscode.Range(
                document.positionAt(startIdx),
                document.positionAt(startIdx + 4)
            ));
            // Hide -->
            ranges.push(new vscode.Range(
                document.positionAt(endIdx - 3),
                document.positionAt(endIdx)
            ));
        }

        return ranges;
    }

    const FALLBACK_EXTENSIONS = new Set([
        '.erb', '.blade'
    ]);

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
                const ranges = findTagBracketRanges(editor.document);
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
        const globalColorCustomizations = inspection.globalValue || {};

        if (!globalColorCustomizations['textMateRules']) {
            globalColorCustomizations['textMateRules'] = [];
        }

        // Remove existing rules from this extension
        globalColorCustomizations['textMateRules'] = globalColorCustomizations['textMateRules'].filter(
            rule => !isOurRule(rule)
        );

        if (hide) {
            // Add a single rule with all scopes as an array
            globalColorCustomizations['textMateRules'].push({
                scope: bracketScopes,
                settings: { foreground: editorBackground }
            });
        }

        await config.update(
            'editor.tokenColorCustomizations',
            globalColorCustomizations,
            vscode.ConfigurationTarget.Global
        );
    }

    // ─── Toggle Command ───────────────────────────────────────────────

    const toggleBrackets = vscode.commands.registerCommand('extension.toggleBrackets', async () => {
        try {
            const editorConfig = vscode.workspace.getConfiguration('editor');
            const editorBackground = editorConfig.get('background') || '#00000000';

            if (!isHidden) {
                // 1. Apply textMateRules for grammar-supported languages
                await updateTextMateRules(true, editorBackground);

                // 2. Create decoration type and apply for unsupported languages
                decorationType = vscode.window.createTextEditorDecorationType({
                    color: 'transparent',
                    opacity: '0'
                });
                isHidden = true;
                applyDecorations();

                vscode.window.setStatusBarMessage('Angle brackets: hidden (Global)', 2000);
            } else {
                // 1. Remove textMateRules
                await updateTextMateRules(false);

                // 2. Clear decorations
                if (decorationType) {
                    decorationType.dispose();
                    decorationType = null;
                }

                isHidden = false;
                vscode.window.setStatusBarMessage('Angle brackets: visible (Global)', 2000);
            }
        } catch (error) {
            console.error('Error toggling brackets:', error);
            vscode.window.showErrorMessage('Failed to toggle angle brackets visibility');
        }
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