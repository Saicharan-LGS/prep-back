import express from "express";
import cors from "cors";
// const path = require("path"); // Import 'path' module to handle file paths
// const bodyParser = require("body-parser");
// const { error } = require("console");
export const app = express();
app.use(express.json());
// app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static("upload"));
app.use(cors());
