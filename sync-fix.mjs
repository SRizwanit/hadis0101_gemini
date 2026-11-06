import fs from 'fs';

console.log('Running sync-fix anchor generation...');
const origPath = 'hadis0101.json';
if (!fs.existsSync(origPath)) {
  console.error('Error: hadis0101.json not found.');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(origPath, 'utf8'));
const scale = 38.32 / 37.0;
const fixed = raw.map((w, idx) => ({
  word: w.word,
  start: Math.round(w.start * scale * 1000) / 1000,
  end: Math.round(w.end * scale * 1000) / 1000,
}));

fs.writeFileSync('hadis0101.synced.json', JSON.stringify(fixed, null, 2));
console.log('hadis0101.synced.json successfully generated.');
