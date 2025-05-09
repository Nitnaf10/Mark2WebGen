const $ = id => document.getElementById(id);
const markdownInput = $('MarkdownInput'), cssInput = $('CssInput'), htmlOutput = $('HtmlOutput'), htmlCodeOutput = $('HtmlCodeOutput'), lipuceInput = $('lipuce'), archbtn = $('archbtn'), cssbtn = $('cssbtn'), htmlbtn = $('htmlbtn'), imgInput = $('imginput'), pageNameInput = $('pagename');

let uploadedLogo = null, uploadedLogoFormat = null;

// Styles CSS
const blockquoteCSS = `blockquote{position:relative;border-left:5px solid #ccc;padding-left:10px;margin:1em 0;}`;
const codeCSS = `code,pre{background:#f4f4f4;font-family:monospace}code{padding:2px 4px;border-radius:3px;font-size:0.95em}pre{padding:1em;overflow-x:auto;border-radius:5px}pre code{background:none;padding:0;font-size:inherit}`;
const lipuceCSS = bullet => bullet ? `
ul{list-style:none}
ul li::before{content:'${bullet.replace(/'/g, "\\'")}';margin-right:0.5em}` : '';

// Fonctions utilitaires
const escapeHtml = s => s.replace(/[<>"']/g, m => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const formatHTML = html => html.replace(/></g, '>\n<').replace(/<\/(ul|ol|p)>/g, '</$1>\n').trim();
const formatCSS = css => css.replace(/\/\*.*?\*\//gs, '').replace(/\s*{\s*/g, ' {\n  ').replace(/;\s*/g, ';\n  ').replace(/\s*}\s*/g, '\n}\n\n').replace(/\n\s*\n/g, '\n').replace(/:\s*/g, ': ').trim();
const applyPreviewStyles = css => { let style = $('previewStyles'); if (!style) { style = document.createElement('style'); style.id = 'previewStyles'; document.head.appendChild(style); } style.innerHTML = `.output { ${css} }`; };

// Conversion Markdown
function convertMarkdown(md) {
  return `<p>${escapeHtml(md)
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
    .replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${escapeHtml(c)}</code></pre>`)  // Conversion des blocs de code
    .replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
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

// Mise à jour du contenu et application des styles
function updateOutput() {
  const raw = markdownInput.value, cssRaw = cssInput.value, bullet = lipuceInput.value.trim(), title = pageNameInput.value.trim();
  const html = convertMarkdown(raw);
  htmlOutput.innerHTML = html;
  htmlCodeOutput.value = formatHTML(html);

  let fullCss = formatCSS(cssRaw) + '\n' + blockquoteCSS;
  if (html.includes('<code>')) fullCss += '\n' + codeCSS;
  fullCss += lipuceCSS(bullet);
  applyPreviewStyles(fullCss);
  if (title) document.title = title;
}

// Gestion du logo téléchargé
function handleFileInputChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadedLogoFormat = file.name.split('.').pop().toLowerCase();

  const reader = new FileReader();
  reader.onload = ev => {
    uploadedLogo = ev.target.result;
    const img = document.createElement('img');
    img.src = uploadedLogo;
    img.alt = 'Logo sélectionné';
    img.style.maxHeight = '40px';
    img.style.cursor = 'pointer';
    imgInput.replaceWith(img);
    updateFavicon(uploadedLogo);
  };
  reader.readAsDataURL(file);
}

// Mise à jour de la favicon
function updateFavicon(dataUrl) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = dataUrl;
}

// Téléchargement de fichier
function downloadFile(content, name, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

// Construction du fichier HTML
function buildHTMLDocument() {
  const title = pageNameInput.value.trim() || 'Document généré';
  const body = formatHTML(htmlOutput.innerHTML);
  const faviconTag = uploadedLogo ? `<link rel="icon" href="logo.${uploadedLogoFormat}">` : '';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="styles.css">
  ${faviconTag}
</head>
<body>
${body}
</body>
</html>`;
}

// Gestion des téléchargements
function handleDownloadHTML() {
  downloadFile(buildHTMLDocument(), 'document.html', 'text/html');
}

function handleDownloadCSS() {
  let css = formatCSS(cssInput.value) + '\n' + blockquoteCSS;
  if (htmlOutput.innerHTML.includes('<code>')) css += '\n' + codeCSS;
  css += lipuceCSS(lipuceInput.value.trim());
  downloadFile(css, 'styles.css', 'text/css');
}

function handleDownloadZip() {
  const zip = new JSZip();
  zip.file('document.html', buildHTMLDocument());

  let css = formatCSS(cssInput.value) + '\n' + blockquoteCSS;
  if (htmlOutput.innerHTML.includes('<code>')) css += '\n' + codeCSS;
  css += lipuceCSS(lipuceInput.value.trim());
  zip.file('styles.css', css);

  if (uploadedLogo) {
    const base64 = uploadedLogo.split(',')[1];
    zip.file(`logo.${uploadedLogoFormat}`, base64, { base64: true });
  }

  zip.generateAsync({ type: 'blob' }).then(blob => {
    downloadFile(blob, 'archive.zip', 'application/zip');
  });
}

// Listeners
[markdownInput, cssInput, lipuceInput, pageNameInput].forEach(el => el.addEventListener('input', updateOutput));
imgInput.addEventListener('change', handleFileInputChange);
htmlbtn.addEventListener('click', handleDownloadHTML);
cssbtn.addEventListener('click', handleDownloadCSS);
archbtn.addEventListener('click', handleDownloadZip);

updateOutput();
