import { extractTables } from '../table-utils';
import * as fs from 'fs';
import * as path from 'path';

const readFixture = (filename: string): string => {
  const fixturePath = path.join(__dirname, '__fixtures__', 'RandomTables', filename);
  return fs.readFileSync(fixturePath, 'utf-8');
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
      title: '## Weapons',
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
