import * as fs from "fs";

export let symbols: any = [];

export function getSymbols() {
	console.log("[SYMBOLS]: GET SYMBOLS");
	const jsonString = fs.readFileSync("SPELL.json").toString();
	const json = JSON.parse(jsonString);
	Object.values(json.nodes).forEach((node: any) => {
		if (node.layer === "descriptor" && node.type === "symbol") {
			let symbol: any = JSON.parse(JSON.stringify(node));
			symbols.push(symbol);
		}
	});
	console.log("[SYMBOLS]: GET SYMBOLS DONE", symbols.length);
}
getSymbols();
