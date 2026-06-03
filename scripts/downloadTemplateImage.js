import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, '..', 'public', 'templates');
const FILE_NAMES = ['pg1_capa', 'bg_2_Pdf', 'pg5_jornada'];

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const cdnUrl = process.argv[2];
  
  if (!cdnUrl) {
    console.error('❌ Error: Please provide a CDN URL');
    console.log('Usage: node scripts/downloadTemplateImage.js <CDN_URL>');
    process.exit(1);
  }

  console.log('🚀 Starting image download and conversion...\n');
  console.log(`📥 Downloading from: ${cdnUrl}\n`);

  try {
    // Ensure templates directory exists
    if (!fs.existsSync(TEMPLATE_DIR)) {
      fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    }

    // Download image
    const imageBuffer = await downloadImage(cdnUrl);
    console.log('✅ Image downloaded successfully\n');

    // Process and save each file
    for (const fileName of FILE_NAMES) {
      console.log(`📝 Processing: ${fileName}`);
      
      // Save PNG
      const pngPath = path.join(TEMPLATE_DIR, `${fileName}.png`);
      await sharp(imageBuffer).png().toFile(pngPath);
      console.log(`  ✅ Saved: ${fileName}.png`);
      
      // Save WebP
      const webpPath = path.join(TEMPLATE_DIR, `${fileName}.webp`);
      await sharp(imageBuffer).webp({ quality: 90 }).toFile(webpPath);
      console.log(`  ✅ Saved: ${fileName}.webp\n`);
    }

    console.log('🎉 All files saved successfully!');
    console.log(`📁 Location: ${TEMPLATE_DIR}`);
    console.log('\n📋 Files created:');
    FILE_NAMES.forEach(name => {
      console.log(`  - ${name}.png`);
      console.log(`  - ${name}.webp`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
