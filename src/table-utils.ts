export function extractTables(content: string): { title: string, items: string[] }[] {
	const sections = content.split(/\n-{3,}\n/);
	const tables = [];

	for (const section of sections) {
		const lines = section.trim().split(/\n+/);
		if (lines.length < 2) continue;

		const title = lines[0].trim();
		const items = lines.slice(1).filter(line => line.startsWith("-")).map(line => line.slice(1).trim());
		if (items.length > 0) {
			tables.push({ title, items });
		}
	}

	return tables;
}
