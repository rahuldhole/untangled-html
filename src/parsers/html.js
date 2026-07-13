const vscode = require('vscode');

// Match complete HTML/XML-like tags:
//   <tag ...>   </tag>   <tag ... />   <!-- ... -->   <!DOCTYPE ...>
// The character class handles:
//   [^>"'{}]  — any char except >, ", ', {, } (stops at tag close)
//   "[^"]*"   — double-quoted strings (allows > inside quotes)
//   '[^']*'   — single-quoted strings (allows > inside quotes)
//   \{[^{}]*(?:\{[^{}]*\}[^{}]*)*\} — expression blocks (allows one level of nested curly braces like style={{color:'red'}})
//   <%.*?%>   — embedded logic blocks like ERB
const TAG_REGEX = /<\/?\s*[a-zA-Z][\w\-.:]*(?:\s(?:[^>"'{}]|"[^"]*"|'[^']*'|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|<%[\s\S]*?%>)*)?\s*\/?>/g;
const COMMENT_REGEX = /<!--[\s\S]*?-->/g;

function findHTMLBracketRanges(document) {
    const text = document.getText();
    if (text.length > 500000) return [];

    const ranges = [];
    let match;

    // Reset lastIndex — module-scope /g regexes retain state between calls
    TAG_REGEX.lastIndex = 0;
    COMMENT_REGEX.lastIndex = 0;

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

module.exports = {
    findHTMLBracketRanges,
    TAG_REGEX,
    COMMENT_REGEX
};
