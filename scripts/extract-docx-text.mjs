import fs from 'fs';
import zlib from 'zlib';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node extract-docx-text.mjs <path-to-docx> [out-path]');
  process.exit(1);
}

const outPath = process.argv[3] || 'tmp_master_sources.txt';
const buf = fs.readFileSync(path);

function extractFromZip(buffer) {
  const marker = 'word/document.xml';
  const idx = buffer.indexOf(Buffer.from(marker));
  if (idx === -1) throw new Error('document.xml not found in zip');

  const before = buffer.subarray(0, idx);
  const pkIdx = before.lastIndexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  if (pkIdx === -1) throw new Error('local file header not found');

  const nameLen = buffer.readUInt16LE(pkIdx + 26);
  const extraLen = buffer.readUInt16LE(pkIdx + 28);
  const compSize = buffer.readUInt32LE(pkIdx + 18);
  const compMethod = buffer.readUInt16LE(pkIdx + 8);
  const dataStart = pkIdx + 30 + nameLen + extraLen;
  const compressed = buffer.subarray(dataStart, dataStart + compSize);

  let xml;
  if (compMethod === 0) {
    xml = compressed.toString('utf8');
  } else if (compMethod === 8) {
    xml = zlib.inflateRawSync(compressed).toString('utf8');
  } else {
    throw new Error(`unsupported compression method ${compMethod}`);
  }

  const paragraphs = [];
  const pRe = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  const tRe = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  let pm;
  while ((pm = pRe.exec(xml)) !== null) {
    const parts = [];
    let tm;
    while ((tm = tRe.exec(pm[0])) !== null) {
      parts.push(tm[1]);
    }
    const line = parts.join('').replace(/\s+/g, ' ').trim();
    if (line) paragraphs.push(line);
  }
  return paragraphs;
}

const paragraphs = extractFromZip(buf);
fs.writeFileSync(outPath, paragraphs.join('\n'), 'utf8');
console.log(`Extracted ${paragraphs.length} paragraphs to ${outPath}`);
