const sharp = require('sharp');
const path = require('path');

async function rotateMonth8() {
  const filePath = path.join(__dirname, '..', 'public', 'images', 'bigmovements', 'month-8.jpg');
  const tempPath = path.join(__dirname, '..', 'public', 'images', 'bigmovements', 'month-8-rotated.jpg');

  console.log('Rotating month-8.jpg 90 degrees clockwise...');
  await sharp(filePath)
    .rotate(90) // Rotate 90 deg clockwise
    .toFile(tempPath);

  const fs = require('fs');
  fs.copyFileSync(tempPath, filePath);
  fs.unlinkSync(tempPath);
  console.log('month-8.jpg successfully rotated!');
}

rotateMonth8().catch(console.error);
