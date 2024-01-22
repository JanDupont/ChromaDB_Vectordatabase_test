import express from "express";
import * as CONFIG from "./config.js";
import cors from "cors";
import { API } from "./feature-extraction/index.js";

const app = express();
const server = app.listen(CONFIG.PORT, () => {
	console.log(`[server]: Server is running at ${CONFIG.PORT}`);
});

app.use(cors());
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ extended: true, limit: "1gb" }));

API(app);
