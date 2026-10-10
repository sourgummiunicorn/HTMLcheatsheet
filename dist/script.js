'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const escapeHTML = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function highlight(code) {
  return code.split(/(<[^>]+>)/g).map(part => {
    if (!part.startsWith('<')) return escapeHTML(part);
    const tokens = part.match(/^(<\/?)([\w!-]+)([\s\S]*?)(\/?>)$/);
    if (!tokens) return escapeHTML(part);
    const attributes = tokens[3].split(/("[^"]*"|'[^']*')/g).map((chunk, i) => i % 2 ? `<span class="syntax-value">${escapeHTML(chunk)}</span>` : escapeHTML(chunk).replace(/([\w-]+)(=)/g, '<span class="syntax-attr">$1</span>$2')).join('');
    return `${escapeHTML(tokens[1])}<span class="syntax-tag">${escapeHTML(tokens[2])}</span>${attributes}${escapeHTML(tokens[4])}`;
  }).join('');
}
const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Web Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello!</h1>
  <script src="script.js"></script>
</body>
</html>`;
const formCode = `<form id="hello-form">
  <label for="name">Your name</label>
  <input id="name" name="name" required>

  <label for="email">Email address</label>
  <input id="email" name="email" type="email" required>

  <label for="message">Your message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send a hello</button>
  <p id="result" role="status"></p>
</form>
<script>
  document.querySelector('#hello-form')
    .addEventListener('submit', function (event) {
      event.preventDefault();
      document.querySelector('#result').textContent =
        'Thanks! This demo does not send data.';
    });
