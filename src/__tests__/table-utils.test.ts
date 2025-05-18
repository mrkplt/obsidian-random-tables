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
    const result = extractTables('simple.md', content);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fileName: 'simple',
      title: 'Weapons',
      items: ['Sword', 'Axe', 'Bow']
    });
  });

  it('should parse multiple tables from markdown file', () => {
    const content = readFixture('equipment-multiple.md');
    const result = extractTables('equipment-multiple.md', content);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      fileName: 'equipment-multiple',
      title: 'Weapons',
      items: ['Sword', 'Axe', 'Dagger', 'Mace']
    });
    expect(result[1]).toEqual({
      fileName: 'equipment-multiple',
      title: 'Armor',
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
    const result = extractTables('empty.md', content);
    
    expect(result).toHaveLength(2);
    expect(result[0].fileName).toBe('empty');
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
    const result = extractTables('empty.md', content);
    
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Weapons');
    expect(result[1].title).toBe('Potions');
  });

  it('should handle empty content', () => {
    const content = '';
    const result = extractTables('empty.md', content);
    expect(result).toEqual([]);
  });

  it('should handle whitespace in items', () => {
    const content = `Weapons
-  Sword  
-  Axe of Doom  `;
    const result = extractTables( 'whitespace.md', content);
    
    expect(result[0]).toEqual({
      fileName: 'whitespace',
      title: 'Weapons',
      items: ['Sword', 'Axe of Doom']
    });
  });

  it('should handle naked list', () => {
    const content = `- Sword
- Axe
- Dagger
- Mace`;
    const result = extractTables('naked.md', content);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fileName: 'naked',
      title: 'RTNakedList',
      items: ['Sword', 'Axe', 'Dagger', 'Mace']
    });
  });

  it('should handle a list with numbers', () => {
    const content = `1. Sword
2. Axe
3. Dagger
4. Mace`;
    const result = extractTables('numbers.md', content);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fileName: 'numbers',
      title: 'RTNakedList',
      items: ['Sword', 'Axe', 'Dagger', 'Mace']
    });
  });
});
