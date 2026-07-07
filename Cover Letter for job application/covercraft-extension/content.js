// CoverCraft -- content script
// Runs on job listing pages, extracts JD text, stores in storage
var _api = (typeof chrome !== 'undefined' && chrome.storage) ? chrome
         : (typeof browser !== 'undefined' && browser.storage) ? browser
         : null;

(function () {
  const url = window.location.href;
  let role = '';
  let company = '';
  let jd = '';

  // ── LinkedIn ──────────────────────────────────────────────────────────────
  if (url.includes('linkedin.com/jobs/view')) {
    role =
      document.querySelector('.job-details-jobs-unified-top-card__job-title h1')?.innerText?.trim() ||
      document.querySelector('.jobs-unified-top-card__job-title')?.innerText?.trim() ||
      '';
    company =
      document.querySelector('.job-details-jobs-unified-top-card__company-name')?.innerText?.trim() ||
      document.querySelector('.jobs-unified-top-card__company-name')?.innerText?.trim() ||
      '';
    jd =
      document.querySelector('.jobs-description__content .jobs-box__html-content')?.innerText?.trim() ||
      document.querySelector('#job-details')?.innerText?.trim() ||
      document.querySelector('.jobs-description-content__text')?.innerText?.trim() ||
      '';
  }

  // ── Internshala ───────────────────────────────────────────────────────────
  else if (url.includes('internshala.com')) {
    role =
      document.querySelector('.profile-overview h1')?.innerText?.trim() ||
      document.querySelector('.heading_4_5')?.innerText?.trim() ||
      '';
    company =
      document.querySelector('.company-name a')?.innerText?.trim() ||
      document.querySelector('.heading_6')?.innerText?.trim() ||
      '';
    jd =
      document.querySelector('#about-internship .internship-details')?.innerText?.trim() ||
      document.querySelector('.internship-details')?.innerText?.trim() ||
      document.querySelector('#about-job .job-details')?.innerText?.trim() ||
      '';
  }

  // ── Wellfound / AngelList ─────────────────────────────────────────────────
  else if (url.includes('wellfound.com') || url.includes('angel.co')) {
    role =
      document.querySelector('h1[class*="title"]')?.innerText?.trim() ||
      document.querySelector('h1')?.innerText?.trim() ||
      '';
    company =
      document.querySelector('[class*="startupName"]')?.innerText?.trim() ||
      document.querySelector('[class*="company"] h2')?.innerText?.trim() ||
      '';
    jd =
      document.querySelector('[class*="jobDescription"]')?.innerText?.trim() ||
      document.querySelector('.prose')?.innerText?.trim() ||
      document.querySelector('[data-test="JobDescription"]')?.innerText?.trim() ||
      '';
  }

  // ── Naukri ────────────────────────────────────────────────────────────────
  else if (url.includes('naukri.com')) {
    role =
      document.querySelector('.jd-header-title')?.innerText?.trim() ||
      document.querySelector('h1.title')?.innerText?.trim() ||
      '';
    company =
      document.querySelector('.jd-header-comp-name a')?.innerText?.trim() ||
      document.querySelector('.comp-name')?.innerText?.trim() ||
      '';
    jd =
      document.querySelector('.job-desc')?.innerText?.trim() ||
      document.querySelector('.dang-inner-html')?.innerText?.trim() ||
      document.querySelector('[class*="job-description"]')?.innerText?.trim() ||
      '';
  }

  // ── Fallback: grab the largest text block on the page ─────────────────────
  if (!jd) {
    const candidates = Array.from(
      document.querySelectorAll('section, article, div[class*="desc"], div[class*="detail"], div[class*="about"]')
    )
      .filter(el => el.innerText && el.innerText.length > 300)
      .sort((a, b) => b.innerText.length - a.innerText.length);

    jd = candidates[0]?.innerText?.trim() || '';
  }

  if (jd && _api) {
    _api.storage.local.set({
      covercraft_extracted: { role, company, jd, url, timestamp: Date.now() }
    });
  }
})();