</script>`;
const tags = [
 ['h1–h6','Text','Headings, from main title to small subsections.','Headings give your page an outline people can scan.','<h1>My first website</h1>\n<h2>About me</h2>\n<h3>My favorite things</h3>','Use one h1 for the main title on most simple pages. Nest heading levels logically; don’t choose a level just for its size.'],
 ['p','Text','A paragraph of text.','Paragraphs divide ideas into readable pieces.','<p>I’m learning to build websites.</p>','Use separate paragraphs for separate ideas. Use CSS for spacing instead of extra line breaks.'],
 ['span','Text','A small, inline part of some text.','A span lets you style a few words without starting a new block.','<p>I love <span class="highlight">HTML</span>.</p>','A span has no special meaning or appearance by itself. Add CSS when you want a visual change.'],
 ['strong','Text','Text with strong importance.','It communicates importance and is usually displayed in bold.','<p><strong>Remember:</strong> save your work.</p>','Choose strong for meaning. Use CSS font-weight when you only want a bold appearance.'],
 ['em','Text','Emphasis within a sentence.','It adds stress to words and usually appears in italics.','<p>You can <em>absolutely</em> do this.</p>','Use em for emphasis, rather than just to make words italic.'],
 ['br','Text','A line break inside text.','Useful when the line break is part of the content, like an address.','<p>12 Maple Street<br>New York, NY</p>','Void element: no closing tag. Do not stack br tags to create page spacing.'],
 ['hr','Text','A thematic break between ideas.','It signals a change of topic, usually with a horizontal line.','<p>The first chapter ends.</p>\n<hr>\n<p>A new chapter begins.</p>','Void element: no closing tag. Use CSS borders for purely decorative lines.'],
 ['div','Structure','A general-purpose block container.','Group elements so they can share layout or styling.','<div class="card">\n  <h2>Hello!</h2>\n  <p>This content stays together.</p>\n</div>','A div does not describe the content’s meaning. Prefer a semantic element when one fits.'],
 ['header','Structure','An introductory area for a page or section.','It groups introductions such as a title, logo, or navigation.','<header>\n  <h1>Alex’s notebook</h1>\n  <p>Things I’m learning.</p>\n</header>','A header can belong to the whole page or to an article. It is different from head, which holds metadata.'],
 ['nav','Structure','A group of major navigation links.','It helps readers and assistive technology find their way.','<nav aria-label="Main">\n  <a href="index.html">Home</a>\n  <a href="about.html">About</a>\n</nav>','Use nav for important navigation groups. Not every small group of links needs one.'],
 ['main','Structure','The main content of the page.','It gives people a clear route to the page’s primary content.','<main>\n  <h1>My projects</h1>\n  <p>Here is what I’m building.</p>\n</main>','Use one visible main element per page. Keep repeated site navigation and footers outside it.'],
 ['section','Structure','A group of related content.','It creates a meaningful section within a page.','<section>\n  <h2>My hobbies</h2>\n  <p>I like drawing and coding.</p>\n</section>','Usually give a section a heading. Use div for a wrapper that exists only for styling.'],
 ['article','Structure','A self-contained piece of content.','Good for content that makes sense on its own, such as a post or news story.','<article>\n  <h2>My first day coding</h2>\n  <p>Today I made a web page.</p>\n</article>','Use article when the content could stand alone. Not every visual card is an article.'],
 ['footer','Structure','Closing information for a page or section.','Group author information, related links, or copyright details.','<footer>\n  <p>Made with curiosity by Alex.</p>\n</footer>','A footer can belong to a page or an article. It does not automatically stick to the bottom of the screen.'],
 ['a','Media','A link to a page, website, or section.','Links connect the web and let people move between places.','<a href="about.html">About Me</a>\n<a href="#contact">Jump to contact</a>','href means “where this link goes.” Write meaningful link text. Use a button for an action and a link for navigation.'],
 ['img','Media','An image with a text alternative.','Images can communicate information; alt text provides an alternative when an image cannot be seen.','<img src="cat.jpg" alt="A gray cat sleeping on a chair">','src is the source file to load. Include src and alt. For a purely decorative image use alt="". Void element: no closing tag. The example needs your own cat.jpg file.'],
 ['iframe','Media','Another page embedded in this one.','Useful for embedding content such as a video player.','<iframe\n  src="https://www.youtube.com/embed/VIDEO_ID"\n  title="Video"\n  allowfullscreen>\n</iframe>','Give every iframe a descriptive title. Replace VIDEO_ID with a real video ID. Some websites do not allow embedding.'],
 ['audio','Media','An audio player for sound.','Native controls make audio easy to play or pause.','<audio controls src="hello.mp3">\n  <a href="hello.mp3">Download the audio</a>\n</audio>','Provide the audio file and a text transcript. Include controls and avoid unexpected autoplay.'],
 ['video','Media','A player for video content.','A native video player provides playback controls.','<video controls width="320" src="lesson.mp4">\n  <track kind="captions" src="captions.vtt"\n    srclang="en" label="English" default>\n</video>','Supply real media and caption files. Captions make spoken content available to more people.'],
 ['ul','Lists','An unordered, bulleted list.','Group related items when their order does not matter.','<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>','Put each item inside li. Use ol when a sequence or ranking matters.'],
 ['ol','Lists','An ordered, numbered list.','Great for steps, instructions, and rankings.','<ol>\n  <li>Create a file.</li>\n  <li>Write some HTML.</li>\n  <li>Open it in your browser.</li>\n</ol>','The browser adds numbers for you. Use the start attribute if the list needs to begin at another number.'],
 ['li','Lists','One item inside a list.','It gives each item a clear place in a list.','<ul>\n  <li>My first idea</li>\n  <li>My next idea</li>\n</ul>','Place li inside ul or ol. A list item can contain other elements, including a nested list.'],
 ['form','Forms','A group of related input controls.','A form collects information and provides native submission behavior.',formCode,'A real submission needs a destination (action) or JavaScript. This example prevents navigation and displays a local confirmation.'],
 ['label','Forms','An accessible name for an input.','A label helps people understand the field and makes its text clickable.','<label for="nickname">Nickname</label>\n<input id="nickname" name="nickname" type="text">','Match for on the label with id on the input. Placeholder text is not a replacement for a label.'],
 ['input','Forms','A short response or selection.','Choose an input type that matches the information you need.','<label for="full-name">Name</label>\n<input type="text" id="full-name" name="full-name">\n\n<label for="mail">Email</label>\n<input type="email" id="mail" name="email">\n\n<label for="age">Age</label>\n<input type="number" id="age" name="age" min="0">\n\n<label><input type="checkbox" name="updates"> Send updates</label>\n\n<fieldset>\n  <legend>Choose a format</legend>\n  <label><input type="radio" name="format" value="online"> Online</label>\n  <label><input type="radio" name="format" value="in-person"> In person</label>\n</fieldset>','Void element: no closing tag. Radio buttons in the same group share a name. Checkboxes allow independent choices. name identifies data during form submission.'],
 ['textarea','Forms','A longer, multi-line response.','Give longer messages room to breathe.','<label for="story">Your story</label>\n<textarea id="story" name="story" rows="4"></textarea>','Textarea needs a closing tag. Put any initial text between its tags, not in a value attribute.'],
 ['select','Forms','A dropdown menu of choices.','It presents a compact list of options.','<label for="topic">Pick a topic</label>\n<select id="topic" name="topic">\n  <option value="html">HTML</option>\n  <option value="css">CSS</option>\n</select>','Use option for each choice and provide a label for the select. The selected option’s value is submitted.'],
 ['option','Forms','A single choice in a dropdown.','It defines a label people see and a value your form can send.','<label for="level">Your level</label>\n<select id="level" name="level">\n  <option value="beginner">Just starting</option>\n  <option value="exploring">Exploring</option>\n</select>','Place option inside select for a dropdown. Add selected to choose an initial option.'],
 ['button','Forms','A clickable control for an action.','Native buttons support keyboard activation.','<button type="button">Say hello</button>\n<button type="submit">Send form</button>','A button needs HTML form behavior or JavaScript to act. Inside a form, specify type="button" for a button that should not submit.']
].map(([tag,category,description,why,example,note])=>({tag,category,description,why,example,note}));
$('#template-code').innerHTML = template.split('\n').map(line=>`<span class="code-line">${highlight(line)}</span>`).join('');
const annotations=[['<!DOCTYPE html>','Tells the browser to use modern HTML.'],['<html lang="en">','The root element. lang names the page’s language.'],['<head>','Information about the page, usually not visible.'],['<meta charset="UTF-8">','Supports letters, symbols, and more.'],['<meta name="viewport">','Helps the page display correctly on phones.'],['<title>','The text in your browser tab.'],['<link>','Connects your CSS stylesheet.'],['<body>','The visible content of your page.'],['<script>','Connects your JavaScript file.']];
$('#annotations').innerHTML=annotations.map(([tag,text])=>`<div class="annotation"><code>${escapeHTML(tag)}</code><p>${text}</p></div>`).join('');
$('#form-code').innerHTML=highlight(formCode);
$('#class-code').innerHTML=highlight('<div id="uniqueID" class="card featured"></div>')+'\n\n<span class="syntax-tag">#uniqueID</span> { }   <span class="syntax-comment">/* One unique element */</span>\n<span class="syntax-tag">.card</span> { }       <span class="syntax-comment">/* All elements with class="card" */</span>\n<span class="syntax-tag">.featured</span> { }   <span class="syntax-comment">/* A second, reusable class */</span>';
const categories=['All tags','Text','Structure','Media','Lists','Forms'];
let category='All tags';
$('#filters').innerHTML=categories.map(c=>`<button data-category="${c}" aria-pressed="${c===category}">${c==='Media'?'Links & media':c}</button>`).join('');
function renderTags(){
  const query=$('#tag-search').value.toLowerCase().trim().replace(/[<>]/g,'');
  const filtered=tags.filter(t=>(category==='All tags'||t.category===category)&&[t.tag,t.category,t.description,t.why,t.note,t.example].join(' ').toLowerCase().includes(query));
  $('#tag-grid').innerHTML=filtered.map(t=>`<button class="tag-card" data-tag="${t.tag}" aria-haspopup="dialog"><code>&lt;${t.tag}&gt;</code><span class="arrow" aria-hidden="true">↗</span><p>${t.description}</p><span class="tag-meta">${t.category.toUpperCase()}${['br','hr','img','input'].includes(t.tag)?' / VOID ELEMENT':''}</span></button>`).join('');
  $('#result-count').textContent=`${filtered.length} / ${tags.length} tags`;
  $('#empty-state').hidden=filtered.length>0;
}
$('#tag-search').addEventListener('input',renderTags);
$('#filters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$$('[data-category]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));renderTags()});
$('#clear-search').addEventListener('click',()=>{$('#tag-search').value='';category='All tags';$$('[data-category]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.category===category)));renderTags();$('#tag-search').focus()});
let activeTag;
function openTag(tag){activeTag=tags.find(t=>t.tag===tag);if(!activeTag)return;const t=activeTag;$('#dialog-category').textContent=`FIELD NOTES / ${t.category}`;$('#dialog-body').innerHTML=`<span class="dialog-tag-label">TAG</span><h2 id="dialog-title">&lt;${t.tag}&gt;</h2><h3>What it does</h3><p>${t.description} ${t.why}</p><div class="example-heading"><h3>Example</h3><button class="copy-button" data-copy="tag">Copy example ⧉</button></div><pre>${highlight(t.example)}</pre><div class="dialog-note"><h3>Important note</h3><p>${escapeHTML(t.note)}</p></div>`;$('#tag-dialog').showModal()}
$('#tag-grid').addEventListener('click',e=>{const b=e.target.closest('[data-tag]');if(b)openTag(b.dataset.tag)});
$('#close-dialog').addEventListener('click',()=>$('#tag-dialog').close());
$('#tag-dialog').addEventListener('click',e=>{if(e.target===$('#tag-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2600)}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied. Go make something.')}catch{const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px';($('#tag-dialog').open?$('#tag-dialog'):document.body).append(area);area.select();const success=document.execCommand('copy');area.remove();toast(success?'Copied. Go make something.':'Select the code and copy it with your keyboard.')}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(b)copy(({template,form:formCode,tag:activeTag?.example})[b.dataset.copy])});
function updateText(){const tag=$('#text-tag').value;const element=document.createElement(tag);element.textContent='Hello, possibility.';$('#text-preview').replaceChildren(element);$('#text-code').innerHTML=highlight(`<${tag}>Hello, possibility.</${tag}>`);$('#text-feedback').textContent=({h1:'One main heading. A clear place to start.',h2:'A section heading gives your page an outline.',p:'A paragraph is ready for your next idea.',strong:'This text carries strong importance.',em:'A little emphasis changes how this reads.'})[tag]}
$('#text-tag').addEventListener('change',updateText);
function updateList(tag){$('#list-preview').innerHTML=`<${tag}><li>Have an idea</li><li>Make a little thing</li><li>Keep exploring</li></${tag}>`;$('#list-code').innerHTML=highlight(`<${tag}>\n  <li>Have an idea</li>\n  <li>Make a little thing</li>\n  <li>Keep exploring</li>\n</${tag}>`);$$('[data-list]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.list===tag)));$('#list-feedback').textContent=tag==='ul'?'A collection of ideas. No particular order.':'A sequence of steps. Order matters.'}
$$('[data-list]').forEach(b=>b.addEventListener('click',()=>updateList(b.dataset.list)));
$('#contact-demo').addEventListener('submit',e=>{e.preventDefault();$('#form-feedback').textContent=`Hello, ${$('#contact-name').value.trim()||'friend'}! Your form is valid. Nothing was sent or saved.`});
$$('[data-reset]').forEach(b=>b.addEventListener('click',()=>{switch(b.dataset.reset){case'text':$('#text-tag').value='h1';updateText();break;case'list':updateList('ul');break;case'form':$('#contact-demo').reset();$('#form-feedback').textContent='A button needs form behavior or JavaScript to perform an action.';break;}toast('Reset. A fresh start.')}));
const rules=['Close tags when required: <p>Hello</p>.','Nest correctly: <p><em>Hello</em></p>.','Use one main h1 on most simple pages.','Put visible content inside body.','Write alt text for meaningful images.','Keep every id unique on the page.','Use lowercase tag names for consistency.','Put quotation marks around attribute values.','Void elements have no closing tag.'];
$('#rules').innerHTML=rules.map(rule=>`<div class="rule"><span aria-hidden="true">✓</span><div>${escapeHTML(rule)}</div></div>`).join('');
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!$('#tag-dialog').open&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#tag-search').focus();$('#reference').scrollIntoView()}});
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){$$('.nav-inner a').forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}},{rootMargin:'-15% 0px -65% 0px'});
$$('main > section[id], .reference-section').forEach(s=>observer.observe(s));
renderTags();updateText();updateList('ul');
