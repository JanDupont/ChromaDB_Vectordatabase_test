import { pipeline } from "@xenova/transformers";

const task = "feature-extraction";
const model = "Xenova/all-MiniLM-L6-v2";

const extractor = await pipeline(task, model);

export class MyEmbeddingFunction {
	async generate(texts: string[]): Promise<number[][]> {
		const output = await extractor(texts, { pooling: "mean", normalize: true });
		return output.tolist();
	}
}
