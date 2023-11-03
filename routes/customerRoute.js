import express from "express";
import multer from "multer";
import path from "path";
import {
  customerRegistration,
  customerLogin,
  customerorder,
  customerData,
} from "../controllers/customerControllers.js";
import { isAuthenticatedCustomer } from "../middleware/auth.js";
import { AdminUpdateOrderDetail } from "../controllers/orderControllers.js";
import { orderRouter } from "./order.route.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("dest called");
    cb(null, "./upload");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "sai" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

export const customerRouter = express.Router();
customerRouter.post("/registration", customerRegistration);
customerRouter.post("/login", customerLogin);

customerRouter.post(
  "/customerorder",
  isAuthenticatedCustomer,
  upload.fields([{ name: "fnskuSend" }, { name: "labelSend" }]),
  customerorder
);

customerRouter.get("/customerdata", isAuthenticatedCustomer, customerData);

orderRouter.put(
  "/updateOrderDetails/:id",
  upload.fields([{ name: "fnskuSend" }, { name: "labelSend" }]),
  AdminUpdateOrderDetail
);
