const $ = id => document.getElementById(id);
const markdownInput = $('MarkdownInput'), cssInput = $('CssInput'), htmlOutput = $('HtmlOutput'), htmlCodeOutput = $('HtmlCodeOutput'), lipuceInput = $('lipuce'), archbtn = $('archbtn'), cssbtn = $('cssbtn'), htmlbtn = $('htmlbtn'), imgInput = $('imginput'), pageNameInput = $('pagename');

let uploadedLogo = null, uploadedLogoFormat = null;

const styles = {
  blockquote: `blockquote{position:relative;border-left:5px solid #ccc;padding-left:10px;margin:1em 0;}`,
  code: `code,pre{background:#f4f4f4;font-family:monospace}code{padding:2px 4px;border-radius:3px;font-size:0.95em}pre{padding:1em;overflow-x:auto;border-radius:5px}pre code{background:none;padding:0;font-size:inherit}`
};

function escapeHtml(str) {
  return str.replace(/[<>"']/g, m => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function convertMarkdown(md) {
  return `<p>${escapeHtml(md)
    .replace(/^###### (.*)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
    .replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${escapeHtml(c)}</code></pre>`)
    .replace(/^\s*> (.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\s*[-*_]{3,}$/gm, '<hr>')
    .replace(/^\s*[-*+] (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/^\s*\d+\. (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>')
    .replace(/\n{2,}/g, '</p><p>').replace(/<p>\s*<\/p>/g, '')
  }</p>`;
}

function formatHTML(html) {
  return html.replace(/></g, '>\n<').replace(/<\/(ul|ol|p)>/g, '</$1>\n').trim();
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

function applyStyles(css) {
  let style = $('previewStyles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'previewStyles';
    document.head.appendChild(style);
  }
  style.innerHTML = `.output { ${css} }`;
}

function updateOutput() {
  const md = markdownInput.value, cssRaw = cssInput.value, bullet = lipuceInput.value.trim(), html = convertMarkdown(md);
  htmlOutput.innerHTML = html;
  htmlCodeOutput.value = formatHTML(html);
  let fullCss = formatCSS(cssRaw) + '\n' + styles.blockquote;

  if (html.includes('<code>')) fullCss += '\n' + styles.code;
  if (bullet) fullCss += `\nul{list-style:none}ul li::before{content:'${bullet.replace(/'/g, "\\'")}';margin-right:0.5em}`;

  applyStyles(fullCss);
  if (pageNameInput.value.trim()) document.title = pageNameInput.value.trim();
}

function handleLogoInput(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadedLogoFormat = file.name.split('.').pop().toLowerCase();

  const reader = new FileReader();
  reader.onload = ev => {
    uploadedLogo = ev.target.result;
    const img = document.createElement('img');
    img.src = uploadedLogo;
    img.alt = 'Logo';
    img.style.maxHeight = '40px';
    img.style.cursor = 'pointer';
    imgInput.replaceWith(img);
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = uploadedLogo;
  };
  reader.readAsDataURL(file);
}

function downloadFile(content, name, type) {
  const blob = new Blob([content], { type }), link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}

function generateHTMLDocument() {
  const title = pageNameInput.value.trim() || 'Document généré';
  const html = formatHTML(htmlOutput.innerHTML);
  const favicon = uploadedLogo ? `<link rel="icon" href="logo.${uploadedLogoFormat}">` : '';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="styles.css">
  ${favicon}
</head>
<body>
${html}
</body>
</html>`;
}

function handleDownloadHTML() {
  const html = generateHTMLDocument();
  downloadFile(html, 'document.html', 'text/html');
}

function handleDownloadCSS() {
  let css = formatCSS(cssInput.value) + '\n' + styles.blockquote;
  if (htmlOutput.innerHTML.includes('<code>')) css += '\n' + styles.code;
  if (lipuceInput.value.trim()) css += `\nul{list-style:none}ul li::before{content:'${lipuceInput.value.trim().replace(/'/g, "\\'")}';margin-right:0.5em}`;
  downloadFile(css, 'styles.css', 'text/css');
}

function handleDownloadZip() {
  const zip = new JSZip();
  zip.file('document.html', generateHTMLDocument());

  let css = formatCSS(cssInput.value) + '\n' + styles.blockquote;
  if (htmlOutput.innerHTML.includes('<code>')) css += '\n' + styles.code;
  if (lipuceInput.value.trim()) css += `\nul{list-style:none}ul li::before{content:'${lipuceInput.value.trim().replace(/'/g, "\\'")}';margin-right:0.5em}`;
  zip.file('styles.css', css);

  if (uploadedLogo) {
    zip.file(`logo.${uploadedLogoFormat}`, uploadedLogo.split(',')[1], { base64: true });
  }

  zip.generateAsync({ type: 'blob' }).then(blob => {
    downloadFile(blob, 'archive.zip', 'application/zip');
  });
}

// Événements
[markdownInput, cssInput, lipuceInput, pageNameInput].forEach(el => el.addEventListener('input', updateOutput));
imgInput.addEventListener('change', handleLogoInput);
htmlbtn.addEventListener('click', handleDownloadHTML);
cssbtn.addEventListener('click', handleDownloadCSS);
archbtn.addEventListener('click', handleDownloadZip);

updateOutput();
