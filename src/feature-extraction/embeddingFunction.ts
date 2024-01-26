import { pipeline } from "@xenova/transformers";

const models = {
	SPELL: "Xenova/all-MiniLM-L6-v2",
	"SPELL-SemanticSearch": "Xenova/multi-qa-MiniLM-L6-cos-v1",
	"SPELL-Multilingual": "Xenova/distiluse-base-multilingual-cased-v1",
};

const task = "feature-extraction";
const model = models["SPELL-Multilingual"];

const extractor = await pipeline(task, model);

export class MyEmbeddingFunction {
	async generate(texts: string[]): Promise<number[][]> {
		const output = await extractor(texts, { pooling: "mean", normalize: true });
		return output.tolist();
	}
}
