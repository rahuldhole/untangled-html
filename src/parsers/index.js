const { findHTMLBracketRanges } = require('./html');
const { findERBBracketRanges } = require('./erb');

const FALLBACK_EXTENSIONS = new Set([
    '.erb', '.blade'
]);

function getParserForDocument(document) {
    const fileName = document.fileName;
    let isErb = false;

    if (fileName) {
        const dotIdx = fileName.lastIndexOf('.');
        if (dotIdx !== -1) {
            const ext = fileName.substring(dotIdx).toLowerCase();
            if (ext === '.erb') {
                isErb = true;
            }
            // Handle double extensions like .html.erb
            const secondDotIdx = fileName.lastIndexOf('.', dotIdx - 1);
            if (secondDotIdx !== -1) {
                const doubleExt = fileName.substring(secondDotIdx).toLowerCase();
                if (doubleExt === '.html.erb') {
                    isErb = true;
                }
            }
        }
    }

    if (document.languageId === 'erb' || isErb) {
        return findERBBracketRanges;
    }

    // Default to HTML parser
    return findHTMLBracketRanges;
}

module.exports = {
    getParserForDocument,
    FALLBACK_EXTENSIONS
};
