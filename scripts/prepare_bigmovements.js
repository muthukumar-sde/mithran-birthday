const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');

async function processBigMovements() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'bigmovements');
  if (!fs.existsSync(dir)) {
    console.error('bigmovements directory not found');
    return;
  }

  const files = fs.readdirSync(dir);
  console.log(`Processing ${files.length} files in bigmovements...`);

  for (const filename of files) {
    const filePath = path.join(dir, filename);
    const ext = path.extname(filename).toLowerCase();
    const baseName = path.basename(filename, path.extname(filename));

    // Convert HEIC or rename JPG/JPEG to .jpg
    const targetJpgName = `${baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}.jpg`;
    const targetPath = path.join(dir, targetJpgName);

    if (ext === '.heic') {
      try {
        console.log(`Converting ${filename} to ${targetJpgName}...`);
        const inputBuffer = fs.readFileSync(filePath);
        const outputBuffer = await heicConvert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 0.85,
        });
        fs.writeFileSync(targetPath, outputBuffer);
        console.log(`Converted ${filename} -> ${targetJpgName}`);
      } catch (err) {
        console.error(`Error converting ${filename}:`, err);
      }
    } else if (ext === '.jpg' || ext === '.jpeg') {
      if (filePath !== targetPath) {
        console.log(`Normalizing ${filename} -> ${targetJpgName}...`);
        fs.copyFileSync(filePath, targetPath);
      }
    }
  }

  console.log('Big Movements asset processing finished.');
}

processBigMovements().catch(console.error);
