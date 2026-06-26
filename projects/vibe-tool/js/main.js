const form = document.getElementById('generator-form');
const output = document.getElementById('output');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');

function generateTemplate() {
  const title = document.getElementById('title').value || 'My Vibe Project';
  const author = document.getElementById('author').value || 'Anonymous';
  const description = document.getElementById('description').value || 'A beautiful vibe-coded experience.';
  const tags = document.getElementById('tags').value || 'vibe, static';

  const hasCanvas = document.getElementById('has-canvas').checked;
  const separateFiles = document.getElementById('separate-files').checked;
  const includeThree = document.getElementById('include-three').checked;
  const darkVibe = document.getElementById('dark-vibe').checked;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,700;1,400&family=JetBrains+Mono:wght@300;500;700&display=swap" rel="stylesheet">
  ${separateFiles ? '<link rel="stylesheet" href="css/style.css">' : '<style>' + getCSS(darkVibe) + '</style>'}
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p class="author">by ${author}</p>
    <p>${description}</p>
    
    ${hasCanvas ? '<canvas id="canvas" width="800" height="500"></canvas>' : '<div class="placeholder">Your content here</div>'}
    
    <div class="controls">
      <button id="action-btn">Do something vibe-y</button>
    </div>
  </div>

  ${separateFiles ? '<script src="js/main.js"></script>' : '<script>' + getJS(hasCanvas, includeThree) + '</script>'}
</body>
</html>`;

  let css = separateFiles ? getCSS(darkVibe) : '';
  let js = separateFiles ? getJS(hasCanvas, includeThree) : '';

  if (separateFiles) {
    output.innerHTML = `
      <h3>index.html</h3>
      <textarea readonly style="width:100%;height:200px;font-family:JetBrains Mono,monospace;">${escapeHtml(html)}</textarea>
      
      <h3>css/style.css</h3>
      <textarea readonly style="width:100%;height:150px;font-family:JetBrains Mono,monospace;">${escapeHtml(css)}</textarea>
      
      <h3>js/main.js</h3>
      <textarea readonly style="width:100%;height:150px;font-family:JetBrains Mono,monospace;">${escapeHtml(js)}</textarea>
      
      <p style="margin-top:16px;font-size:13px;color:var(--ash);">Copy these into a folder called <code>my-vibe-project/</code> with the proper subfolders.</p>
    `;
  } else {
    output.innerHTML = `
      <h3>Full single-file index.html (copy-paste ready)</h3>
      <textarea readonly style="width:100%;height:400px;font-family:JetBrains Mono,monospace;">${escapeHtml(html)}</textarea>
    `;
  }

  // Store for download
  window._generated = { html, css, js, title };
}

function getCSS(darkVibe) {
  return `:root {
  --bg-deep: ${darkVibe ? '#08050a' : '#f8f4eb'};
  --bone: ${darkVibe ? '#e8dcc8' : '#1a1510'};
  --ash: ${darkVibe ? '#8a7d6f' : '#5a5248'};
  --crimson: #dc2626;
  --amber: #fbbf24;
}

body {
  margin: 0;
  padding: 40px 20px;
  background: var(--bg-deep);
  color: var(--bone);
  font-family: 'Cormorant Garamond', serif;
  line-height: 1.6;
}

.container { max-width: 800px; margin: 0 auto; }
h1 { font-size: 42px; font-weight: 300; }
.author { color: var(--ash); font-style: italic; }
.placeholder { border: 2px dashed var(--ash); padding: 60px; text-align: center; margin: 30px 0; }
canvas { border: 1px solid rgba(232,220,200,0.2); background: #111; display: block; margin: 20px 0; }
button { background: var(--crimson); color: white; border: none; padding: 12px 24px; font-family: 'JetBrains Mono', monospace; cursor: pointer; }`;
}

function getJS(hasCanvas, includeThree) {
  let code = `// Main logic for ${hasCanvas ? 'canvas' : 'your'} project
document.getElementById('action-btn').addEventListener('click', () => {
  alert('Hello from your vibe project!');
});`;

  if (hasCanvas) {
    code += `

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(canvas.width/2 + Math.sin(Date.now()/500)*50, canvas.height/2, 30, 0, Math.PI*2);
  ctx.fill();
  
  requestAnimationFrame(draw);
}
draw();`;
  }

  if (includeThree) {
    code += `

// Three.js example (load three.js in HTML if using this)
console.log('%c[Three.js] Add <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script> if you want 3D', 'color:#8a7d6f');
`;
  }

  return code;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

generateBtn.addEventListener('click', generateTemplate);

copyBtn.addEventListener('click', () => {
  const textareas = output.querySelectorAll('textarea');
  if (textareas.length === 0) return;
  
  let combined = '';
  textareas.forEach((ta, i) => {
    combined += `// === File ${i+1} ===\n${ta.value}\n\n`;
  });
  
  navigator.clipboard.writeText(combined).then(() => {
    const orig = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = orig, 1500);
  });
});

downloadBtn.addEventListener('click', () => {
  if (!window._generated) {
    alert('Generate first!');
    return;
  }
  
  const { html, title } = window._generated;
  const blob = new Blob([html], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = title.toLowerCase().replace(/\s+/g, '-') + '.html';
  a.click();
  URL.revokeObjectURL(url);
});

// Demo: auto-generate one on load for convenience
setTimeout(() => {
  if (!output.textContent.trim()) {
    // Pre-fill and generate a demo
    document.getElementById('title').value = 'My First Vibe Tool';
    document.getElementById('author').value = 'You';
    document.getElementById('description').value = 'A simple tool I made while exploring the vibe.';
    document.getElementById('has-canvas').checked = true;
    generateTemplate();
  }
}, 800);
