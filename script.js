const markdownInput = document.getElementById('MarkdownInput'),
    cssInput = document.getElementById('CssInput'),
    htmlOutput = document.getElementById('HtmlOutput'),
    htmlCodeOutput = document.getElementById('HtmlCodeOutput'),
    lipuceInput = document.getElementById('lipuce'),
    archbtn = document.getElementById('archbtn'),
    cssbtn = document.getElementById('cssbtn'),
    htmlbtn = document.getElementById('htmlbtn'),
    cssPreview = document.getElementById('cssPreview'); // Ajout du div pour l'aperçu

const blockquoteStylesList = [
    `blockquote{position:relative;border-left:5px solid #ccc;padding-left:10px;margin:1em 0;}`,
    `blockquote{position:relative;margin:1em 0;font-style:italic;display:inline;
  padding-right: .9em;}
    blockquote::before{position:absolute;left:-0.5em;top:-0.5em;content:'"';font-family:Arial,sans-serif;font-size:2em;color:#ccc;}
    blockquote::after{position:absolute;transform:rotate(180deg);content:'"';font-family:Arial,sans-serif;font-size:2em;color:#ccc;right: 0;}`
];

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

    let fullCss = `${formattedCss} ${formatCSS(blockquoteStylesToApply)}`;
    if (customBullet) {
        let buletcss = `
ul {list-style: none;}
ul li::before {content: '${customBullet.replace(/'/g, "\\'")}';color: inherit;display: inline-block;width: auto;margin-right: .5em;}
`;
        fullCss += buletcss;
    }

    // Injecter le CSS généré dans la section d'aperçu
    applyPreviewStyles(fullCss);
}


// Formatage du CSS
function formatCSS(css) {
    return css
        .replace(/\/\*.*?\*\//gs, '') // Supprime les commentaires
        .replace(/\s*{\s*/g, ' {\n  ') // Ajoute un retour à la ligne après '{'
        .replace(/;\s*/g, ';\n  ') // Ajoute un retour à la ligne après ';'
        .replace(/\s*}\s*/g, '\n}\n\n') // Ajoute un retour à la ligne avant '}'
        .replace(/\n\s*\n/g, '\n') // Supprime les lignes vides
        .replace(/:\s*(?!['"][^'"]*['"])/g, ': ') // Formate les ":"
        .replace(/:\s*:\s*/g, '::') // Corrige les espaces supplémentaires autour des "::"
        .trim(); // Supprime les espaces au début et à la fin
}



// Formatage de l'HTML
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

// Conversion du Markdown en HTML
function convertMarkdownToHTML(markdown) {
    markdown = markdown.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
        .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
        .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/^\s*> (.*)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^[-*_]{3,}$/gm, '<hr>')
        .replace(/^\s*[-*+] (.*)$/gm, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\n<ul>/g, '\n')
        .replace(/^\s*\d+\. (.*)$/gm, '<ol><li>$1</li></ol>')
        .replace(/<\/ol>\n<ol>/g, '\n')
        .replace(/\n{2,}/g, '</p><p>');

    markdown = `<p>${markdown}</p>`.replace(/<p>\s*<\/p>/g, '');
    return markdown;
}

// Appliquer les styles dans le div d'aperçu
// Appliquer les styles dans le div d'aperçu
function applyPreviewStyles(css) {
    // Créer une balise <style> pour appliquer les styles à l'aperçu
    let styleElement = document.getElementById('previewStyles');
    
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'previewStyles';
        document.head.appendChild(styleElement);
    }
    
    // Envelopper le CSS généré dans .output {}
    styleElement.innerHTML = `.output { ${css} }`;
}


// Fonction pour télécharger un fichier
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Générer le fichier HTML avec lien vers le CSS
function handleHtmlBtnClick() {
    const formattedHtml = formatHTML(htmlOutput.innerHTML);

    // Créer l'HTML complet avec DOCTYPE, head et lien vers le CSS
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

// Générer et télécharger le fichier CSS
function handleCssBtnClick() {
    const markdownText = markdownInput.value;
    const rawCss = cssInput.value;
    const formattedCss = formatCSS(rawCss);
    const customBullet = lipuceInput.value.trim();

    let fullCss = `${formattedCss}\n${blockquoteStylesToApply}`;
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

    // Télécharger le fichier CSS complet
    downloadFile(fullCss, 'styles.css', 'text/css');
}

// Fonction pour créer l'archive
function handleArchBtnClick() {
    const zip = new JSZip();

    // Ajouter le fichier HTML
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

    // Ajouter le fichier CSS
    const markdownText = markdownInput.value;
    const rawCss = cssInput.value;
    const formattedCss = formatCSS(rawCss);
    const customBullet = lipuceInput.value.trim();

    let fullCss = `${formattedCss}\n${blockquoteStylesToApply}`;
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

    // Générer l'archive ZIP
    zip.generateAsync({ type: "blob" })
        .then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "archive.zip";
            link.click();
        });
}

// Événements pour les boutons
archbtn.addEventListener('click', handleArchBtnClick);
cssbtn.addEventListener('click', handleCssBtnClick);
htmlbtn.addEventListener('click', handleHtmlBtnClick);

lipuceInput.addEventListener('input', updateOutput);
markdownInput.addEventListener('input', updateOutput);
cssInput.addEventListener('input', updateOutput);
updateOutput();
