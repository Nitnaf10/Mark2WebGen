// -- IMPORT LIBRARY MARkED --
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
document.head.appendChild(script);

// -- GLOBAL STYLES & STATE --
let blockquoteStylesList = [
  `blockquote{border-left:5px solid #ccc;padding-left:10px;margin:1em 0;}`,
  `blockquote{position:relative;margin:1em 0;font-style:italic;display:inline;padding-right:.9em;}
  blockquote::before{position:absolute;left:-0.5em;top:-0.5em;content:'"';font-family:Arial,sans-serif;font-size:2em;color:#ccc;}
  blockquote::after{position:absolute;transform:rotate(180deg);content:'"';font-family:Arial,sans-serif;font-size:2em;color:#ccc;right:0;}`
];

let blockquoteStylesToApply = blockquoteStylesList[0];
let faviconDataUrl = null;

// -- SANITIZE HTML-TAGGED MARKDOWN TEXT --
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[m];
  });
}

// -- MARKDOWN TO HTML CUSTOM PARSER --
function customMarkdownParse(markdown) {
  markdown = markdown
    .split('\n')
    .map(line => {
      if (line.startsWith('>')) return `> ${line.slice(1)}`; // quote
      return line.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // neutralize HTML
    })
    .join('\n');
  return marked.parse(markdown);
}

// -- UPDATE OUTPUTS --
function updateOutput() {
  const markdown = document.getElementById("MarkdownInput").value;
  const css = formatCSS(document.getElementById("CssInput").value);
  const liPuce = document.getElementById("lipuce").value || "•";
  const title = document.getElementById("pagename").value || "Projet";
  const htmlOutput = customMarkdownParse(markdown);

  // Render HTML
  document.getElementById("HtmlOutput").innerHTML = `<style>
li::marker{content:"${liPuce} "}
${blockquoteStylesToApply}
${css}
</style>${htmlOutput}`;

  // Format & Generate HTML code
  const formattedHtmlCode = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css" />
  ${faviconDataUrl ? `<link rel="icon" href="logo.${faviconDataUrl.type.split("/")[1]}" />` : ""}
</head>
<body>
${htmlOutput}
</body>
</html>`.trim();

  document.getElementById("HtmlCodeOutput").value = formattedHtmlCode;
}

// -- CSS FORMATTER --
function formatCSS(css) {
  return css
    .replace(/;/g, ';\n')
    .replace(/\}/g, '}\n')
    .replace(/\{/g, '{\n')
    .trim();
}

// -- FILE DOWNLOAD HELPERS --
function downloadFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// -- EXPORT ZIP --
document.getElementById("archbtn").addEventListener("click", async () => {
  const zip = new JSZip();
  const title = document.getElementById("pagename").value || "Projet";
  const css = formatCSS(document.getElementById("CssInput").value);
  const html = document.getElementById("HtmlCodeOutput").value;

  zip.file("styles.css", css);
  zip.file(`${title || 'Index'}.html`, html);
  if (faviconDataUrl) zip.file(`logo.${faviconDataUrl.type.split("/")[1]}`, faviconDataUrl.blob);
  const content = await zip.generateAsync({ type: "blob" });
  downloadFile(`${title || "Projet"}.zip`, content, "application/zip");
});

// -- EXPORT CSS & HTML INDIVIDUELS --
document.getElementById("cssbtn").addEventListener("click", () => {
  const css = formatCSS(document.getElementById("CssInput").value);
  downloadFile("styles.css", css, "text/css");
});

document.getElementById("htmlbtn").addEventListener("click", () => {
  const html = document.getElementById("HtmlCodeOutput").value;
  downloadFile("index.html", html, "text/html");
});

// -- LOGO IMAGE UPLOAD --
document.getElementById("imginput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    faviconDataUrl = {
      blob: file,
      type: file.type,
      dataURL: reader.result
    };
    document.getElementById("logopreview").src = reader.result;
  };
  reader.readAsDataURL(file);
});

// -- INIT --
["MarkdownInput", "CssInput", "pagename", "lipuce"].forEach(id =>
  document.getElementById(id).addEventListener("input", updateOutput)
);
updateOutput();
