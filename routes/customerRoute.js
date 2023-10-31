import express from "express";
import multer from "multer";
import path from "path";
import {
  customerRegistration,
  customerLogin,
  customerorder,
} from "../controllers/customerControllers.js";
import { isAuthenticatedCustomer } from "../middleware/auth.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("dest called");
    cb(null, "./upload");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

const uploadSingleOrMultipleFiles = (req, res, next) => {
  if (req.files) {
    const fileFields = req.files;
    if (fileFields["fnskuSend"] && fileFields["labelSend"]) {
      return upload.fields([{ name: "fnskuSend" }, { name: "labelSend" }])(
        req,
        res,
        next
      );
    } else if (fileFields["fnskuSend"]) {
      return upload.single("fnskuSend")(req, res, next);
    } else if (fileFields["labelSend"]) {
      return upload.single("labelSend")(req, res, next);
    }
  }
  next();
};

export const customerRouter = express.Router();

customerRouter.post("/registration", customerRegistration);

customerRouter.post("/login", customerLogin);

customerRouter.post(
  "/customerorder",
  isAuthenticatedCustomer,
  uploadSingleOrMultipleFiles,
  customerorder
);
