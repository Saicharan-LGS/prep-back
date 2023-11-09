import express from "express";
import multer from "multer";
import path from "path";
import {
  customerRegistration,
  customerLogin,
  customerorder,
  customerData,
  customerOrderList,
  AcceptOrder,
  customerDetails,
  DeclineOrder,
  CustomerUpdateDetail,
} from "../controllers/customerControllers.js";
import {
  authorizeRoles,
  isAuthenticated,
  isAuthenticatedCustomer,
} from "../middleware/auth.js";
import {
  AdminUpdateOrderDetail,
  AmountUpdate,
} from "../controllers/orderControllers.js";
import { orderRouter } from "./order.route.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("dest called");
    cb(null, "./upload");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log(uniqueSuffix);
    cb(
      null,
      file.fieldname + "sai" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

export const customerRouter = express.Router();
customerRouter.post(
  "/registration",
  isAuthenticated,
  authorizeRoles("Admin"),
  customerRegistration
);
customerRouter.post("/login", customerLogin);

customerRouter.post(
  "/customerorder",
  isAuthenticatedCustomer,
  upload.fields([{ name: "fnskuSend" }, { name: "labelSend" }]),
  customerorder
);

customerRouter.get("/customerdata", isAuthenticatedCustomer, customerData);

customerRouter.get(
  "/customerorderlist/:id",
  isAuthenticatedCustomer,
  customerOrderList
);

orderRouter.put(
  "/updateOrderDetails/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  upload.fields([{ name: "fnskuSend" }, { name: "labelSend" }]),
  AdminUpdateOrderDetail
);

customerRouter.post("/acceptOrder/:id", isAuthenticatedCustomer, AcceptOrder);
customerRouter.get(
  "/customermembers",
  isAuthenticated,
  authorizeRoles("Admin"),
  customerDetails
);
orderRouter.put("/declineOrder/:id", isAuthenticatedCustomer, DeclineOrder);

orderRouter.put(
  "/customerOrderDetail/:id",
  isAuthenticatedCustomer,
  upload.fields([{ name: "fnskuSend" }, { name: "labelSend" }]),
  CustomerUpdateDetail
);
