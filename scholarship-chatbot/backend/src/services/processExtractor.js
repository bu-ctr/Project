// backend/src/services/processExtractor.js
/**
 * Fetch a URL, extract readable text, call Hugging Face text-generation to extract
 * application steps. Save result as array of steps.
 *
 * This module exports: extractProcessFromUrl(url, title) => { steps: [...] }
 *
 * Requires: HF_API_KEY in env for Hugging Face Inference API
 */

const axios = require('axios');
const cheerio = require('cheerio');

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || 'google/flan-t5-small';

async function fetchPageHtml(url) {
  const resp = await axios.get(url, {
    timeout: 10000,
    headers: {
      'User-Agent': 'ScholarshipBot/1.0 (+https://your-domain.example)',
      Accept: 'text/html'
    },
    maxRedirects: 5
  });
  return resp.data;
}

function extractMainText(html) {
  const $ = cheerio.load(html);
  let text = '';
  if ($('article').length) text = $('article').text();
  else if ($('main').length) text = $('main').text();
  else {
    const candidates = $('body').find('div,section,p,h1,h2,h3,li').toArray();
    candidates.sort((a,b) => $(b).text().trim().length - $(a).text().trim().length);
    for (let i=0;i<Math.min(6, candidates.length); i++) {
      text += $(candidates[i]).text() + '\n';
    }
  }
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > 18000) text = text.slice(0,18000);
  return text;
}

async function callHf(prompt) {
  if (!HF_API_KEY) throw new Error('HF_API_KEY not set in .env');
  const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
  const resp = await axios.post(url, { inputs: prompt }, {
    headers: { Authorization: `Bearer ${HF_API_KEY}`, Accept: 'application/json' },
    timeout: 30000
  });
  if (typeof resp.data === 'string') return resp.data;
  if (Array.isArray(resp.data) && resp.data[0]) {
    return resp.data[0].generated_text || resp.data[0].summary_text || JSON.stringify(resp.data[0]);
  }
  if (resp.data && resp.data.generated_text) return resp.data.generated_text;
  return JSON.stringify(resp.data);
}

function parseStepsFromText(output, sourceUrl) {
  // Try to extract JSON first
  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/m);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && Array.isArray(parsed.steps)) return parsed.steps;
    }
  } catch (e) { /* ignore */ }

  // Else build steps from numbered list
  const lines = output.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const steps = [];
  for (const line of lines) {
    const m = line.match(/^(?:\d+[\).:-]?\s*)?(.*)$/);
    if (m && m[1]) {
      const t = m[1].replace(/^[-–—\s]*/, '').trim();
      if (t.length > 10) steps.push({ step: steps.length + 1, text: t });
    }
  }
  if (steps.length > 0) return steps.slice(0, 50);
  // fallback: return single step with short excerpt
  return [{ step: 1, text: output.slice(0, 500) }];
}

async function extractProcessFromUrl(url, title = '') {
  const html = await fetchPageHtml(url);
  const text = extractMainText(html);
  if (!text || text.length < 30) throw new Error('Failed to extract readable content from page (may require JS rendering)');
  const prompt = [
    `You are a helpful assistant. Extract a clear ordered list of application steps from the following scholarship webpage content.`,
    `Title: ${title}`,
    `URL: ${url}`,
    `Content:`,
    text,
    '',
    `Return a JSON object only like: {"steps":[{"step":1,"text":"..."},{"step":2,"text":"..."}],"source":"${url}"}`,
  ].join('\n');
  const modelOut = await callHf(prompt);
  const steps = parseStepsFromText(modelOut, url);
  return { steps, source: url, raw: modelOut };
}

module.exports = { extractProcessFromUrl };
