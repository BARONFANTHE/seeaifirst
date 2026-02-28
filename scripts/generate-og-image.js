// OG Image Generator — optional tool, run manually
// Usage: node scripts/generate-og-image.js
// Requires: npm install (canvas is a devDependency)
// Not part of build pipeline — run only when stats change

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 630;
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Background gradient
const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
grad.addColorStop(0, '#1a1b2e');
grad.addColorStop(1, '#2d2f45');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Brain emoji
ctx.font = '60px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('\u{1F9E0}', WIDTH / 2, 120);

// Title
ctx.font = 'bold 72px sans-serif';
ctx.fillStyle = '#ffffff';
ctx.fillText('AI Mindmap 2026', WIDTH / 2, 230);

// Subtitle
ctx.font = '24px sans-serif';
ctx.fillStyle = '#a0a0b8';
ctx.fillText('B\u1EA3n \u0111\u1ED3 AI Ecosystem cho Developers Vi\u1EC7t Nam', WIDTH / 2, 285);

// Badges
const badges = ['66 Tools', '13 Sections', 'Curated'];
const badgeY = 370;
const badgeHeight = 44;
const badgePadX = 28;
const badgeGap = 24;
const badgeColor = '#7c8aff';
const badgeRadius = 10;

ctx.font = '20px sans-serif';
const badgeWidths = badges.map(b => ctx.measureText(b).width + badgePadX * 2);
const totalBadgeWidth = badgeWidths.reduce((a, b) => a + b, 0) + badgeGap * (badges.length - 1);
let bx = (WIDTH - totalBadgeWidth) / 2;

badges.forEach((label, i) => {
  const bw = badgeWidths[i];
  const by = badgeY - badgeHeight / 2;

  // Rounded rect border
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, badgeHeight, badgeRadius);
  ctx.strokeStyle = badgeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text
  ctx.fillStyle = badgeColor;
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, bx + bw / 2, badgeY + 7);

  bx += bw + badgeGap;
});

// Footer
ctx.font = '16px sans-serif';
ctx.fillStyle = '#6b6b80';
ctx.textAlign = 'center';
ctx.fillText('seeaifirst.com \u2022 v6.2', WIDTH / 2, HEIGHT - 40);

// Save
const outPath = path.join(__dirname, '..', 'og-image.png');
const buf = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buf);
console.log('Generated:', outPath);
console.log('Size:', (buf.length / 1024).toFixed(1) + ' KB');
console.log('Dimensions:', WIDTH + 'x' + HEIGHT);
