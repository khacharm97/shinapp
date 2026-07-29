const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function convertPhysicalToLogical(content) {
  let newContent = content;
  
  // Margins
  newContent = newContent.replace(/\bml-([a-z0-9\-\.]+)\b/g, 'ms-$1');
  newContent = newContent.replace(/\bmr-([a-z0-9\-\.]+)\b/g, 'me-$1');
  newContent = newContent.replace(/\b-ml-([a-z0-9\-\.]+)\b/g, '-ms-$1');
  newContent = newContent.replace(/\b-mr-([a-z0-9\-\.]+)\b/g, '-me-$1');
  
  // Paddings
  newContent = newContent.replace(/\bpl-([a-z0-9\-\.]+)\b/g, 'ps-$1');
  newContent = newContent.replace(/\bpr-([a-z0-9\-\.]+)\b/g, 'pe-$1');

  // Positioning
  newContent = newContent.replace(/\bleft-([a-z0-9\-\.]+)\b/g, 'start-$1');
  newContent = newContent.replace(/\bright-([a-z0-9\-\.]+)\b/g, 'end-$1');
  newContent = newContent.replace(/\b-left-([a-z0-9\-\.]+)\b/g, '-start-$1');
  newContent = newContent.replace(/\b-right-([a-z0-9\-\.]+)\b/g, '-end-$1');

  // Text alignment
  newContent = newContent.replace(/\btext-left\b/g, 'text-start');
  newContent = newContent.replace(/\btext-right\b/g, 'text-end');

  // Float
  newContent = newContent.replace(/\bfloat-left\b/g, 'float-start');
  newContent = newContent.replace(/\bfloat-right\b/g, 'float-end');

  // Clear
  newContent = newContent.replace(/\bclear-left\b/g, 'clear-start');
  newContent = newContent.replace(/\bclear-right\b/g, 'clear-end');
  
  // Origin
  newContent = newContent.replace(/\borigin-left\b/g, 'origin-left'); // Wait, origin-left flips automatically? Sometimes yes, sometimes no. Let's keep origin as is or use left/right unless we specifically need it. Actually Tailwind 3.3 doesn't have origin-start. So let's revert origin.
  
  return newContent;
}

const srcDir = path.join(__dirname, 'src');

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const newContent = convertPhysicalToLogical(originalContent);
    if (originalContent !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated RTL classes in:', filePath);
    }
  }
});
