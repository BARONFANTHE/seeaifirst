#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Exact copy of toSlug() from index.html line 962-963
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

const DATA_PATH = path.join(__dirname, '..', 'data.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

let count = 0;
for (const section of data.sections) {
  for (const card of section.cards) {
    count++;
    const baseSlug = toSlug(card.name);
    console.log(`${section.id.padEnd(18)} | ${card.name.padEnd(45)} → ${baseSlug}`);
  }
}
console.log(`\nTotal: ${count} cards`);
