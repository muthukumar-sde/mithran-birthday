const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');

async function prepareAssets() {
  const imagesDir = path.join(__dirname, '..', 'images');
  const musicDir = path.join(__dirname, '..', 'music');
  const publicDir = path.join(__dirname, '..', 'public');
  const publicImages = path.join(publicDir, 'images');
  const publicMusic = path.join(publicDir, 'music');

  if (!fs.existsSync(publicImages)) fs.mkdirSync(publicImages, { recursive: true });
  if (!fs.existsSync(publicMusic)) fs.mkdirSync(publicMusic, { recursive: true });

  // Copy Music
  const musicFiles = fs.readdirSync(musicDir).filter(f => f.endsWith('.mp3'));
  if (musicFiles.length > 0) {
    const srcMusic = path.join(musicDir, musicFiles[0]);
    const destMusic = path.join(publicMusic, 'birthday.mp3');
    fs.copyFileSync(srcMusic, destMusic);
    console.log(`Copied ${musicFiles[0]} to public/music/birthday.mp3`);
  }

  // Process Images
  const rawImages = fs.readdirSync(imagesDir);
  console.log(`Found ${rawImages.length} images to process...`);

  let count = 1;
  for (const filename of rawImages) {
    const filePath = path.join(imagesDir, filename);
    const ext = path.extname(filename).toLowerCase();
    const photoName = `photo-${String(count).padStart(2, '0')}.jpg`;
    const targetPath = path.join(publicImages, photoName);

    if (ext === '.heic') {
      try {
        console.log(`Converting ${filename} to ${photoName}...`);
        const inputBuffer = fs.readFileSync(filePath);
        const outputBuffer = await heicConvert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 0.85
        });
        fs.writeFileSync(targetPath, outputBuffer);
        console.log(`Converted ${filename} -> ${photoName}`);
        count++;
      } catch (err) {
        console.error(`Error converting HEIC file ${filename}:`, err);
      }
    } else if (ext === '.jpg' || ext === '.jpeg') {
      console.log(`Copying ${filename} to ${photoName}...`);
      fs.copyFileSync(filePath, targetPath);
      count++;
    }
  }

  console.log(`Asset preparation finished. Processed ${count - 1} photos.`);
}

prepareAssets().catch(console.error);
