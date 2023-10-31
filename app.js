import express from "express";
import cors from "cors";
import { customerRouter } from "./routes/customerRoute.js";
import { staffRouter } from "./routes/staff.route.js";
// import { upload } from "./controllers/customerControllers.js";

export const app = express();
app.use(express.json());
app.use(express.static("upload"));
app.use(cors());
// import multer from "multer";
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "upload/"); 
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// app.post("/upload", upload.any(), (req, res) => {
//   console.log(req.body); 
//   console.log(req.files);
// });

app.use("/api/v1", customerRouter, staffRouter);

//testing api
app.get("/test", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});
