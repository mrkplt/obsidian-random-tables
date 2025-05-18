export interface Table {
  title: string;
  items: string[];
  fileName: string;
}

export const NakedTableName = 'RTNakedList';

export function extractTables(fileName: string, content: string): Table[] {
  // Handle empty content
  if (!content.trim()) {
    return [];
  }

  // Split content into sections separated by horizontal rules (---)
  const sections = content.split(/\n-{3,}\n/);
  const tables: Table[] = [];

  for (const section of sections) {
    const lines = section.trim().split(/\r?\n/);
    if (lines.length < 2) continue;

    fileName = fileName.replace(/\.md/g, '');
    let title;

    const isListFile = lines[0].match(/^(?:\d+\.|[*-])\s/)

    if (isListFile) {
      title = NakedTableName
    } else {
      title = lines[0].trim();
      title = title.replace(/^#+\s*/, '').trim();
    }

    // Extract list items (lines starting with - or *)
    const items = lines
      .filter((_, index) => isListFile || index != 0)
      .map(line => line.trim())
      .filter(line => line.match(/^(?:\d+\.|[*-])\s/))
      .map(line => line.replace(/^(?:\d+\.|[*-])\s*/, '').trim())
      .filter(Boolean); // Remove empty lines

    if (items.length > 0) {
      tables.push({ title, items, fileName });
    }
  }

  return tables;
}
