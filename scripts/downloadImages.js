import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, '..', 'public', 'templates');
const CONFIG_FILE = path.join(__dirname, 'templateImages.json');

const FILE_MAPPING = {
  'capa': 'pg1_capa',
  'background': 'bg_2_Pdf',
  'jornada': 'pg5_jornada'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
          if (response.statusCode === 302 || response.statusCode === 301) {
            return downloadImage(response.headers.location, 1).then(resolve).catch(reject);
          }
          
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }

          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        }).on('error', reject);
      });
    } catch (error) {
      if (attempt < retries) {
        console.log(`  ⚠️  Attempt ${attempt} failed, retrying...`);
        await sleep(2000);
      } else {
        throw error;
      }
    }
  }
}

async function processImage(imageConfig, settings) {
  const { name, url, description } = imageConfig;
  const fileName = FILE_MAPPING[name];
  
  if (!fileName) {
    throw new Error(`Unknown image name: ${name}`);
  }

  console.log(`\n📦 Processing: ${description}`);
  console.log(`📥 URL: ${url}`);

  try {
    const imageBuffer = await downloadImage(url, settings.retryAttempts);
    console.log(`  ✅ Downloaded successfully`);

    const pngPath = path.join(TEMPLATE_DIR, `${fileName}.png`);
    await sharp(imageBuffer).png().toFile(pngPath);
    console.log(`  ✅ Saved: ${fileName}.png`);

    const webpPath = path.join(TEMPLATE_DIR, `${fileName}.webp`);
    await sharp(imageBuffer).webp({ quality: settings.webpQuality }).toFile(webpPath);
    console.log(`  ✅ Saved: ${fileName}.webp`);

    return { success: true, name, fileName };
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return { success: false, name, fileName, error: error.message };
  }
}

async function main() {
  console.log('🚀 Bulk Template Image Downloader\n');

  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`❌ Config file not found: ${CONFIG_FILE}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  const enabledImages = config.images.filter(img => img.enabled && img.url);

  if (enabledImages.length === 0) {
    console.error('❌ No enabled images with URLs found in config');
    process.exit(1);
  }

  if (!fs.existsSync(TEMPLATE_DIR)) {
    fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
  }

  console.log(`📋 Found ${enabledImages.length} image(s) to process`);
  console.log(`⚙️  Settings: ${config.settings.retryAttempts} retries, ${config.settings.webpQuality}% WebP quality\n`);

  const results = [];
  for (const imageConfig of enabledImages) {
    const result = await processImage(imageConfig, config.settings);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (successful.length > 0) {
    console.log('\n✅ Successfully processed:');
    successful.forEach(r => console.log(`  - ${r.fileName} (${r.name})`));
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed to process:');
    failed.forEach(r => console.log(`  - ${r.fileName} (${r.name}): ${r.error}`));
  }

  console.log(`\n📁 Output directory: ${TEMPLATE_DIR}`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
