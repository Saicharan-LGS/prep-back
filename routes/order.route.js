import express from "express";
import {
  AdminUpdateOrder,
  AdminGetSpecificOrderDetails,
  GetOrders,
  dimensionOrderList,
  dimensionUpdate,
  labelOrderList,
  labelUpdate,
} from "../controllers/orderControllers.js";
import { isAuthenticated } from "../middleware/auth.js";
export const orderRouter = express.Router();

orderRouter.put("/adminUpdateOrderStatus/:id", AdminUpdateOrder);
orderRouter.get("/getAdminOrderDetails/:id", AdminGetSpecificOrderDetails);
orderRouter.get("/getOrders/:status", GetOrders);
orderRouter.put("/dimensionupdate/:id", isAuthenticated, dimensionUpdate);
orderRouter.get("/dimensionorderlist", dimensionOrderList);
orderRouter.get("/labelorderlist", labelOrderList);
orderRouter.put("/labelorderlist/:id", isAuthenticated, labelUpdate);
