import * as fs from "fs";
import * as chromadb from "chromadb";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
dotenv.config();

const activePreset = 1;
const query = "Schwertkämpfer";
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
			let term = JSON.parse(JSON.stringify(node.terminology["en"]?.term?.value));
			if (term) {
				ids.push(node.id);
				terms.push(node.terminology["en"]?.term?.value);
				metadatas.push({ source: "SPELL" });
			}
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
		await collection.add({
			ids: ids,
			metadatas: metadatas,
			documents: terms,
		});
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
	});
	console.log(results);
}

getSymbols();
runChromaDB();
