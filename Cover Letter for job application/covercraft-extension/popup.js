// CoverCraft -- popup.js
// Cross-browser storage helpers.
// Firefox: browser.storage.local returns Promises natively.
// Chrome:  chrome.storage.local uses callbacks -- we wrap them.
function get(keys) {
  if (typeof browser !== 'undefined' && browser.storage) {
    return browser.storage.local.get(keys);
  }
  return new Promise(function(r) { chrome.storage.local.get(keys, r); });
}
function set(obj) {
  if (typeof browser !== 'undefined' && browser.storage) {
    return browser.storage.local.set(obj);
  }
  return new Promise(function(r) { chrome.storage.local.set(obj, r); });
}
function clearStorage() {
  if (typeof browser !== 'undefined' && browser.storage) {
    return browser.storage.local.clear();
  }
  return new Promise(function(r) { chrome.storage.local.clear(r); });
}

const DEFAULT_PROFILE = `Name: Tanish Anand
Degree: B.Tech Data Science & AI, IIT Guwahati (graduating 2028), CGPA 7.38
DSA: 250+ problems across Codeforces, LeetCode, InterviewBit

Projects:
1. User Behaviour Intelligence -- XGBoost churn classifier (ROC-AUC 0.778) on 1,067,371 retail transactions, K-Means segmentation, cohort retention analysis (22.5% Month-1 retention), live Streamlit dashboard. Caught and fixed data leakage by removing R-score.
2. IIT Placement Intelligence Platform -- React, FastAPI, PostgreSQL, 9 REST endpoints, Swagger docs, Random Forest (R2=0.67), deployed on Vercel/Render. Covers 13 IITs, 5 years of data.
3. Q-Learning Path Planning -- Reproduced Wang et al. IEEE ICIEA 2022. Basic Q-Learning, Improved Q-Learning, DQN in PyTorch. 100% success rate, 6x faster convergence, 96.5% DQN success on 40x40 grids.
4. AEOS Satellite Scheduling -- Implemented Han et al. IEEE TSMC 2023. Improved Simulated Annealing, Monte Carlo profit evaluation, +24% to +49% over greedy baseline. Team of 3.

Skills: Python, C++, SQL, PyTorch, XGBoost, Scikit-Learn, Pandas, NumPy, FastAPI, React, PostgreSQL, SQLite, Git, Streamlit
Contact: t.anand@iitg.ac.in | github.com/tanish028 | linkedin.com/in/tanish-anand-3a573b36b`.trim();

const SYSTEM_PROMPT = `You are a cover letter writer. Given a candidate profile and a job description, write a cover letter that:
1. Opens with one specific sentence about what the company does or what the role involves -- not generic enthusiasm.
2. Matches 2-3 of the candidate's most relevant projects/skills to what the JD asks for specifically.
3. Mentions any data leakage insight if the role is ML/DS focused.
4. Keeps it under 150 words -- short, specific, no fluff.
5. Ends with one line expressing genuine interest. No "I look forward to hearing from you" cliches.
6. Never uses the words: passionate, eager, enthusiastic, leverage, or synergy.
Output only the cover letter text. No preamble, no explanation, no subject line.`;

const $ = id => document.getElementById(id);

const VIEWS = ['view-onboarding', 'view-main', 'view-settings'];
function showView(name) {
  VIEWS.forEach(id => $(id).classList.add('hidden'));
  $(name).classList.remove('hidden');
}

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  $('icon-sun').classList.toggle('hidden', dark);
  $('icon-moon').classList.toggle('hidden', !dark);
}

$('btn-theme').addEventListener('click', async () => {
  const isDark = document.body.classList.contains('dark');
  applyTheme(!isDark);
  await set({ covercraft_dark: !isDark });
});

function updateWaxSeal(count) {
  const seal  = $('wax-seal');
  const badge = $('history-badge');
  if (count > 0) {
    $('seal-count').textContent = count;
    seal.classList.remove('hidden');
    badge.textContent = count;
    badge.classList.remove('hidden');
  } else {
    seal.classList.add('hidden');
    badge.classList.add('hidden');
  }
}

