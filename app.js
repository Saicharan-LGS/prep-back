import express from "express";
import cors from "cors";
// const path = require("path"); // Import 'path' module to handle file paths
import bodyParser from "body-parser";
// const { error } = require("console");
import { customerRouter } from "./routes/customerRoute.js";
import { staffRouter } from "./routes/staff.route.js";

export const app = express();
app.use(express.json());
app.use(express.static("upload"));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(cors());

//routes
app.use("/api/v1", customerRouter, staffRouter);

//testing api
app.get("/test", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});
