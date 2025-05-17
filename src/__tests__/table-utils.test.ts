import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { extractTables } from '../table-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readFixture = (filename: string): string => {
  const fixturePath = join(__dirname, '__fixtures__', 'RandomTables', filename);
  return readFileSync(fixturePath, 'utf-8');
};

describe('extractTables', () => {
  it('should parse a simple table with one section', () => {
    const content = `Weapons
- Sword
- Axe
- Bow`;
    const result = extractTables(content);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: 'Weapons',
      items: ['Sword', 'Axe', 'Bow']
    });
  });

  it('should parse multiple tables from markdown file', () => {
    const content = readFixture('equipment.md');
    const result = extractTables(content);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      title: 'Weapons',
      items: ['Sword', 'Axe', 'Dagger', 'Mace']
    });
    expect(result[1]).toEqual({
      title: '## Armor',
      items: ['Chainmail', 'Plate', 'Leather']
    });
  });

  it('should ignore empty sections', () => {
    const content = `Weapons
- Sword
- Axe
---

---
Potions
- Health`;
    const result = extractTables(content);
    
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Weapons');
    expect(result[1].title).toBe('Potions');
  });

  it('should ignore sections without items', () => {
    const content = `Weapons
- Sword
- Axe
---
Empty Section
---
Potions
- Health`;
    const result = extractTables(content);
    
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Weapons');
    expect(result[1].title).toBe('Potions');
  });

  it('should handle empty content', () => {
    const content = '';
    const result = extractTables(content);
    expect(result).toEqual([]);
  });

  it('should handle whitespace in items', () => {
    const content = `Weapons
-  Sword  
-  Axe of Doom  `;
    const result = extractTables(content);
    
    expect(result[0]).toEqual({
      title: 'Weapons',
      items: ['Sword', 'Axe of Doom']
    });
  });
});
