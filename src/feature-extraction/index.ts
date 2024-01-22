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
		const positive = req.query.positive as string[];
		const negative = req.query.negative as string[];
		const nResults = Number(req.query.nResults);
		const lang = (req.query.lang as string) || "";
		const results = await collectionManager.queryCollectionCombined(positive, negative, nResults, lang);
		//console.log(results.documents[0]);
		for (let i = 0; i < results.documents.length; i++) {
			console.log(results.documents[i], results.metadatas[i], results.distances?.[i]);
		}
		res.send(results);
	});
	// example query url:
	// positive: ["Herzstörung", "Kreislauf"]
	// negative: ["Herz"]
	// nResults: 10
	// lang: ""
	// http://localhost:4447/queryCombined?positive=["Herzstörung","Kreislauf"]&negative=["Herz"]&nResults=10&lang=
}
