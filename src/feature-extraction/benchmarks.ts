import { Collection } from "chromadb";
import { MyEmbeddingFunction } from "./embeddingFunction.js";

let iterations = 100;

const noDescription = "Feuerwehrauto";
const withDescription =
	"Feuerwehrauto | Ein Feuerwehrauto ist ein Fahrzeug der Feuerwehr. Es dient zum Transport von Feuerwehrleuten und Feuerwehrausrüstung zum Einsatzort.";
const withLongDescription =
	"Feuerwehrauto | Ein Feuerwehrauto ist ein Fahrzeug der Feuerwehr. Es dient zum Transport von Feuerwehrleuten und Feuerwehrausrüstung zum Einsatzort. Ein Feuerwehrauto ist ein Fahrzeug der Feuerwehr. Es dient zum Transport von Feuerwehrleuten und Feuerwehrausrüstung zum Einsatzort. Ein Feuerwehrauto ist ein Fahrzeug der Feuerwehr. Es dient zum Transport von Feuerwehrleuten und Feuerwehrausrüstung zum Einsatzort. Ein Feuerwehrauto ist ein Fahrzeug der Feuerwehr. Es dient zum Transport von Feuerwehrleuten und Feuerwehrausrüstung zum Einsatzort. Ein Feuerwehrauto ist ein Fahrzeug der Feuerwehr. Es dient zum Transport von Feuerwehrleuten und Feuerwehrausrüstung zum Einsatzort.";

export async function benchmarkGenerateEmbeddings(embedder: MyEmbeddingFunction) {
	console.log("--- TEST EMBEDDING SPEED ---");
	const timesNoDescription = [];
	const timesWithDescription = [];
	const timesWithLongDescription = [];

	for (let i = 0; i < iterations; i++) {
		let now = Date.now();
		await embedder.generate([noDescription]);
		timesNoDescription.push(Date.now() - now);

		now = Date.now();
		await embedder.generate([withDescription]);
		timesWithDescription.push(Date.now() - now);

		now = Date.now();
		await embedder.generate([withLongDescription]);
		timesWithLongDescription.push(Date.now() - now);
	}

	console.log(
		"Average timeNoDescription",
		timesNoDescription.reduce((acc, time) => acc + time, 0) / timesNoDescription.length
	);
	console.log(
		"Average timeWithDescription",
		timesWithDescription.reduce((acc, time) => acc + time, 0) / timesWithDescription.length
	);
	console.log(
		"Average timeWithLongDescription",
		timesWithLongDescription.reduce((acc, time) => acc + time, 0) / timesWithLongDescription.length
	);
}

export async function benchmarkAddToCollection(collection: Collection) {
	console.log("--- TEST ADD COLLECTION SPEED ---");

	const timesNoDescription = [];
	const timesWithDescription = [];
	const timesWithLongDescription = [];

	// dummy because the first one usually takes longer, don't want to measure that
	await collection.add({
		ids: ["dummy"],
		metadatas: [{ term: "dummy", description: "dummy" }],
		documents: ["dummy"],
	});
	await collection.delete({
		ids: ["dummy"],
	});

	for (let i = 0; i < iterations; i++) {
		let now = Date.now();
		await collection.add({
			ids: ["noDescription"],
			metadatas: [{ term: noDescription, description: "" }],
			documents: [noDescription],
		});
		timesNoDescription.push(Date.now() - now);
		await collection.delete({
			ids: ["noDescription"],
		});

		now = Date.now();
		await collection.add({
			ids: ["withDescription"],
			metadatas: [
				{ term: withDescription.split("|")[0].trim(), description: withDescription.split("|")[1].trim() },
			],
			documents: [withDescription],
		});
		timesWithDescription.push(Date.now() - now);
		await collection.delete({
			ids: ["withDescription"],
		});

		now = Date.now();
		await collection.add({
			ids: ["withLongDescription"],
			metadatas: [
				{
					term: withLongDescription.split("|")[0].trim(),
					description: withLongDescription.split("|")[1].trim(),
				},
			],
			documents: [withLongDescription],
		});
		timesWithLongDescription.push(Date.now() - now);
		await collection.delete({
			ids: ["withLongDescription"],
		});
	}

	console.log(
		"Average timeNoDescription",
		timesNoDescription.reduce((acc, time) => acc + time, 0) / timesNoDescription.length
	);
	console.log(
		"Average timeWithDescription",
		timesWithDescription.reduce((acc, time) => acc + time, 0) / timesWithDescription.length
	);
	console.log(
		"Average timeWithLongDescription",
		timesWithLongDescription.reduce((acc, time) => acc + time, 0) / timesWithLongDescription.length
	);
}
