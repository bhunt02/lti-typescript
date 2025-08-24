import showdown from 'showdown'
import * as path from 'path'
import * as fs from 'fs'
import { JSDOM } from 'jsdom'

const styles =
// language=css
`
html {
    box-sizing: border-box
}

body {
  padding: 2rem;
}

*,*:before,*:after {
    box-sizing: inherit
}

/* Extract from normalize.css by Nicolas Gallagher and Jonathan Neal git.io/normalize */
html {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%
}

body {
    margin: 0
}

article,aside,details,figcaption,figure,footer,header,main,menu,nav,section {
    display: block
}

summary {
    display: list-item
}

audio,canvas,progress,video {
    display: inline-block
}

progress {
    vertical-align: baseline
}

audio:not([controls]) {
    display: none;
    height: 0
}

[hidden],template {
    display: none
}

a {
    background-color: transparent
}

a:active,a:hover {
    outline-width: 0
}

abbr[title] {
    border-bottom: none;
    text-decoration: underline;
    text-decoration: underline dotted
}

b,strong {
    font-weight: bolder
}

dfn {
    font-style: italic
}

mark {
    background: #ff0;
    color: #000
}

small {
    font-size: 80%
}

sub,sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline
}

sub {
    bottom: -0.25em
}

sup {
    top: -0.5em
}

figure {
    margin: 1em 40px
}

img {
    border-style: none
}

code,kbd,pre,samp {
    font-family: monospace,monospace;
    font-size: 1em
}

hr {
    box-sizing: content-box;
    height: 0;
    overflow: visible
}

button,input,select,textarea,optgroup {
    font: inherit;
    margin: 0
}

optgroup {
    font-weight: bold
}

button,input {
    overflow: visible
}

button,select {
    text-transform: none
}

button,[type=button],[type=reset],[type=submit] {
    -webkit-appearance: button
}

button::-moz-focus-inner,[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner {
    border-style: none;
    padding: 0
}

button:-moz-focusring,[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring {
    outline: 1px dotted ButtonText
}

fieldset {
    border: 1px solid #c0c0c0;
    margin: 0 2px;
    padding: .35em .625em .75em
}

legend {
    color: inherit;
    display: table;
    max-width: 100%;
    padding: 0;
    white-space: normal
}

textarea {
    overflow: auto
}

[type=checkbox],[type=radio] {
    padding: 0
}

[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button {
    height: auto
}

[type=search] {
    -webkit-appearance: textfield;
    outline-offset: -2px
}

[type=search]::-webkit-search-decoration {
    -webkit-appearance: none
}

::-webkit-file-upload-button {
    -webkit-appearance: button;
    font: inherit
}

/* End extract */
html,body {
    font-family: Verdana,sans-serif;
    font-size: 15px;
    line-height: 1.5
}

html {
    overflow-x: hidden
}

h1 {
    font-size: 36px
}

h2 {
    font-size: 30px
}

h3 {
    font-size: 24px
}

h4 {
    font-size: 20px
}

h5 {
    font-size: 18px
}

h6 {
    font-size: 16px
}

.breadcrumb {
  padding: 0 0.5rem;
}

.breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
  align-items: end;
}
`;

showdown.extension('prettify', function () {
  return [{
    type: 'output',
    filter: function (source) {
      return source.replace(/(<pre[^>]*>)?[\n\s]?<code([^>]*)>/gi, function (match, pre, codeClass) {
        if (pre) {
          return '<pre class="prettyprint linenums"><code' + codeClass + '>';
        } else {
          return ' <code class="prettyprint">';
        }
      });
    }
  }];
});

const args = process.argv.slice(2);
const outDir = path.join(path.dirname('.'), args[0] ?? 'out');

const docsDir = path.join(path.dirname('.'),'/docs');
const docFiles = fs.readdirSync(docsDir).map((v) => path.join(docsDir, v));
const files = ['README.md',...docFiles.filter(v => v.endsWith('.md'))];
const outFiles = files.map(v => path.join(outDir,v));

try {
  fs.mkdirSync(path.join(outDir, 'docs'), { recursive: true });
} catch (e) {
  if (e.code !== 'EEXIST') throw e;
}

// const assetsDir = path.join(path.dirname('.'),'/pages-assets');
// const assetsFiles = fs.readdirSync(assetsDir);
// for (const asset of assetsFiles) {
//   fs.copyFileSync(path.join(assetsDir, asset),path.join(outDir, asset));
// }
fs.copyFileSync(path.join(path.dirname('.'),'LICENSE'),path.join(outDir, 'LICENSE'));

const conv = new showdown.Converter({
  extensions: ['prettify'],
});

function getBreadcrumb(path, document) {
  const segments = path.split('.')[0].split('/');
  const text = segments[segments.length - 1];
  const title = `${text.substring(0,1).toUpperCase()}${text.substring(1)}`;

  const nav = document.createElement('nav');
  const ol = document.createElement('ol');
  const lis = [];
  for (let path of outFiles) {
    path = path.replace(/README.html/g,'index.html');

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('href', '/'+path);
    const span = document.createElement('span');
    span.setAttribute('aria-current','page');
    const segments = path.split('.')[0].split('/');
    let text = segments[segments.length - 1];
    text = `${text.substring(0,1).toUpperCase()}${text.substring(1)}`;
    const uppers = text.matchAll(/[A-Z]+/g);
    let expanded = 0;
    for (const upper of uppers) {
      if (upper.index > 0) {
        text = text.substring(0, upper.index+expanded) + ' ' + text.substring(upper.index+expanded);
        expanded++;
      }
    }
    a.textContent = text;
    span.textContent = text;

    if (text === title) {
      li.appendChild(span);
    } else {
      li.appendChild(a);
    }
    lis.push(li);
  }
  for (const li of lis) {
    ol.appendChild(li);
  }
  nav.setAttribute('aria-label','Breadcrumb');
  nav.setAttribute('class','breadcrumb');
  nav.appendChild(ol);

  return nav;
}

async function writeHtmlToFile (
  location,
  html,
) {
  const dom = new JSDOM(html)
  const document = dom.window.document

  const breadCrumb = getBreadcrumb(location,document);

  document.querySelectorAll('head').forEach((v) => {
    const style = document.createElement('style')
    style.textContent = styles
    v.appendChild(style);
    v.after(breadCrumb);
    document.querySelectorAll('h1').forEach((v0,i) => {
      if (i <= 0) {
        const title = document.createElement('title');
        title.textContent = v0.innerHTML;
        v.appendChild(title);
      }
    });
  });

  document.querySelectorAll('a').forEach(aNode => {
    const href = aNode.href;
    if (href.endsWith('.md')) {
      aNode.setAttribute('href', href.substring(0,href.length-3).concat('.html'));
    }
    if (href.startsWith('about:blank#')) {
      aNode.setAttribute('href', href.substring('about:blank'.length).replace(/-/g,''));
    }
  });
  fs.writeFileSync(location,dom.serialize().replace(/®/g,'&#174;'), 'utf8');
}

for (let file of files) {
  let text = fs.readFileSync(file).toString('utf8');
  text = text.replace(/(Promise)(\\<)(.*)(>)/g,'Promise&#60;$3&#62;');

  file = file.replace(/README.md/g,'index.md');

  const val = conv.makeHtml(text);

  const outFile = path.join(outDir, file.split('.')[0]+'.html');
  if (typeof(val) === 'string') {
    writeHtmlToFile(outFile,val);
  } else {
    val.then((html) => {
      writeHtmlToFile(outFile,html);
    });
  }
}
