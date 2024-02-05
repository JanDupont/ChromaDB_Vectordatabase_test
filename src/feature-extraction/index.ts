import * as collectionManager from "./collection.js";
import { type Express } from "express";

export function API(app: Express) {
	app.get("/query", async (req, res) => {
		const query = req.query.query as string;
		const nResults = Number(req.query.nResults);
		const lang = (req.query.lang as string) || "";
		const results = await collectionManager.queryCollection(query, nResults, lang);
		console.log(results.documents[0]);
		res.send(results);
	});
	// example query url:
	// query: "Herzstörung"
	// nResults: 10
	// lang: ""
	// http://localhost:4447/query?query=Herzstörung&nResults=10&lang=

	app.get("/queryCombined", async (req, res) => {
		const positive = (req.query.positive as string) || "";
		const negative = (req.query.negative as string) || "";
		const nResults = Number(req.query.nResults);
		const langs = (JSON.parse((req.query.langs as string) || "[]") as string[]) || [];
		const results = await collectionManager.queryCollectionCombined(positive, negative, nResults, langs);
		//console.log(results.documents[0]);
		for (let i = 0; i < results.documents.length; i++) {
			console.log(results.documents[i], results.metadatas[i], results.distances?.[i]);
		}
		res.send(results);
	});
	// example query url:
	// positive: "outback,car,safari,for%20humans%20to%20drive"
	// negative: "type"
	// nResults: 10
	// lang: ["de","en"]
	// http://localhost:4447/queryCombined?positive="outback,car,safari,for%20humans%20to%20drive"&negative="type"&nResults=10&langs=["de","en"]

	app.get("/queryIds", async (req, res) => {
		const ids_string = req.query.ids as string;
		// make ids to a real string array again
		const ids = JSON.parse(ids_string);
		const results = await collectionManager.queryCollectionByIds(ids);
		console.log(results.documents);
		res.send(results);
	});
	// example query url:
	// ids: ["0a95e0cd-1ffc-4f0f-839d-e1f5ea227d28_en"]
	// http://localhost:4447/queryIds?ids=["0a95e0cd-1ffc-4f0f-839d-e1f5ea227d28_en"]
}
