import { type Collection, ChromaClient } from "chromadb";
import { MyEmbeddingFunction } from "./embeddingFunction.js";
import { symbols } from "./symbols.js";

const collectionName = "SPELL";

let client = new ChromaClient({ path: "http://localhost:8000" });

// Custom Embedding Function
let embedder = new MyEmbeddingFunction();
// OpenAI free????? embedding function (ada-002) (pricing gelistet aber nichts sichtbar in usage dashboard)
// const embedder = new chromadb.OpenAIEmbeddingFunction({
// 	openai_api_key: "process.env.OPENAI_KEY",
// });

let collection: Collection;

const allCollectionNames = await client.listCollections();
if (!allCollectionNames.find((item) => item.name === collectionName)) {
	await createCollection();
	await initSymbolEmbeddings();
} else {
	await getCollection();
}

async function createCollection() {
	console.log("[COLLECTION]: CREATE");
	collection = await client.createCollection({
		name: collectionName,
		embeddingFunction: embedder,
	});
}
async function initSymbolEmbeddings() {
	console.log("[COLLECTION]: INIT SYMBOL EMBEDDINGS");
	let ids: string[] = [];
	let terms: string[] = [];
	let metadatas: { source: string; lang: string }[] = [];
	symbols.forEach((symbol: any) => {
		Object.entries(symbol.terminology).forEach(([key, value]) => {
			let lang = key;
			if ((value as any).term?.value) {
				ids.push(symbol.id + "_" + lang);
				terms.push((value as any).term?.value);
				metadatas.push({ source: "SPELL", lang: lang });
			}
		});
	});

	// doing this in 10 iterations to avoid memory issues
	let iterations = 10;
	let step = ids.length / iterations;
	let start = 0;
	let end = step;
	for (let i = 0; i < iterations; i++) {
		console.log("[COLLECTION]: FILL", i);
		await collection.add({
			ids: ids.slice(start, end),
			metadatas: metadatas.slice(start, end),
			documents: terms.slice(start, end),
		});
		start = end;
		end += step;
	}
	console.log("[COLLECTION]: DONE INIT SYMBOL EMBEDDINGS");
}
async function getCollection() {
	console.log("[COLLECTION]: GET COLLECTION", collectionName);
	collection = await client.getCollection({
		name: collectionName,
		embeddingFunction: embedder,
	});
	let count = await collection.count();
	console.log("[COLLECTION]: COLLECTION", collectionName, " COUNTS", count, " ITEMS");
}
export async function queryCollection(query: string, nResults = 20, lang = "") {
	console.log("[COLLECTION]: QUERY", query, nResults, lang);
	const results = await collection.query({
		nResults: nResults,
		queryTexts: query,
		// if lang is set, only allow results with that lang:  where: { metadata: { lang: queryLang } },
		...(lang ? { where: { lang: { $eq: lang } } } : {}),
	});
	return results;
}
