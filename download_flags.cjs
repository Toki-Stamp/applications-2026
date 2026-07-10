const fs = require('fs');
const https = require('https');
const path = require('path');
const { getCountries } = require('libphonenumber-js');

const flagsDir = path.join(__dirname, 'public', 'flags');

if (!fs.existsSync(flagsDir)) {
  fs.mkdirSync(flagsDir, { recursive: true });
}

const countries = getCountries();
let downloaded = 0;
let errors = 0;

const downloadFlag = (countryCode) => {
  return new Promise((resolve) => {
    const lowerCode = countryCode.toLowerCase();
    const url = `https://flagcdn.com/w20/${lowerCode}.png`;
    const dest = path.join(flagsDir, `${lowerCode}.png`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          downloaded++;
          resolve(true);
        });
      } else {
        console.error(`Failed to download ${countryCode}: ${response.statusCode}`);
        errors++;
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${countryCode}: ${err.message}`);
      errors++;
      resolve(false);
    });
  });
};

async function downloadAll() {
  console.log(`Starting download of ${countries.length} flags...`);
  // Do it in batches to avoid overwhelming the server
  const batchSize = 20;
  for (let i = 0; i < countries.length; i += batchSize) {
    const batch = countries.slice(i, i + batchSize);
    await Promise.all(batch.map(downloadFlag));
    console.log(`Downloaded ${downloaded}/${countries.length}`);
  }
  console.log(`Finished. Success: ${downloaded}, Errors: ${errors}`);
}

downloadAll();
