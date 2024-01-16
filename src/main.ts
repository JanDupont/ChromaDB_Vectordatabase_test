import * as collectionManager from "./feature-extraction/collection.js";

// Test
let result = await collectionManager.queryCollection("Rettungswagen");
console.log(result);

// TODO: express app