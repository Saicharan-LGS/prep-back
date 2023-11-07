import express from "express";
import {
  AdminUpdateOrder,
  AdminGetSpecificOrderDetails,
  GetOrders,
  dimensionOrderList,
  dimensionUpdate,
  labelOrderList,
  labelUpdate,
  AdminUpdateOrderDetail,
  AmountUpdate,
  AccountOrders,
} from "../controllers/orderControllers.js";
import { isAuthenticated } from "../middleware/auth.js";
export const orderRouter = express.Router();

orderRouter.put("/adminUpdateOrderStatus/:id", AdminUpdateOrder);
orderRouter.get("/getAdminOrderDetails/:id", AdminGetSpecificOrderDetails);
orderRouter.get("/getOrders/:status", isAuthenticated, GetOrders);
orderRouter.put("/dimensionupdate/:id", isAuthenticated, dimensionUpdate);
orderRouter.get("/dimensionorderlist", isAuthenticated, dimensionOrderList);
orderRouter.get("/labelorderlist", isAuthenticated, labelOrderList);
orderRouter.put("/updatelabelorder/:id", isAuthenticated, labelUpdate);
orderRouter.get("/accountantlist", isAuthenticated, AccountOrders);
orderRouter.put("/amountUpdate/:id", isAuthenticated, AmountUpdate);
