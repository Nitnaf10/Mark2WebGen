const markdownInput = document.getElementById('MarkdownInput');
const cssInput = document.getElementById('CssInput');
const htmlOutput = document.getElementById('HtmlOutput');
const htmlCodeOutput = document.getElementById('HtmlCodeOutput');
const lipuceInput = document.getElementById('lipuce');
const archbtn = document.getElementById('archbtn');
const cssbtn = document.getElementById('cssbtn');
const htmlbtn = document.getElementById('htmlbtn');
const imgInput = document.getElementById('imginput');
const pageNameInput = document.getElementById('pagename');

let blockquoteStylesToApply = `
blockquote {
  position: relative;
  border-left: 5px solid #ccc;
  padding-left: 10px;
  margin: 1em 0;
}`;

const codeBlockStyle = `
code, pre {
  background-color: #f4f4f4;
  font-family: monospace;
}
code {
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.95em;
}
pre {
  padding: 1em;
  overflow-x: auto;
  border-radius: 5px;
}
pre code {
  background: none;
  padding: 0;
  font-size: inherit;
}
`;

let uploadedLogo = null;
let uploadedLogoFormat = null;

function updateOutput() {
  const markdownText = markdownInput.value;
  const cssText = cssInput.value;
  const bullet = lipuceInput.value.trim();

  const rawHtml = convertMarkdownToHTML(markdownText);
  const formattedHtml = formatHTML(rawHtml);
  htmlOutput.innerHTML = rawHtml;
  htmlCodeOutput.value = formattedHtml;

  let fullCss = formatCSS(cssText) + '\n' + blockquoteStylesToApply;

  if (rawHtml.includes('<code>')) {
    fullCss += '\n' + codeBlockStyle;
  }

  if (bullet) {
    fullCss += `
ul {
  list-style: none;
}
ul li::before {
  content: '${bullet.replace(/'/g, "\\'")}';
  display: inline-block;
  margin-right: 0.5em;
}
    `;
  }

  applyPreviewStyles(fullCss);

  // Change title
  const titleText = pageNameInput.value.trim();
  if (titleText) {
    document.title = titleText;
  }
}

function convertMarkdownToHTML(markdown) {
  return `<p>${escapeHtml(markdown)
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
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code)}</code></pre>`)
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
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

function escapeHtml(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatHTML(html) {
  return html.replace(/></g, '>\n<')
    .replace(/<\/(ul|ol|p)>/g, '</$1>\n')
    .trim();
}

function formatCSS(css) {
  return css.replace(/\/\*.*?\*\//gs, '')
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/;\s*/g, ';\n  ')
    .replace(/\s*}\s*/g, '\n}\n\n')
    .replace(/\n\s*\n/g, '\n')
    .replace(/:\s*/g, ': ')
    .trim();
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

function handleFileInputChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const format = file.name.split('.').pop().toLowerCase();
  uploadedLogoFormat = format;

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    uploadedLogo = dataUrl;

    // Affiche le logo sélectionné à la place du bouton
    const preview = document.createElement('img');
    preview.src = dataUrl;
    preview.alt = 'Logo sélectionné';
    preview.style.maxHeight = '40px';
    preview.style.cursor = 'pointer';

    imgInput.replaceWith(preview);

    // Met à jour la favicon
    updateFavicon(dataUrl);
  };
  reader.readAsDataURL(file);
}

function updateFavicon(dataUrl) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = dataUrl;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function handleDownloadHTML() {
  const formattedHtml = formatHTML(htmlOutput.innerHTML);
  const pageTitle = pageNameInput.value.trim() || 'Document généré';
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(pageTitle)}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="logo.${uploadedLogoFormat || 'png'}">
</head>
<body>
${formattedHtml}
</body>
</html>`;

  downloadFile(htmlContent, 'document.html', 'text/html');
}

function handleDownloadCSS() {
  let css = formatCSS(cssInput.value) + '\n' + blockquoteStylesToApply;

  if (htmlOutput.innerHTML.includes('<code>')) {
    css += '\n' + codeBlockStyle;
  }

  if (lipuceInput.value.trim()) {
    css += `
ul { list-style: none; }
ul li::before {
  content: '${lipuceInput.value.trim().replace(/'/g, "\\'")}';
  margin-right: 0.5em;
}`;
  }

  downloadFile(css, 'styles.css', 'text/css');
}

function handleDownloadZip() {
  const zip = new JSZip();

  const pageTitle = pageNameInput.value.trim() || 'Document généré';

  const formattedHtml = formatHTML(htmlOutput.innerHTML);
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(pageTitle)}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="logo.${uploadedLogoFormat || 'png'}">
</head>
<body>
${formattedHtml}
</body>
</html>`;
  zip.file('document.html', htmlContent);

  let css = formatCSS(cssInput.value) + '\n' + blockquoteStylesToApply;

  if (formattedHtml.includes('<code>')) {
    css += '\n' + codeBlockStyle;
  }

  if (lipuceInput.value.trim()) {
    css += `
ul { list-style: none; }
ul li::before {
  content: '${lipuceInput.value.trim().replace(/'/g, "\\'")}';
  margin-right: 0.5em;
}`;
  }

  zip.file('styles.css', css);

  if (uploadedLogo) {
    const logoData = uploadedLogo.split(',')[1];
    zip.file(`logo.${uploadedLogoFormat}`, logoData, { base64: true });
  }

  zip.generateAsync({ type: 'blob' }).then(blob => {
    downloadFile(blob, 'archive.zip', 'application/zip');
  });
}

// Event listeners
markdownInput.addEventListener('input', updateOutput);
cssInput.addEventListener('input', updateOutput);
lipuceInput.addEventListener('input', updateOutput);
pageNameInput.addEventListener('input', updateOutput);
imgInput.addEventListener('change', handleFileInputChange);

archbtn.addEventListener('click', handleDownloadZip);
cssbtn.addEventListener('click', handleDownloadCSS);
htmlbtn.addEventListener('click', handleDownloadHTML);

updateOutput();
