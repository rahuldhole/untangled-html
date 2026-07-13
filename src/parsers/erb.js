const vscode = require('vscode');
const { findHTMLBracketRanges } = require('./html');

// Matches <% ... %>, <%= ... %>, <%- ... -%>
const ERB_REGEX = /<%(?:-|=)?[\s\S]*?(?:-)?%>/g;

function findERBBracketRanges(document) {
    const text = document.getText();
    if (text.length > 500000) return [];

    // First get all the HTML bracket ranges
    const ranges = findHTMLBracketRanges(document);

    let match;

    // Process ERB tags
    while ((match = ERB_REGEX.exec(text)) !== null) {
        const tagStr = match[0];
        const startIdx = match.index;

        // Opening bracket: <% or <%= or <%-
        let openLen = 2; // <%
        if (tagStr.startsWith('<%=')) openLen = 3;
        else if (tagStr.startsWith('<%-')) openLen = 3;
        
        ranges.push(new vscode.Range(
            document.positionAt(startIdx),
            document.positionAt(startIdx + openLen)
        ));

        // Closing bracket: %> or -%>
        let closeLen = 2; // %>
        if (tagStr.endsWith('-%>')) closeLen = 3;
        
        ranges.push(new vscode.Range(
            document.positionAt(startIdx + tagStr.length - closeLen),
            document.positionAt(startIdx + tagStr.length)
        ));
    }

    return ranges;
}

module.exports = {
    findERBBracketRanges,
    ERB_REGEX
};
