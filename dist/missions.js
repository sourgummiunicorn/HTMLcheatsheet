'use strict';
(() => {
  const missions = [
  {
    "title": "Introduce yourself",
    "prompt": "Introduce yourself by name or preferred name. This heading will anchor a short profile of you and how you approach your work.",
    "hint": "A name or preferred name is enough. Your introduction does not need your full biography.",
    "success": "Your introduction has a main heading.",
    "retry": "Add your name or preferred name in the field."
  },
  {
    "title": "Define your focus",
    "prompt": "What question, project, or research area motivates you? Describe your focus and what you hope to understand in one or two sentences.",
    "hint": "Move from a broad topic to a specific question. Name what you want to understand, compare, or create. A project from your coursework works too.",
    "success": "Your profile now explains the question behind your work.",
    "retry": "Write a short description of your focus."
  },
  {
    "title": "Model your approach",
    "prompt": "Choose a recurring task from your research or coursework. Identify its input, break the process into at least three actionable steps, and define its output. Then trace the steps in order.",
    "hint": "Use one action per step. Ask what each step needs from the previous step. The trace follows your written steps; it does not execute or evaluate them.",
    "success": "The workflow has an input, at least three steps, and an output. Trace it and check whether each step has what it needs.",
    "retry": "Describe an input, three actions, and an output.",
    "reflection": "Could a colleague follow these steps without guessing? Identify an assumption, an ambiguous action, or a dependency you need to make explicit."
  },
  {
    "title": "Test your approach",
    "prompt": "Design two test cases for your workflow: one typical input and one edge case, such as missing data, duplicates, or no results. Predict an outcome for each before tracing the steps.",
    "hint": "For each case, describe what goes in and what you expect to happen. If the edge case breaks your method, revisit mission 3 and improve it.",
    "success": "Both cases contain an input and an expected result. Compare them with your workflow; this check does not judge whether the predictions are correct.",
    "retry": "Complete the input and expected result for both the typical and edge cases.",
    "reflection": "Trace your edge case through mission 3. At which step does the input challenge an assumption? Revise the procedure or explain why no change is needed."
  },
  {
    "title": "Connect your work",
    "prompt": "Link to a resource that informs your work: a paper, dataset, method, professional page, or tool. Use link text that tells a reader why the resource is relevant.",
    "hint": "Use a full https:// or http:// address and name the resource rather than writing “click here.”",
    "success": "Your profile now connects readers to a relevant resource.",
    "retry": "Add a full web address and a meaningful name for the resource."
  }
];
  const fields = [
    [{label:'Your name or preferred name', placeholder:'Alex', type:'text'}],
    [{label:'Your question, project, or research focus', placeholder:'What are you curious about?', type:'textarea'}],
    [
      {label:'Input — what do you start with?', placeholder:'Materials, data, or a question', type:'textarea'},
      {label:'Action 1', placeholder:'What do you do first?', type:'text'},
      {label:'Action 2', placeholder:'What happens next?', type:'text'},
      {label:'Action 3', placeholder:'How do you finish?', type:'text'},
      {label:'Output — what should you have at the end?', placeholder:'The result of your steps', type:'textarea'}
    ],
    [
      {label:'Typical case — input', placeholder:'A common situation', type:'textarea'},
      {label:'Typical case — expected result', placeholder:'What should happen?', type:'textarea'},
      {label:'Edge case — input', placeholder:'An unusual or difficult situation', type:'textarea'},
      {label:'Edge case — expected result', placeholder:'What should happen then?', type:'textarea'}
    ],
    [
      {label:'Resource web address', placeholder:'https://example.com', type:'url'},
      {label:'Name of the resource', placeholder:'A resource that informs my work', type:'text'}
    ]
  ];
  const responses = fields.map(group => group.map(() => ''));
  const drafts = missions.map(() => '');
  const checked = missions.map(() => false);
  const visited = new Set([0]);
  let current = 0;
  let mode = 'guided';
  let experimentDraft = null;
  let previewTimer;
  let wasComplete = false;
  let traceStep = -1;
  const editor = $('#challenge-editor');
  const fragment = code => { const t = document.createElement('template'); t.innerHTML = code; return t.content; };
  const hasText = el => {
    if (!el) return false;
    const clone = el.cloneNode(true);
    clone.querySelectorAll('script, style, template').forEach(e => e.remove());
    return !!clone.textContent.trim();
  };
  function buildMissionHTML(index) {
    const values = responses[index].map(value => escapeHTML(value.trim()));
    if (!values.some(Boolean)) return '';
    if (index === 0) return `<h1>${values[0]}</h1>`;
    if (index === 1) return `<p>${values[0]}</p>`;
    if (index === 2) {
      const [input, first, second, third, output] = values;
      const steps = [first, second, third].filter(Boolean);
      return `<section class="workflow">\n  <h2>How I approach a problem</h2>${input ? `\n  <h3>Input</h3>\n  <p class="input">${input}</p>` : ''}${steps.length ? `\n  <h3>Process</h3>\n  <ol>\n${steps.map(step => `    <li>${step}</li>`).join('\n')}\n  </ol>` : ''}${output ? `\n  <h3>Output</h3>\n  <p class="output">${output}</p>` : ''}\n</section>`;
    }
    if (index === 3) {
      const [typicalInput, typicalExpected, edgeInput, edgeExpected] = values;
      const caseHTML = (kind, title, input, expected) => input || expected ? `\n    <li class="${kind}">\n      <h3>${title}</h3>${input ? `\n      <p class="input">${input}</p>` : ''}${expected ? `\n      <p class="expected">${expected}</p>` : ''}\n    </li>` : '';
      return `<section class="test-cases">\n  <h2>Testing my approach</h2>\n  <ul>${caseHTML('typical', 'Typical case', typicalInput, typicalExpected)}${caseHTML('edge', 'Edge case', edgeInput, edgeExpected)}\n  </ul>\n</section>`;
    }
    return `<a href="${values[0]}">${values[1]}</a>`;
  }
  function renderGuidedFields() {
    const panel = $('#guided-fields');
    panel.innerHTML = fields[current].map((field, index) => `<label class="guided-field" for="mission-response-${index}"><span>${escapeHTML(field.label)}</span>${field.type === 'textarea' ? `<textarea id="mission-response-${index}" data-response="${index}" rows="3" placeholder="${escapeHTML(field.placeholder)}"></textarea>` : `<input id="mission-response-${index}" data-response="${index}" type="${field.type}" placeholder="${escapeHTML(field.placeholder)}">`}</label>`).join('');
    panel.querySelectorAll('[data-response]').forEach((input, index) => { input.value = responses[current][index]; });
  }
  function workflowNodes(dom) {
    const sections = [...dom.querySelectorAll('section')];
    const ready = sections.find(section => hasText(section.querySelector('p.input')) && hasText(section.querySelector('p.output')) && [...section.querySelectorAll('ol')].some(ol => [...ol.children].filter(li => li.tagName === 'LI' && hasText(li)).length >= 3));
    const section = ready || sections[0];
    const lists = [...(section?.querySelectorAll('ol') || [])];
    const list = lists.find(ol => [...ol.children].filter(li => li.tagName === 'LI' && hasText(li)).length >= 3) || lists[0];
    return {input: section?.querySelector('p.input'), output: section?.querySelector('p.output'), steps: [...(list?.children || [])].filter(li => li.tagName === 'LI' && hasText(li))};
  }
  function valid(index) {
    const dom = fragment(drafts[index]);
    if (index === 0) return [...dom.querySelectorAll('h1')].some(hasText);
    if (index === 1) return [...dom.querySelectorAll('p')].some(hasText);
    if (index === 2) { const workflow = workflowNodes(dom); return hasText(workflow.input) && hasText(workflow.output) && workflow.steps.length >= 3; }
    if (index === 3) return [...dom.querySelectorAll('ul')].some(ul => ['typical', 'edge'].every(kind => [...ul.children].some(li => li.tagName === 'LI' && li.classList.contains(kind) && hasText(li.querySelector('p.input')) && hasText(li.querySelector('p.expected')))));
    return [...dom.querySelectorAll('a[href]')].some(a => {
      if (!hasText(a)) return false;
      try { const url = new URL(a.getAttribute('href').trim()); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname; } catch { return false; }
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
    .workflow { border-top: 1px solid #2C64E8; margin-top: 22px; }
    .test-cases .input:before { content: "Input: "; font-weight: 600; }
    .expected:before { content: "Expected: "; font-weight: 600; }
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
      const href = a.getAttribute('href') || '';
      let allowed = false;
      try { allowed = ['http:', 'https:'].includes(new URL(href).protocol); } catch {}
      if (!allowed) { a.removeAttribute('href'); a.classList.add('preview-link'); }
      else { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
    });
    if (preview && mode === 'guided' && current === 2 && traceStep >= 0) {
      const active = dom.querySelector('.current-fragment');
      const step = active && workflowNodes(active).steps[traceStep];
      if (step) step.classList.add('trace-active');
    }
    const container = document.createElement('div'); container.append(dom);
    const empty = preview && !container.textContent.trim() && !container.querySelector('img') ? `<p class="empty-introduction">Your story starts with a hello.<br>${mode === 'guided' ? 'Fill in a field to see it here.' : 'Type in the editor to see it here.'}</p>` : '';
    const previewCSS = preview ? '.mission-fragment{padding:8px 12px;margin:0 -12px 8px;min-height:8px}.current-fragment{background:#e9f8ff;outline:1px dashed #2C64E8;border-radius:8px}.trace-active{background:#BDEBFF;outline:2px solid #0A038E;border-radius:4px}.empty-introduction{color:#000;font-size:14px;text-align:center;padding:54px 0}' : '';
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none';">\n  <title>My introduction</title>\n  <style>${pageCSS}${previewCSS}</style>\n</head>\n<body>\n${container.innerHTML}${empty}\n</body>\n</html>`;
  }
  function renderPreview() {
    clearTimeout(previewTimer);
    $('#challenge-preview').srcdoc = makeDocument(mode === 'guided' ? assembled(true) : experimentDraft, true);
  }
  function workflowParts() {
    const nodes = workflowNodes(fragment(drafts[2]));
    return { input: nodes.input?.textContent.trim() || '', steps: nodes.steps.map(li => li.textContent.trim()), output: nodes.output?.textContent.trim() || '' };
  }
  function updateTrace() {
    const parts = workflowParts();
    const ready = valid(2);
    $('#trace-next').disabled = !ready;
    $('#trace-reset').disabled = traceStep < 0;
    $('#trace-help').textContent = ready ? 'Follow your written procedure. This is a walkthrough, not an execution engine.' : 'Add an input, three steps, and an output to enable the walkthrough.';
    $('#trace-next').textContent = traceStep < 0 ? 'Trace first step →' : traceStep < parts.steps.length - 1 ? 'Next step →' : traceStep === parts.steps.length - 1 ? 'Compare with output →' : 'Trace again ↺';
    $('#trace-position').textContent = traceStep < 0 ? 'START / INPUT' : traceStep < parts.steps.length ? `STEP ${traceStep + 1} / ${parts.steps.length}` : 'FINISH / OUTPUT';
    $('#trace-content').textContent = traceStep < 0 ? parts.input || 'Your input description will appear here.' : traceStep < parts.steps.length ? parts.steps[traceStep] : parts.output;
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
    $('#guided-fields').hidden = false;
    $('#mission-editor-pane').hidden = true;
    $('#mission-kicker').textContent = `MISSION ${index + 1} / 5`;
    $('#mission-title').textContent = mission.title + '.';
    $('#mission-instruction').textContent = mission.prompt;
    $('#mission-hint').open = false;
    $('#mission-hint-text').textContent = mission.hint;
    $('#workflow-trace').hidden = index !== 2;
    $('#reasoning-prompt').hidden = !mission.reflection;
    $('#reasoning-text').textContent = mission.reflection || '';
    renderGuidedFields();
    editor.classList.remove('full-page-editor');
    setFeedback(checked[index] ? mission.success : '', checked[index]);
    updateTrace(); renderProgress(); renderPreview();
    if (focus) $('#mission-title').focus();
  }
  $('#mission-progress').innerHTML = missions.map((m, i) => `<li><button type="button" data-mission="${i}"><span class="mission-step-number">${i + 1}</span><span>${m.title}</span></button></li>`).join('');
  $('#mission-progress').addEventListener('click', e => { const b = e.target.closest('[data-mission]'); if (b) selectMission(Number(b.dataset.mission), true); });
  $('#guided-fields').addEventListener('input', e => {
    const field = e.target.closest('[data-response]');
    if (!field) return;
    responses[current][Number(field.dataset.response)] = field.value;
    drafts[current] = buildMissionHTML(current);
    if (checked[current]) checked[current] = valid(current);
    if (current === 2) traceStep = -1;
    setFeedback(''); updateTrace(); renderProgress();
    clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
  });
  editor.addEventListener('input', () => {
    if (mode !== 'experiment') return;
    experimentDraft = editor.value;
    clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
  });
  $('#trace-next').addEventListener('click', () => {
    const parts = workflowParts();
    traceStep = traceStep >= parts.steps.length ? -1 : traceStep + 1;
    updateTrace(); renderPreview();
    $('#trace-announcement').textContent = $('#trace-position').textContent + ': ' + $('#trace-content').textContent;
  });
  $('#trace-reset').addEventListener('click', () => { traceStep = -1; updateTrace(); renderPreview(); $('#trace-announcement').textContent = 'Trace restarted. Input: ' + workflowParts().input; });
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
    responses[current].fill(''); drafts[current] = ''; checked[current] = false;
    if (current === 2) traceStep = -1;
    selectMission(current); setFeedback('A fresh start for this mission. Your other steps are unchanged.'); $('#guided-fields [data-response]').focus();
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
    $('#workflow-trace').hidden = true;
    editor.classList.remove('structured-mission-editor');
    $('#guided-controls').hidden = true; $('#experiment-controls').hidden = false; $('#mission-step-controls').hidden = true;
    $('#guided-fields').hidden = true; $('#mission-editor-pane').hidden = false;
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
