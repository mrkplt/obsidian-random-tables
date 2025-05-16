import { extractTables } from "../src/table-utils";

test("extractTables parses sections correctly", () => {
	const content = `
Weapons
- Sword
- Axe
---
Potions
- Healing
- Mana
`;

	const result = extractTables(content);
	expect(result.length).toBe(2);
	expect(result[0].title).toBe("Weapons");
	expect(result[0].items).toEqual(["Sword", "Axe"]);
	expect(result[1].title).toBe("Potions");
	expect(result[1].items).toEqual(["Healing", "Mana"]);
});
