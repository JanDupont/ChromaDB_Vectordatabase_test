import * as fs from "fs";
import * as chromadb from "chromadb";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
dotenv.config();

const activePreset = 0;
const query = "Rettungswagen Fahrzeug";
const queryLang = "en"; // language code or empty string
const presets = [
	{ name: "my_collection", model: "Xenova/all-MiniLM-L6-v2" },
	// { name: "my_collection_2", model: "Xenova/all-mpnet-base-v2" }, // not working currently, empty arrays
	{ name: "my_collection_3", model: "Xenova/all-MiniLM-L12-v2" },
];

// Create a feature-extraction pipeline
const extractor = await pipeline("feature-extraction", presets[activePreset].model);

let ids = [];
let terms = [];
let metadatas = [];
function getSymbols() {
	const jsonString = fs.readFileSync("SPELL.json");
	const json = JSON.parse(jsonString);
	Object.values(json.nodes).forEach((node) => {
		if (node.layer === "descriptor" && node.type === "symbol") {
			let symbol = JSON.parse(JSON.stringify(node));
			Object.entries(symbol.terminology).forEach(([key, value]) => {
				let lang = key;
				if (value.term?.value) {
					ids.push(symbol.id + "_" + lang);
					terms.push(value.term?.value);
					metadatas.push({ source: "SPELL", lang: lang });
				}
			});
		}
	});
}

async function runChromaDB() {
	let client = new chromadb.ChromaClient("localhost", 8000);
	let collection;

	// OpenAI free????? embedding function (ada-002) (pricing gelistet aber nichts sichtbar in usage dashboard)
	// const embedder = new chromadb.OpenAIEmbeddingFunction({
	// 	openai_api_key: "process.env.OPENAI_KEY",
	// });
	class MyEmbeddingFunction {
		async generate(texts) {
			const output = await extractor(texts, { pooling: "mean", normalize: true });
			return output.tolist();
		}
	}
	let embedder = new MyEmbeddingFunction();

	async function createCollection() {
		console.log("CREATE");
		collection = await client.createCollection({
			name: presets[activePreset].name,
			embeddingFunction: embedder,
		});
	}
	async function fillCollection() {
		// doing this in 10 iterations to avoid memory issues
		let step = ids.length / 10;
		let start = 0;
		let end = step;
		for (let i = 0; i < 10; i++) {
			console.log("FILL COLLECTION", i);
			await collection.add({
				ids: ids.slice(start, end),
				metadatas: metadatas.slice(start, end),
				documents: terms.slice(start, end),
			});
			start = end;
			end += step;
		}
		console.log("DONE FILLING COLLECTION");
	}
	async function getCollection() {
		console.log("GET");
		collection = await client.getCollection({
			name: presets[activePreset].name,
			embeddingFunction: embedder,
		});
	}

	const collectionNames = await client.listCollections();
	if (!collectionNames.find((item) => item.name === presets[activePreset].name)) {
		await createCollection();
		await fillCollection();
	} else {
		await getCollection();
	}

	const results = await collection.query({
		nResults: 20,
		queryTexts: [query],
		// if lang is set, only allow results with that lang:  where: { metadata: { lang: queryLang } },
		...(queryLang ? { where: { lang: { $eq: queryLang } } } : {}),
	});
	console.log(results);
}

getSymbols();
runChromaDB();