function renderHistory(history) {
  const list  = $('history-list');
  const empty = $('history-empty');
  if (!history || history.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.innerHTML = history.map((item, i) => {
    const company = escHtml(item.company || 'Unknown company');
    const role    = escHtml(item.role || '');
    const ts      = escHtml(item.timestamp);
    const content = escAttr(item.content);
    const id      = escAttr(item.id);
    const badge   = i === 0 ? '<span class="latest-badge">Latest</span>' : '';
    return `<div class="history-item">
      <div class="history-meta">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="history-company">${company}</span>${badge}
        </div>
        <span class="history-role">${role}</span>
        <span class="history-date">${ts}</span>
      </div>
      <div class="history-actions">
        <button class="history-btn" data-copy="${content}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          copy
        </button>
        <button class="history-btn danger" data-delete="${id}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy);
      const orig = btn.innerHTML;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    });
  });
  list.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const data    = await get(['covercraft_history']);
      const updated = (data.covercraft_history || []).filter(h => h.id !== btn.dataset.delete);
      await set({ covercraft_history: updated });
      renderHistory(updated);
      updateWaxSeal(updated.length);
    });
  });
}

function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(str) { return String(str).replace(/"/g,'&quot;'); }

// ---- PDF.js loader (files downloaded via download_pdfjs.ps1) ----
function loadPdfJs() {
  if (typeof pdfjsLib !== 'undefined') return Promise.resolve(true);
  return new Promise(function(resolve) {
    var script    = document.createElement('script');
    script.src    = 'pdf.min.js';
    script.onload = function() {
      var _rt = (typeof browser !== 'undefined') ? browser : chrome;
      pdfjsLib.GlobalWorkerOptions.workerSrc = _rt.runtime.getURL('pdf.worker.min.js');
      resolve(true);
    };
    script.onerror = function() { resolve(false); };
    document.head.appendChild(script);
  });
}

async function extractPdfText(file) {
  var loaded = await loadPdfJs();
  if (!loaded) throw new Error('PDF.js not found. Run download_pdfjs.ps1 in the extension folder, then reload the extension.');
  var buffer  = await file.arrayBuffer();
  var pdf     = await pdfjsLib.getDocument({ data: buffer }).promise;
  var pages   = [];
  for (var i = 1; i <= pdf.numPages; i++) {
    var page    = await pdf.getPage(i);
    var content = await page.getTextContent();
    pages.push(content.items.map(function(it) { return it.str; }).join(' '));
  }
  var result = pages.join('\n').replace(/\s+/g, ' ').trim();
  if (!result) throw new Error('No text found in PDF. It may be a scanned image -- try .docx or .txt instead.');
  return result;
}

// ---- DOCX parsing (no external dependencies) ----
async function extractDocxText(file) {
  const buffer = await file.arrayBuffer();
  const bytes  = new Uint8Array(buffer);
  let i = 0;
  while (i < bytes.length - 30) {
    if (bytes[i]===0x50 && bytes[i+1]===0x4B && bytes[i+2]===0x03 && bytes[i+3]===0x04) {
      const compression = bytes[i+8]  | (bytes[i+9]  << 8);
      const compSize    = (bytes[i+18]|(bytes[i+19]<<8)|(bytes[i+20]<<16)|(bytes[i+21]<<24)) >>> 0;
      const nameLen     = bytes[i+26] | (bytes[i+27] << 8);
      const extraLen    = bytes[i+28] | (bytes[i+29] << 8);
      const name        = new TextDecoder().decode(bytes.slice(i+30, i+30+nameLen));
      const dataStart   = i + 30 + nameLen + extraLen;
      if (name === 'word/document.xml') {
        const compressed = bytes.slice(dataStart, dataStart + compSize);
        let xml;
        if (compression === 0) {
          xml = new TextDecoder().decode(compressed);
        } else {
          const ds = new DecompressionStream('deflate-raw');
          const w  = ds.writable.getWriter();
          const r  = ds.readable.getReader();
          w.write(compressed);
          w.close();
          const chunks = [];
          for (;;) { const {done, value} = await r.read(); if (done) break; chunks.push(value); }
          const len = chunks.reduce((a, c) => a + c.length, 0);
          const out = new Uint8Array(len);
          let off = 0;
          for (const c of chunks) { out.set(c, off); off += c.length; }
          xml = new TextDecoder().decode(out);
        }
        const texts = [];
        const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
        let m;
        while ((m = re.exec(xml)) !== null) texts.push(m[1]);
        return texts.join(' ').replace(/\s+/g, ' ').trim();
      }
      i = dataStart + compSize;
    } else { i++; }
  }
  throw new Error('Could not parse DOCX. Try saving as .txt and uploading that.');
}

async function parseResume(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt'))  return await file.text();
  if (name.endsWith('.docx')) return await extractDocxText(file);
  if (name.endsWith('.pdf'))  return await extractPdfText(file);
  throw new Error('Unsupported format. Upload .pdf, .docx, or .txt.');
}

async function tailorResume(apiKey, resumeText, jd) {
  var sysPrompt = [
    'You are a professional resume tailoring expert. Given a resume and job description:',
    '1. Rewrite bullet points to match JD keywords and requirements',
    '2. Reorder bullets to surface most relevant experience first',
    '3. Update skills section to highlight what the JD asks for',
    '4. Rewrite summary/objective to target this specific role',
    '5. Do NOT fabricate experience -- only reframe real content in JD language',
    '6. Keep all original sections intact',
    'Output: A complete self-contained HTML document with inline CSS. Clean, professional, ATS-friendly, print-ready (A4).',
    'Include a styled "Print / Save as PDF" button at top-right.',
    'Output HTML only -- no explanation, no markdown code fences.'
  ].join('\n');
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
  var res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: sysPrompt }] },
      contents: [{ parts: [{ text: 'RESUME:\n' + resumeText + '\n\nJOB DESCRIPTION:\n' + jd }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.4 }
    })
  });
  if (!res.ok) {
    var errData = await res.json().catch(function() { return {}; });
    throw new Error((errData.error && errData.error.message) || ('API error ' + res.status));
  }
  var d = await res.json();
  var cands = d && d.candidates;
  var text = cands && cands[0] && cands[0].content && cands[0].content.parts && cands[0].content.parts[0] && cands[0].content.parts[0].text;
  if (!text) throw new Error('Empty response from Gemini.');
  return text.trim().replace(/^```(?:html)?\n?/, '').replace(/\n?```$/, '');
}

// ---- Init ----
async function init() {
  const data = await get(['covercraft_apikey','covercraft_profile','covercraft_extracted','covercraft_dark','covercraft_history','covercraft_resume']);

  applyTheme(!!data.covercraft_dark);

  if (!data.covercraft_apikey) {
    showView('view-onboarding');
    return;
  }

  showView('view-main');

  $('settings-apikey').value  = data.covercraft_apikey;
  $('settings-profile').value = data.covercraft_profile || DEFAULT_PROFILE;
  $('char-count').textContent = $('settings-profile').value.length + ' characters';

  if (data.covercraft_resume) {
    const statusEl   = $('resume-status');
    const uploadText = $('resume-upload-text');
    if (statusEl)   { statusEl.textContent = data.covercraft_resume.length.toLocaleString() + ' chars'; statusEl.style.color = 'var(--cc-success)'; }
    if (uploadText) uploadText.textContent = 'Replace resume';
  }

  const history = data.covercraft_history || [];
  renderHistory(history);
  updateWaxSeal(history.length);

  const ext = data.covercraft_extracted;
  if (ext && (Date.now() - ext.timestamp < 5 * 60 * 1000) && ext.jd) {
    $('jd-input').value = ext.jd;
    const note = $('autofill-note');
    note.textContent = ext.company ? 'from ' + ext.company : 'auto-filled';
    note.classList.remove('hidden');
  }
}

// Onboarding: save key
$('btn-save-key').addEventListener('click', async () => {
  const key = $('input-apikey').value.trim();
  const err = $('onboarding-error');
  if (!key || !key.startsWith('AIza')) {
    err.textContent = 'Paste a valid Gemini API key (starts with AIza).';
    err.classList.remove('hidden');
    return;
  }
  await set({ covercraft_apikey: key, covercraft_profile: DEFAULT_PROFILE });
  err.classList.add('hidden');
  $('settings-apikey').value  = key;
  $('settings-profile').value = DEFAULT_PROFILE;
  $('char-count').textContent  = DEFAULT_PROFILE.length + ' characters';
  renderHistory([]);
  updateWaxSeal(0);
  showView('view-main');
});

// Tab switching
$('tab-generate').addEventListener('click', () => {
  $('tab-generate').classList.add('active');
  $('tab-history').classList.remove('active');
  $('panel-generate').classList.remove('hidden');
  $('panel-history').classList.add('hidden');
});

$('tab-history').addEventListener('click', async () => {
  $('tab-history').classList.add('active');
  $('tab-generate').classList.remove('active');
  $('panel-history').classList.remove('hidden');
  $('panel-generate').classList.add('hidden');
  const data = await get(['covercraft_history']);
  renderHistory(data.covercraft_history || []);
});

// Settings nav
$('btn-settings').addEventListener('click', () => showView('view-settings'));
$('btn-back').addEventListener('click', () => showView('view-main'));

$('settings-profile').addEventListener('input', () => {
  $('char-count').textContent = $('settings-profile').value.length + ' characters';
});

$('btn-save-settings').addEventListener('click', async () => {
  const key     = $('settings-apikey').value.trim();
  const profile = $('settings-profile').value.trim();
  if (key)     await set({ covercraft_apikey: key });
  if (profile) await set({ covercraft_profile: profile });
  const msg = $('settings-msg');
  msg.classList.remove('hidden');
  setTimeout(() => { msg.classList.add('hidden'); showView('view-main'); }, 900);
});

$('btn-clear-key').addEventListener('click', async () => {
  if (!confirm('Remove your API key? This will clear all data.')) return;
  await clearStorage();
  showView('view-onboarding');
});

// Resume upload handler
$('resume-upload').addEventListener('change', async function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var statusEl  = $('resume-status');
  var uploadTxt = $('resume-upload-text');
  statusEl.textContent = 'Parsing...';
  statusEl.style.color = 'var(--cc-text-muted)';
  try {
    var text = await parseResume(file);
    if (!text || text.length < 50) throw new Error('Too little text extracted. Try saving as .txt first.');
    await set({ covercraft_resume: text });
    uploadTxt.textContent = file.name;
    statusEl.textContent  = text.length.toLocaleString() + ' chars extracted';
    statusEl.style.color  = 'var(--cc-success)';
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.style.color = 'var(--cc-danger)';
  }
});

// Generate
$('btn-generate').addEventListener('click', async () => {
  const jd  = $('jd-input').value.trim();
  const err = $('generate-error');
  const btn = $('btn-generate');
  if (!jd) {
    err.textContent = 'Paste a job description first.';
    err.classList.remove('hidden');
    return;
  }
  err.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Writing...';

  const data    = await get(['covercraft_apikey','covercraft_profile','covercraft_extracted','covercraft_history','covercraft_resume']);
  const apiKey  = data.covercraft_apikey;
  const profile = data.covercraft_profile || DEFAULT_PROFILE;
  const resume  = data.covercraft_resume  || '';

  const letterPromise = callGemini(apiKey, profile, jd);
  const resumePromise = resume ? tailorResume(apiKey, resume, jd) : Promise.resolve(null);

  if (resume) {
    $('resume-output-row').classList.remove('hidden');
    $('resume-generating').classList.remove('hidden');
    $('btn-view-resume').classList.add('hidden');
    $('resume-error').classList.add('hidden');
  } else {
    $('resume-output-row').classList.add('hidden');
  }

  try {
    const letter = await letterPromise;
    $('output-text').textContent = letter;
    $('output-section').classList.remove('hidden');
    const plane = $('paper-airplane');
    plane.classList.remove('hidden');
    setTimeout(() => { plane.classList.add('hidden'); }, 1600);
    const ext = data.covercraft_extracted;
    const newEntry = {
      id:        Date.now().toString(),
      company:   (ext && ext.company) ? ext.company : extractCompany(jd),
      role:      (ext && ext.role)    ? ext.role    : '',
      timestamp: new Date().toLocaleString('en-IN', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true }),
      content:   letter,
    };
    const history = [newEntry, ...(data.covercraft_history || [])].slice(0, 50);
    await set({ covercraft_history: history });
    updateWaxSeal(history.length);
  } catch (e) {
    err.textContent = e.message || 'Something went wrong. Check your API key.';
    err.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Write letter';
  }

  if (resume) {
    resumePromise.then(function(html) {
      if (!html) return;
      window._tailoredResumeHtml = html;
      $('resume-generating').classList.add('hidden');
      $('btn-view-resume').classList.remove('hidden');
    }).catch(function(e) {
      $('resume-generating').classList.add('hidden');
      $('resume-error').textContent = 'Resume tailoring failed: ' + (e.message || 'Try again.');
      $('resume-error').classList.remove('hidden');
    });
  }
});

// Copy current letter
$('btn-copy').addEventListener('click', function() {
  var text = $('output-text').textContent;
  navigator.clipboard.writeText(text).then(function() {
    $('btn-copy').textContent = 'Copied!';
    setTimeout(function() {
      $('btn-copy').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> copy';
    }, 2000);
  });
});

// View tailored resume in new tab
$('btn-view-resume').addEventListener('click', function() {
  if (!window._tailoredResumeHtml) return;
  var blob = new Blob([window._tailoredResumeHtml], { type: 'text/html' });
  var url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
});

async function callGemini(apiKey, profile, jd) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
  var res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: 'CANDIDATE PROFILE:\n' + profile + '\n\nJOB DESCRIPTION:\n' + jd }] }],
      generationConfig: { maxOutputTokens: 350, temperature: 0.7 }
    })
  });
  if (!res.ok) {
    var errData = await res.json().catch(function() { return {}; });
    throw new Error((errData.error && errData.error.message) || ('API error ' + res.status));
  }
  var d = await res.json();
  var cands = d && d.candidates;
  var text = cands && cands[0] && cands[0].content && cands[0].content.parts && cands[0].content.parts[0] && cands[0].content.parts[0].text;
  if (!text) throw new Error('Empty response from Gemini. Try again.');
  return text.trim();
}

function extractCompany(jd) {
  var match = jd.match(/(?:at|@|join)\s+([A-Z][A-Za-z0-9&.\s]{1,30}?)(?:\s*[.,\n]|$)/);
  return match ? match[1].trim() : 'Unknown';
}

init().catch(function(e) {
  document.body.innerHTML = '<div style="padding:20px;font-family:sans-serif;font-size:13px;color:#c62828;">Error: ' + e.message + '<br><br>Load via about:debugging in Firefox.</div>';
});
