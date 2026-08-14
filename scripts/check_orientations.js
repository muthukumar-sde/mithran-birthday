const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function checkOrientations() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'bigmovements');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

  for (const file of files) {
    const meta = await sharp(path.join(dir, file)).metadata();
    console.log(`${file}: ${meta.width}x${meta.height} (Orientation: ${meta.orientation})`);
  }
}

checkOrientations().catch(console.error);
