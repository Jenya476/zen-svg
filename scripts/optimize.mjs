import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import svgoConfig from '../svgo.config.mjs';

const SRC_DIR = './src';
const OPTIMIZED_DIR = './optimized';

// Ensure optimized directory exists
if (!fs.existsSync(OPTIMIZED_DIR)) {
  fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
}

async function processFile(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if it's a sprite (contains symbols)
  if (content.includes('<symbol')) {
    console.log(`📦 Detecting sprite: ${fileName}`);
    await extractAndOptimizeSymbols(content, fileName);
  } else {
    await optimizeAndSave(content, fileName);
  }
}

async function extractAndOptimizeSymbols(content, sourceFile) {
  // Simple regex to find symbols. 
  // Captures: 1: attributes before id, 2: id, 3: attributes after id, 4: content
  const symbolRegex = /<symbol([^>]*?)id="([^"]+)"([^>]*?)>([\s\S]*?)<\/symbol>/g;
  let match;
  let count = 0;

  while ((match = symbolRegex.exec(content)) !== null) {
    const id = match[2];
    const attrs = match[1] + match[3];
    const symbolContent = match[4];
    
    // Try to find viewBox in attributes
    const viewBoxMatch = attrs.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

    const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${symbolContent}</svg>`;
    
    await optimizeAndSave(svgWrapper, `${id}.svg`, `(extracted from ${sourceFile})`);
    count++;
  }
  
  console.log(`✅ Extracted ${count} icons from ${sourceFile}`);
}

async function optimizeAndSave(svgString, fileName, note = '') {
  try {
    const result = optimize(svgString, {
      ...svgoConfig,
      path: fileName, // path is used for some plugins
    });

    const outputPath = path.join(OPTIMIZED_DIR, fileName);
    fs.writeFileSync(outputPath, result.data);
    console.log(`✨ Optimized: ${fileName} ${note}`);
  } catch (err) {
    console.error(`❌ Error optimizing ${fileName}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Starting smart optimization...');
  
  try {
    const files = fs.readdirSync(SRC_DIR)
      .filter(file => file.endsWith('.svg'));

    if (files.length === 0) {
      console.log('⚠️ No SVG files found in src directory.');
      return;
    }

    for (const file of files) {
      await processFile(path.join(SRC_DIR, file));
    }
    
    console.log('🏁 Optimization complete.');
  } catch (err) {
    console.error('❌ Critical error:', err.message);
    process.exit(1);
  }
}

main();
