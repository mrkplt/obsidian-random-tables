export interface Table {
  title: string;
  items: string[];
  fileName: string;
}

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

    // Extract title (remove markdown headers if present)
    let title = lines[0].trim();
    title = title.replace(/^#+\s*/, '').trim();

    fileName = fileName.replace(/\.md/g, '');
    
    // Extract list items (lines starting with - or *)
    const items = lines
      .slice(1) // Skip the title line
      .map(line => line.trim())
      .filter(line => line.match(/^[-*]\s+/)) // Only lines that start with - or *
      .map(line => line.replace(/^[-*]\s*/, '').trim()) // Remove the bullet point
      .filter(Boolean); // Remove empty lines

    if (items.length > 0) {
      tables.push({ title, items, fileName });
    }
  }

  return tables;
}
