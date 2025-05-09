const markdownInput = document.getElementById('MarkdownInput'),
    cssInput = document.getElementById('CssInput'),
    htmlOutput = document.getElementById('HtmlOutput'),
    htmlCodeOutput = document.getElementById('HtmlCodeOutput'),
    lipuceInput = document.getElementById('lipuce'),
    archbtn = document.getElementById('archbtn'),
    cssbtn = document.getElementById('cssbtn'),
    htmlbtn = document.getElementById('htmlbtn'),
    cssPreview = document.getElementById('cssPreview');

const blockquoteStylesList = [
    `blockquote{position:relative;border-left:5px solid #ccc;padding-left:10px;margin:1em 0;}`,
    `blockquote{position:relative;margin:1em 0;font-style:italic;display:inline;
  padding-right: .9em;}
    blockquote::before{position:absolute;left:-0.5em;top:-0.5em;content:'"';font-family:Arial,sans-serif;font-size:2em;color:#ccc;}
    blockquote::after{position:absolute;transform:rotate(180deg);content:'"';font-family:Arial,sans-serif;font-size:2em;color:#ccc;right: 0;}`
];

const codeBlockStyle = `
code {
  background-color: #f4f4f4;
  padding: 2px 4px;
  font-family: monospace;
  border-radius: 3px;
  font-size: 0.95em;
}
pre {
  background-color: #f4f4f4;
  padding: 1em;
  overflow-x: auto;
  font-family: monospace;
  border-radius: 5px;
}
pre code {
  background: none;
  padding: 0;
  font-size: inherit;
}
`;

let blockquoteStylesToApply = blockquoteStylesList[0];

function updateOutput() {
    const markdownText = markdownInput.value;
    const rawCss = cssInput.value;
    const formattedCss = formatCSS(rawCss);
    const customBullet = lipuceInput.value.trim();

    const rawHtml = convertMarkdownToHTML(markdownText);
    const formattedHtml = formatHTML(rawHtml);

    htmlOutput.innerHTML = rawHtml;
    htmlCodeOutput.value = formattedHtml;

    let fullCss = `${formattedCss}\n${blockquoteStylesToApply}`;

    if (rawHtml.includes('<code>')) {
        fullCss += '\n' + codeBlockStyle;
    }

    if (customBullet) {
        let buletcss = `
ul {list-style: none;}
ul li::before {content: '${customBullet.replace(/'/g, "\\'")}';color: inherit;display: inline-block;width: auto;margin-right: .5em;}
`;
        fullCss += buletcss;
    }

    applyPreviewStyles(fullCss);
}

function formatCSS(css) {
    return css
        .replace(/\/\*.*?\*\//gs, '')
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/\s*}\s*/g, '\n}\n\n')
        .replace(/\n\s*\n/g, '\n')
        .replace(/:\s*(?!['"][^'"]*['"])/g, ': ')
        .replace(/:\s*:\s*/g, '::')
        .trim();
}

function formatHTML(html) {
    return html
        .replace(/></g, '>\n<')
        .replace(/<li>/g, '  <li>')
        .replace(/<\/ul>/g, '</ul>\n')
        .replace(/<\/ol>/g, '</ol>\n')
        .replace(/<\/p>/g, '</p>\n')
        .replace(/<hr>/g, '<hr>\n')
        .trim();
}

function convertMarkdownToHTML(markdown) {
    return `<p>${markdown
        .replace(/^###### (.*)$/gm, '<h6>$1</h6>')
        .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
        .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^\s*> (.*)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^\s*[-*_]{3,}$/gm, '<hr>')
        .replace(/^\s*[-*+] (.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
        .replace(/^\s*\d+\. (.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/<p>\s*<\/p>/g, '')
    }</p>`;
}

function applyPreviewStyles(css) {
    let styleElement = document.getElementById('previewStyles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'previewStyles';
        document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = `.output { ${css} }`;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function handleHtmlBtnClick() {
    const formattedHtml = formatHTML(htmlOutput.innerHTML);
    const completeHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document généré</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    ${formattedHtml}
</body>
</html>
    `;
    downloadFile(completeHtml, 'document.html', 'text/html');
}

function handleCssBtnClick() {
    const rawCss = cssInput.value;
    const formattedCss = formatCSS(rawCss);
    const customBullet = lipuceInput.value.trim();

    let fullCss = `${formattedCss}\n${blockquoteStylesToApply}`;

    if (htmlOutput.innerHTML.includes('<code>')) {
        fullCss += '\n' + codeBlockStyle;
    }

    if (customBullet) {
        let buletcss = `
ul {
  list-style: none;
  padding-left: 1.5em;
}
ul li::before {
  content: '${customBullet.replace(/'/g, "\\'")}';
  color: inherit;
  display: inline-block;
  width: auto;
  margin-left: -1.5em;
}
`;
        fullCss += buletcss;
    }

    downloadFile(fullCss, 'styles.css', 'text/css');
}

function handleArchBtnClick() {
    const zip = new JSZip();
    const formattedHtml = formatHTML(htmlOutput.innerHTML);
    const completeHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document généré</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    ${formattedHtml}
</body>
</html>
    `;
    zip.file("document.html", completeHtml);

    const rawCss = cssInput.value;
    const formattedCss = formatCSS(rawCss);
    const customBullet = lipuceInput.value.trim();

    let fullCss = `${formattedCss}\n${blockquoteStylesToApply}`;

    if (htmlOutput.innerHTML.includes('<code>')) {
        fullCss += '\n' + codeBlockStyle;
    }

    if (customBullet) {
        let buletcss = `
ul {
  list-style: none;
  padding-left: 1.5em;
}
ul li::before {
  content: '${customBullet.replace(/'/g, "\\'")}';
  color: inherit;
  display: inline-block;
  width: auto;
  margin-left: -1.5em;
}
`;
        fullCss += buletcss;
    }

    zip.file("styles.css", fullCss);

    zip.generateAsync({ type: "blob" }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "archive.zip";
        link.click();
    });
}

archbtn.addEventListener('click', handleArchBtnClick);
cssbtn.addEventListener('click', handleCssBtnClick);
htmlbtn.addEventListener('click', handleHtmlBtnClick);

lipuceInput.addEventListener('input', updateOutput);
markdownInput.addEventListener('input', updateOutput);
cssInput.addEventListener('input', updateOutput);
updateOutput();
