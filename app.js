import express from "express";
import cors from "cors";
import { customerRouter } from "./routes/customerRoute.js";
import { staffRouter } from "./routes/staff.route.js";
import { orderRouter } from "./routes/order.route.js";

export const app = express();
app.use(express.json());
app.use(express.static("upload"));
app.use(cors());
import bodyParser from "body-parser";
import ErrorMiddleware from "./middleware/error.js";

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/v1", customerRouter, staffRouter, orderRouter);

//testing api
app.get("/test", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.use(ErrorMiddleware);
