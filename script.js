const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
document.head.appendChild(script);

let blockquoteStylesList = [
  `blockquote{border-left:5px solid #ccc;padding-left:10px;margin:1em 0;}`,
  `blockquote{position:relative;margin:1em 0;font-style:italic;display:inline;padding-right:.9em;}
  blockquote::before{position:absolute;left:-0.5em;top:-0.5em;content:'"';font-family:Arial,sans-serif;font-size:2em;color:#ccc;}
  blockquote::after{position:absolute;transform:rotate(180deg);content:'"';font-family:Arial,sans-serif;font-size:2em;color:#ccc;right:0;}`
];

let blockquoteStylesToApply = blockquoteStylesList[0];
let faviconDataUrl = null;

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

function customMarkdownParse(markdown) {
  markdown = markdown
    .split('\n')
    .map(line => line.startsWith('>') ? `> ${line.slice(1)}` : line.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    .join('\n');
  return marked.parse(markdown);
}

function prefixCss(css) {
  return css.split('\n').map(l => {
    const t = l.trim();
    return t === '' || t.startsWith('@') || t.startsWith('/*') || t.startsWith('//')
      ? l
      : l.replace(/^([^{]+)/, s => `#HtmlOutput ${s.trim()}`);
  }).join('\n');
}

function getBaseCss() {
  return `#HtmlOutput *{all:revert;}
#HtmlOutput pre{background:#f5f5f5;padding:1em;overflow:auto;border-radius:5px;font-family:monospace;font-size:.95em;line-height:1.4;margin:1em 0;white-space:pre-wrap;}
#HtmlOutput code{background:#f0f0f0;padding:.2em .4em;border-radius:3px;font-family:monospace;font-size:.95em;}
#HtmlOutput pre code{background:none;padding:0;border-radius:0;}`;
}

function updateOutput() {
  const m = document.getElementById("MarkdownInput").value,
        c = document.getElementById("CssInput").value,
        h = marked.parse(m, { breaks: true }),
        f = `${getBaseCss()}\n${prefixCss(c)}\n${blockquoteStylesToApply}`;
  document.getElementById("HtmlOutput").innerHTML = `<style>${f}</style>${h}`;
  document.getElementById("HtmlCodeOutput").value = formatHtml(h);
}

function formatHtml(html) {
  return html.trim(); // ou plus complexe si souhaité
}

function formatCSS(css) {
  return css.replace(/;/g, ';\n').replace(/\}/g, '}\n').replace(/\{/g, '{\n').trim();
}

function downloadFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("archbtn").addEventListener("click", async () => {
  const zip = new JSZip();
  const title = document.getElementById("pagename").value || "Projet";
  const css = `${getBaseCss()}\n${prefixCss(document.getElementById("CssInput").value)}\n${blockquoteStylesToApply}`;
  const html = document.getElementById("HtmlCodeOutput").value;
  zip.file("styles.css", formatCSS(css));
  zip.file(`${title}.html`, html);
  if (faviconDataUrl) zip.file(`logo.${faviconDataUrl.type.split("/")[1]}`, faviconDataUrl.blob);
  const content = await zip.generateAsync({ type: "blob" });
  downloadFile(`${title}.zip`, content, "application/zip");
});

document.getElementById("cssbtn").addEventListener("click", () => {
  const css = `${getBaseCss()}\n${prefixCss(document.getElementById("CssInput").value)}\n${blockquoteStylesToApply}`;
  downloadFile("styles.css", formatCSS(css), "text/css");
});

document.getElementById("htmlbtn").addEventListener("click", () => {
  const html = document.getElementById("HtmlCodeOutput").value;
  downloadFile("index.html", html, "text/html");
});

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

["MarkdownInput", "CssInput", "pagename", "lipuce"].forEach(id =>
  document.getElementById(id).addEventListener("input", updateOutput)
);
updateOutput();
