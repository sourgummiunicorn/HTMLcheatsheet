'use strict';
(() => {
  const missions = [
  {
    "title": "Introduce yourself",
    "prompt": "Type an HTML main heading that introduces you by name or preferred name. Use an h1 opening tag and a closing tag around the name.",
    "hint": "Look up the heading tag in Find your tag if you need a refresher. Put your name between the opening and closing tags.",
    "success": "Your introduction has a main heading.",
    "retry": "Type your name inside a complete h1 element, including its closing tag."
  },
  {
    "title": "Define your focus",
    "prompt": "Write an HTML paragraph about the question, project, or research area that motivates you. Type the p opening and closing tags yourself.",
    "hint": "Move from a broad topic to a specific question. Put one or two sentences between the paragraph tags.",
    "success": "Your profile now explains the question behind your work.",
    "retry": "Write your focus inside a complete p element, including its closing tag."
  },
  {
    "title": "Share what you enjoy",
    "prompt": "Code a small section about things you enjoy. Add an h2 heading, then create an unordered list with at least three list items. Type and close every tag yourself.",
    "hint": "Use h2 for your heading. An unordered list uses ul, with one li element for each thing you enjoy.",
    "success": "Your heading and unordered list are ready.",
    "retry": "Add a complete h2 heading and an unordered list with at least three complete list items."
  },
  {
    "title": "Emphasize an idea",
    "prompt": "Write a paragraph about something important to you. Wrap a few important words with em opening and closing tags to emphasize them.",
    "hint": "The em element usually appears in italics. Place it inside a paragraph around the exact words you want to emphasize.",
    "success": "Your paragraph uses emphasis inside the text.",
    "retry": "Add a complete paragraph with meaningful text and an em element around a few words."
  },
  {
    "title": "Connect your work",
    "prompt": "Code a link to a resource that informs your work. Type an a element with an href attribute, meaningful link text, and a closing tag.",
    "hint": "Use a full https:// or http:// address for href. Name the resource rather than writing “click here.”",
    "success": "Your profile now connects readers to a relevant resource.",
    "retry": "Add a complete a element with a full web address, meaningful link text, and a closing tag."
  }
];
  const drafts = missions.map(() => '');
  const checked = missions.map(() => false);
  const visited = new Set([0]);
  let current = 0;
  let mode = 'guided';
  let experimentDraft = null;
  let previewTimer;
  let wasComplete = false;
  const editor = $('#challenge-editor');
  const fragment = code => { const t = document.createElement('template'); t.innerHTML = code; return t.content; };
  const hasText = el => {
    if (!el) return false;
    const clone = el.cloneNode(true);
    clone.querySelectorAll('script, style, template').forEach(e => e.remove());
    return !!clone.textContent.trim();
  };
  function pairedTagCount(code, tag) {
    const openings = [...code.matchAll(new RegExp(`<${tag}(?=[\\s>])[^>]*>`, 'gi'))].length;
    const closings = [...code.matchAll(new RegExp(`</${tag}\\s*>`, 'gi'))].length;
    return openings > 0 && openings === closings ? openings : 0;
  }
  function valid(index) {
    const code = drafts[index];
    const dom = fragment(code);
    if (index === 0) return pairedTagCount(code, 'h1') > 0 && [...dom.querySelectorAll('h1')].some(hasText);
    if (index === 1) return pairedTagCount(code, 'p') > 0 && [...dom.querySelectorAll('p')].some(hasText);
    if (index === 2) return pairedTagCount(code, 'h2') > 0 && pairedTagCount(code, 'ul') > 0 && pairedTagCount(code, 'li') >= 3 && [...dom.querySelectorAll('ul')].some(ul => [...ul.children].filter(li => li.tagName === 'LI' && hasText(li)).length >= 3);
    if (index === 3) return pairedTagCount(code, 'p') > 0 && pairedTagCount(code, 'em') > 0 && [...dom.querySelectorAll('p')].some(p => hasText(p) && [...p.querySelectorAll('em')].some(hasText));
    if (!pairedTagCount(code, 'a')) return false;
    return [...dom.querySelectorAll('a[href]')].some(a => {
      if (!hasText(a)) return false;
      const href = a.getAttribute('href').trim();
      try { const url = new URL(href.startsWith('www.') ? `https://${href}` : href); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname; } catch { return false; }
    });
  }
  const pageCSS = `
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px 24px;
      background: #BDEBFF;
      color: #000;
      font: 16px/1.7 "Avenir Next", "Segoe UI", sans-serif;
      overflow-wrap: anywhere;
    }
    .profile-card { max-width: 580px; margin: 0 auto; }
    h1 {
      font: 500 clamp(28px, 6vw, 42px)/1.15 Georgia, serif;
      letter-spacing: -.04em;
      margin: 0 0 18px;
    }
    p { margin: 14px 0; }
    img { max-width: 100%; height: auto; border-radius: 24px; margin: 12px 0; }
    ul, ol { padding-left: 24px; }
    h2 { font: 500 25px/1.2 Georgia, serif; margin: 28px 0 14px; }
    h3 { font-size: 14px; margin: 16px 0 5px; }
    li { padding: 3px 0; }
    a, .preview-link {
      color: #0A038E;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    button {
      font: inherit;
      background: #0A038E;
      color: white;
      border: 0;
      padding: 10px 18px;
      border-radius: 7px;
    }
  `;
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
    dom.querySelectorAll('a').forEach(a => {
      const href = (a.getAttribute('href') || '').trim();
      let allowed = false;
      try {
        const url = new URL(href.startsWith('www.') ? `https://${href}` : href);
        allowed = ['http:', 'https:'].includes(url.protocol);
        if (allowed) a.setAttribute('href', url.href);
      } catch {}
      if (!allowed) { a.removeAttribute('href'); a.classList.add('preview-link'); }
      else { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
    });
    const container = document.createElement('div'); container.append(dom);
    const empty = preview && !container.textContent.trim() && !container.querySelector('img') ? '<p class="empty-introduction">Your story starts with a hello.<br>Type in the editor to see it here.</p>' : '';
    if (!preview) return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My introduction</title>\n</head>\n<body>\n${container.innerHTML}\n</body>\n</html>`;
    const previewCSS = '.mission-fragment{padding:8px 12px;margin:0 -12px 8px;min-height:8px}.current-fragment{background:#e9f8ff;outline:1px dashed #2C64E8;border-radius:8px}.empty-introduction{color:#000;font-size:14px;text-align:center;padding:54px 0}';
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none';">\n  <title>My introduction</title>\n  <style>${pageCSS}${previewCSS}</style>\n</head>\n<body>\n${container.innerHTML}${empty}\n</body>\n</html>`;
  }
  function renderPreview() {
    clearTimeout(previewTimer);
    $('#challenge-preview').srcdoc = makeDocument(mode === 'guided' ? assembled(true) : experimentDraft, true);
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
    const showFinishedCode = complete && mode === 'guided';
    $('#mission-complete').hidden = !showFinishedCode;
    $('#finished-code').hidden = !showFinishedCode;
    $('#finished-code-source').value = showFinishedCode ? makeDocument(assembled()) : '';
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
    $('#mission-editor-pane').hidden = false;
    $('#mission-kicker').textContent = `MISSION ${index + 1} / 5`;
    $('#mission-title').textContent = mission.title + '.';
    $('#mission-instruction').textContent = mission.prompt;
    $('#mission-hint').open = false;
    $('#mission-hint-text').textContent = mission.hint;
    $('#reasoning-prompt').hidden = !mission.reflection;
    $('#reasoning-text').textContent = mission.reflection || '';
    editor.classList.toggle('structured-mission-editor', index === 2);
    $('#mission-editor-label').textContent = 'YOUR HTML';
    editor.value = drafts[index];
    editor.setAttribute('aria-describedby', 'mission-instruction challenge-help');
    editor.classList.remove('full-page-editor');
    setFeedback(checked[index] ? mission.success : '', checked[index]);
    renderProgress(); renderPreview();
    if (focus) $('#mission-title').focus();
  }
  $('#mission-progress').innerHTML = missions.map((m, i) => `<li><button type="button" data-mission="${i}"><span class="mission-step-number">${i + 1}</span><span>${m.title}</span></button></li>`).join('');
  $('#mission-progress').addEventListener('click', e => { const b = e.target.closest('[data-mission]'); if (b) selectMission(Number(b.dataset.mission), true); });
  editor.addEventListener('input', () => {
    if (mode === 'guided') {
      drafts[current] = editor.value;
      if (checked[current]) checked[current] = valid(current);
      setFeedback(''); renderProgress();
    } else experimentDraft = editor.value;
    clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
  });
  $('#check-mission').addEventListener('click', () => {
    checked[current] = valid(current);
    setFeedback(checked[current] ? missions[current].success : missions[current].retry, checked[current]);
    renderProgress(); renderPreview();
    if (checked.every(Boolean)) setFeedback(missions[current].success + ' All five missions are complete. You made your introduction page!', true);
  });
  $('#next-mission').addEventListener('click', () => {
    if (current < missions.length - 1) selectMission(current + 1, true);
    else { $('#finished-code').scrollIntoView({block:'start'}); $('#copy-finished-code').focus({preventScroll:true}); }
  });
  $('#reset-mission').addEventListener('click', () => {
    drafts[current] = ''; checked[current] = false;
    selectMission(current); setFeedback('A fresh start for this mission. Your other steps are unchanged.'); editor.focus();
  });
  const pageExportOptions = {filename:'index.html', title:'Your introduction HTML', show:true};
  $('#copy-my-page').addEventListener('click', () => copy(makeDocument(assembled()), pageExportOptions));
  $('#view-my-page').addEventListener('click', () => showCodeExport(makeDocument(assembled()), pageExportOptions));
  $('#copy-finished-code').addEventListener('click', async () => {
    const copied = await copy($('#finished-code-source').value, {filename:'index.html', title:'Your introduction HTML'});
    $('#finished-code-status').textContent = copied ? 'Copied. Paste into a new index.html file in VS Code.' : 'The full code is selected in the export window for manual copying.';
  });
  $('#select-finished-code').addEventListener('click', () => {
    const source = $('#finished-code-source');
    source.focus(); source.select(); source.setSelectionRange(0, source.value.length);
    $('#finished-code-status').textContent = 'Selected. Press ⌘C on Mac or Ctrl+C on Windows, then paste into index.html in VS Code.';
  });
  $('#copy-experiment').addEventListener('click', () => copy(makeDocument(experimentDraft), pageExportOptions));
  $('#view-experiment').addEventListener('click', () => showCodeExport(makeDocument(experimentDraft), pageExportOptions));
  $('#experiment-page').addEventListener('click', () => {
    clearTimeout(previewTimer);
    if (experimentDraft === null) experimentDraft = assembled();
    mode = 'experiment';
    editor.classList.remove('structured-mission-editor');
    $('#guided-controls').hidden = true; $('#experiment-controls').hidden = false; $('#mission-step-controls').hidden = true;
    $('#mission-editor-pane').hidden = false;
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
