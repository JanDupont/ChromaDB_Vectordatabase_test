import * as fs from "fs";

let graph: any = {};
export let symbols: any = [];

loadGraph();
getSymbols();

function loadGraph() {
	const jsonString = fs.readFileSync("SPELL.json").toString();
	graph = JSON.parse(jsonString);
}

export function getSymbols() {
	console.log("[SYMBOLS]: GET SYMBOLS");
	Object.values(graph.nodes).forEach((node: any) => {
		if (node.layer === "descriptor" && node.type === "symbol") {
			let symbol: any = JSON.parse(JSON.stringify(node));
			symbols.push(symbol);
		}
	});
	console.log("[SYMBOLS]: GET SYMBOLS DONE", symbols.length);
}

export function getSymbolMetadata(symbolId: string) {
	let metadata: any = {
		source: "SPELL",
	};

	let symbol = graph.nodes[symbolId];
	if (!symbol) return metadata;

	// TODO: hier weitermachen: wieso werden keine scopes gesetzt?
	let scopes: string[] = [];
	symbol.referredBy.forEach((referredById: string) => {
		let node = graph.nodes[referredById];
		if (!node) return;
		let scope = node.layer + "-" + node.type;
		if (!scopes.includes(scope)) scopes.push(scope);
	});
	// put the array as a string into scopes (comma seperated)
	metadata["scopes"] = scopes.toString()
	return metadata;
}
