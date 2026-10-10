'use strict';
(() => {
  const missions = [
    { title: 'Say hello', tag: 'h1–h6', tagLabel: '<h1>', starter: '<h1></h1>', prompt: 'What should we call you? Write your name, a nickname, or a character’s name between the heading tags.', hint: 'The words between <h1> and </h1> become your page’s main heading. Try a hello in your own voice.', example: '<h1>Hi, I’m River!</h1>', success: 'Your page has a name! The h1 gives your introduction a clear beginning.', retry: 'Add your name or nickname between the <h1> and </h1> tags.' },
    { title: 'Tell your story', tag: 'p', tagLabel: '<p>', starter: '<p></p>', prompt: 'What do you enjoy? What would you like to learn? Write a sentence or two about yourself inside the paragraph.', hint: 'Keep both paragraph tags and write your introduction between them. A short sentence is a great start.', example: '<p>I love drawing, and I want to learn how to make games.</p>', success: 'Your story is on the page. A paragraph gives your words a home.', retry: 'Write a little about yourself between the <p> and </p> tags.' },
    { title: 'Choose your avatar', tag: 'img', tagLabel: '<img>', starter: '<img src="avatars/sprout.svg" alt="" width="112">', prompt: 'Pick an illustration that feels like you. Then add a short description inside alt="" so someone who can’t see it knows what it shows.', hint: 'src tells the browser which picture to load. alt describes the picture. Keep the quotation marks. img has no closing tag.', example: '<img src="avatars/sprout.svg" alt="A smiling sprout in a pot" width="112">', success: 'Your avatar has a text description! That makes the image available in another way.', retry: 'Choose one of the three avatars and write its description inside alt="".' },
    { title: 'Share your interests', tag: 'ul', tagLabel: '<ul> + <li>', starter: '<ul>\n  <li></li>\n  <li></li>\n</ul>', prompt: 'What makes you, you? Add at least two hobbies, favorite things, or things you’re curious about. Give each one its own list item.', hint: 'Put each interest between <li> and </li>. Keep all your list items inside <ul> and </ul>. You can add more!', example: '<ul>\n  <li>Sketching imaginary creatures</li>\n  <li>Learning to code</li>\n</ul>', success: 'Two or more interests, neatly listed. Your personality is showing!', retry: 'Add at least two nonempty <li> items inside your <ul> list.' },
    { title: 'Share a favorite link', tag: 'a', tagLabel: '<a>', starter: '<a href=""></a>', prompt: 'Share a website or resource you enjoy. Put its full address inside href="" and give the link a name that tells people where it goes.', hint: 'Start the address with https:// or http://. The words between the tags are the clickable link text. Keep your address inside quotation marks.', example: '<a href="https://example.com">A website I enjoy</a>', success: 'Your link has an address and a name. You’ve connected your page to the web!', retry: 'Add a full http:// or https:// address inside href, and some link text between the <a> tags.' }
  ];
  const drafts = missions.map(m => m.starter);
  const checked = missions.map(() => false);
  const visited = new Set([0]);
  let current = 0;
  let mode = 'guided';
  let experimentDraft = null;
  let previewTimer;
  let wasComplete = false;
  const editor = $('#challenge-editor');
  const avatarFor = src => introAvatars.find(a => a.src === (src || '').trim().replace(/^\.\//, ''));
  const avatarURI = a => 'data:image/svg+xml,' + encodeURIComponent(a.svg);
  const fragment = code => { const t = document.createElement('template'); t.innerHTML = code; return t.content; };
  const hasText = el => {
    if (!el) return false;
    const clone = el.cloneNode(true);
    clone.querySelectorAll('script, style, template').forEach(e => e.remove());
    return !!clone.textContent.trim();
  };
  function valid(index) {
    const dom = fragment(drafts[index]);
    if (index === 0) return [...dom.querySelectorAll('h1')].some(hasText);
    if (index === 1) return [...dom.querySelectorAll('p')].some(hasText);
    if (index === 2) return [...dom.querySelectorAll('img')].some(img => avatarFor(img.getAttribute('src')) && img.getAttribute('alt')?.trim());
    if (index === 3) return [...dom.querySelectorAll('ul')].some(ul => [...ul.children].filter(li => li.tagName === 'LI' && hasText(li)).length >= 2);
    return [...dom.querySelectorAll('a[href]')].some(a => {
      if (!hasText(a)) return false;
      try { const url = new URL(a.getAttribute('href').trim()); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname; } catch { return false; }
    });
  }
  const pageCSS = `*{box-sizing:border-box}body{margin:0;padding:32px 24px;background:#f8f7f1;color:#1c2922;font:16px/1.7 "Avenir Next","Segoe UI",sans-serif;overflow-wrap:anywhere}.profile-card{max-width:580px;margin:0 auto}h1{font:500 clamp(28px,6vw,42px)/1.15 Georgia,serif;letter-spacing:-.04em;margin:0 0 18px}p{margin:14px 0}img{max-width:100%;height:auto;border-radius:24px;margin:12px 0}ul{padding-left:24px}li{padding:3px 0}a,.preview-link{color:#26704d;text-decoration:underline;text-underline-offset:3px}button{font:inherit;background:#26704d;color:white;border:0;padding:10px 18px;border-radius:7px}`;
  function assembled(preview = false) {
    const pieces = drafts.map((code, i) => {
      if (!visited.has(i)) return '';
      return preview ? `<div class="mission-fragment${i === current ? ' current-fragment' : ''}">${code}</div>` : code;
    });
    return `<main class="profile-card">\n${pieces.filter(Boolean).join('\n\n')}\n</main>`;
  }
  function makeDocument(code, preview = false) {
    const dom = fragment(code);
    // Keep learner markup inert while preparing it; only the sandbox renders it.
    dom.querySelectorAll('base, meta, link, script, iframe, object, embed').forEach(el => el.remove());
    dom.querySelectorAll('*').forEach(el => {
      [...el.attributes].filter(a => /^on/i.test(a.name)).forEach(a => el.removeAttribute(a.name));
    });
    dom.querySelectorAll('img').forEach(img => {
      const avatar = avatarFor(img.getAttribute('src'));
      if (avatar) img.setAttribute('src', avatarURI(avatar));
    });
    dom.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href') || '';
      let allowed = false;
      try { allowed = ['http:', 'https:'].includes(new URL(href).protocol); } catch {}
      if (preview || !allowed) { a.removeAttribute('href'); a.classList.add('preview-link'); }
      else { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
    });
    const container = document.createElement('div'); container.append(dom);
    const empty = preview && !container.textContent.trim() && !container.querySelector('img') ? '<p class="empty-introduction">Your story starts with a hello.<br>Type in the editor to see it here.</p>' : '';
    const previewCSS = preview ? '.mission-fragment{padding:8px 12px;margin:0 -12px 8px;min-height:8px}.current-fragment{background:#edf3e7;outline:1px dashed #b3caaa;border-radius:8px}.empty-introduction{color:#697661;font-size:14px;text-align:center;padding:54px 0}' : '';
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none';">\n  <title>My introduction</title>\n  <style>${pageCSS}${previewCSS}</style>\n</head>\n<body>\n${container.innerHTML}${empty}\n</body>\n</html>`;
  }
  function renderPreview() {
    clearTimeout(previewTimer);
    $('#challenge-preview').srcdoc = makeDocument(mode === 'guided' ? assembled(true) : experimentDraft, true);
  }
  function syncAvatars() {
    const img = fragment(drafts[2]).querySelector('img');
    const selected = avatarFor(img?.getAttribute('src'));
    $$('[data-avatar]').forEach(b => b.setAttribute('aria-pressed', String(selected?.id === b.dataset.avatar)));
  }
  function renderProgress() {
    const complete = checked.every(Boolean);
    const count = checked.filter(Boolean).length;
    $('#mission-progress-count').textContent = `${count} of 5 complete`;
    $$('[data-mission]').forEach((button, i) => {
      button.classList.toggle('is-complete', checked[i]);
      button.classList.toggle('is-current', mode === 'guided' && i === current);
      if (mode === 'guided' && i === current) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
      button.setAttribute('aria-label', `${i + 1}. ${missions[i].title}${checked[i] ? ', complete' : ''}`);
      $('.mission-step-number', button).textContent = checked[i] ? '✓' : String(i + 1).padStart(2, '0');
    });
    $('#mission-complete').hidden = !complete || mode !== 'guided';
    $('#mission-complete').classList.toggle('celebrate', complete && !wasComplete);
    wasComplete = complete;
    const last = current === missions.length - 1;
    $('#next-mission').disabled = last ? !complete : !checked[current];
    $('#next-mission').textContent = last ? 'See my finished page ↗' : 'Next mission →';
    $('#mission-next-note').textContent = last && !complete ? 'Complete all five missions to finish your page.' : checked[current] ? 'Ready when you are. You can come back anytime.' : 'Check your step to unlock the next mission.';
  }
  function setFeedback(message, success = false) {
    $('#challenge-feedback').textContent = message;
    $('#challenge-feedback').classList.toggle('step-success', success);
  }
  function selectMission(index, focus = false) {
    clearTimeout(previewTimer);
    mode = 'guided'; current = index; visited.add(index);
    const mission = missions[current];
    $('#guided-controls').hidden = false;
    $('#experiment-controls').hidden = true;
    $('#mission-step-controls').hidden = false;
    $('#mission-kicker').textContent = `MISSION ${index + 1} / 5`;
    $('#mission-title').textContent = mission.title + '.';
    $('#mission-instruction').textContent = mission.prompt;
    $('#mission-hint').open = false;
    $('#mission-hint-text').textContent = mission.hint;
    $('#mission-example').innerHTML = highlight(mission.example);
    $('#mission-tag-help').textContent = `${mission.tagLabel} field notes ↗`;
    $('#avatar-picker').hidden = index !== 2;
    $('#mission-editor-label').textContent = `YOUR ${mission.tagLabel} HTML`;
    editor.value = drafts[index];
    editor.setAttribute('aria-describedby', 'mission-instruction challenge-help');
    editor.classList.remove('full-page-editor');
    setFeedback(checked[index] ? mission.success : '', checked[index]);
    syncAvatars(); renderProgress(); renderPreview();
    if (focus) $('#mission-title').focus();
  }
  $('#mission-progress').innerHTML = missions.map((m, i) => `<li><button type="button" data-mission="${i}"><span class="mission-step-number">${i + 1}</span><span>${m.title}</span></button></li>`).join('');
  $('#avatar-options').innerHTML = introAvatars.map(a => `<button type="button" data-avatar="${a.id}" aria-pressed="false"><img src="${a.src}" alt="${a.description}" width="64" height="64"><span>${a.name}</span></button>`).join('');
  $('#mission-progress').addEventListener('click', e => { const b = e.target.closest('[data-mission]'); if (b) selectMission(Number(b.dataset.mission), true); });
  $('#mission-tag-help').addEventListener('click', () => openTag(missions[current].tag));
  editor.addEventListener('input', () => {
    if (mode === 'guided') {
      drafts[current] = editor.value;
      if (checked[current]) checked[current] = valid(current);
      // Editing never announces on each keystroke. Check my step owns feedback.
      setFeedback(''); syncAvatars(); renderProgress();
    } else experimentDraft = editor.value;
    clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
  });
  $('#avatar-options').addEventListener('click', e => {
    const button = e.target.closest('[data-avatar]'); if (!button) return;
    const avatar = introAvatars.find(a => a.id === button.dataset.avatar);
    const dom = fragment(drafts[2]); let img = dom.querySelector('img');
    if (!img) { img = document.createElement('img'); img.setAttribute('alt', ''); img.setAttribute('width', '112'); dom.append(img); }
    if (img.getAttribute('src') !== avatar.src) img.setAttribute('alt', '');
    img.setAttribute('src', avatar.src);
    const container = document.createElement('div'); container.append(dom);
    drafts[2] = container.innerHTML; editor.value = drafts[2]; checked[2] = false;
    syncAvatars(); renderProgress(); renderPreview();
    setFeedback(`${avatar.name} selected. Describe this picture in alt, then check your step.`);
  });
  $('#check-mission').addEventListener('click', () => {
    checked[current] = valid(current);
    setFeedback(checked[current] ? missions[current].success : missions[current].retry, checked[current]);
    renderProgress(); renderPreview();
    if (checked.every(Boolean)) setFeedback(missions[current].success + ' All five missions are complete. You made your introduction page!', true);
  });
  $('#next-mission').addEventListener('click', () => {
    if (current < missions.length - 1) selectMission(current + 1, true);
    else { $('#mission-complete').scrollIntoView({block:'center'}); $('#copy-my-page').focus({preventScroll:true}); }
  });
  $('#reset-mission').addEventListener('click', () => {
    drafts[current] = missions[current].starter; checked[current] = false;
    selectMission(current); setFeedback('A fresh start for this mission. Your other steps are unchanged.'); editor.focus();
  });
  $('#copy-my-page').addEventListener('click', () => copy(makeDocument(assembled())));
  $('#copy-experiment').addEventListener('click', () => copy(makeDocument(experimentDraft)));
  $('#experiment-page').addEventListener('click', () => {
    clearTimeout(previewTimer);
    if (experimentDraft === null) experimentDraft = assembled();
    mode = 'experiment';
    $('#guided-controls').hidden = true; $('#experiment-controls').hidden = false; $('#mission-step-controls').hidden = true;
    $('#mission-editor-label').textContent = 'YOUR PAGE HTML';
    editor.setAttribute('aria-describedby', 'experiment-title challenge-help');
    editor.classList.add('full-page-editor'); editor.value = experimentDraft;
    renderProgress(); renderPreview(); $('#experiment-title').focus();
  });
  $('#back-to-missions').addEventListener('click', () => selectMission(current, true));
  $('#restore-experiment').addEventListener('click', () => {
    experimentDraft = assembled(); editor.value = experimentDraft; renderPreview(); toast('Your experiment now starts from your mission page.');
  });
  selectMission(0);
})();
