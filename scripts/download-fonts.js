const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'fonts');
const files = [
  {
    url: 'https://raw.githubusercontent.com/antijingoist/open-dyslexic/master/OpenDyslexic/OpenDyslexic3-Regular.otf',
    name: 'OpenDyslexic3-Regular.otf',
  },
  {
    url: 'https://raw.githubusercontent.com/antijingoist/open-dyslexic/master/OpenDyslexic/OpenDyslexic3-Bold.otf',
    name: 'OpenDyslexic3-Bold.otf',
  },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Request Failed. Status Code: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  try {
    ensureDir(outDir);
    for (const f of files) {
      const dest = path.join(outDir, f.name);
      process.stdout.write(`Downloading ${f.name}... `);
      await download(f.url, dest);
      console.log('done');
    }
    console.log('All fonts downloaded to', outDir);
  } catch (e) {
    console.error('Failed to download fonts:', e.message || e);
    process.exit(1);
  }
}

main();
