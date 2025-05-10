const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
document.head.appendChild(script);

let blockquoteStylesList = [
  `blockquote{border-left:5px solid #ccc;padding-left:10px;margin:1em 0;}`,
  `blockquote { position: relative; margin: 1em 0;  font-style: italic;  display: inline-block;  padding: 1.5em 2em;  color: #333;}
  blockquote::before,blockquote::after {content: "";position: absolute;width: 24px;height: 24px;background-size: contain;background-repeat: no-repeat;opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 64 56'%3E%3Cpath fill='%23333' d='M29.866 0v24.286H14.79V26h.143c8.246 0 14.93 6.715 14.93 15 0 8.283-6.684 14.999-14.93 14.999C6.685 56 0 49.284 0 41q0-.215.006-.428H0V17.143C0 7.675 7.64 0 17.064 0zM64 0v24.286H48.923V26h.142c8.247 0 14.931 6.715 14.931 15 0 8.283-6.684 14.999-14.93 14.999-8.247 0-14.932-6.716-14.932-15q0-.215.006-.428h-.006V17.143C34.134 7.675 41.774 0 51.198 0z'/%3E%3C/svg%3E");
  }
blockquote::before {top: -0.5em;left: -1em;}
blockquote::after {bottom: -0.5em;right: -1em;transform: scaleX(-1);}`
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
  return `#HtmlOutput{h1,h2,strong,em{all:revert;}}
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
