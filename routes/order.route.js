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
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
export const orderRouter = express.Router();

orderRouter.put(
  "/adminUpdateOrderStatus/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  AdminUpdateOrder
);
orderRouter.get(
  "/getAdminOrderDetails/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  AdminGetSpecificOrderDetails
);
orderRouter.get(
  "/getOrders/:status",
  isAuthenticated,
  authorizeRoles("Admin"),
  GetOrders
);
orderRouter.put(
  "/dimensionupdate/:id",
  isAuthenticated,
  authorizeRoles("Admin", "Dimension"),
  dimensionUpdate
);
orderRouter.get(
  "/dimensionorderlist",
  isAuthenticated,
  authorizeRoles("Admin", "Dimension"),
  dimensionOrderList
);
orderRouter.get(
  "/labelorderlist",
  isAuthenticated,
  authorizeRoles("Admin", "Label"),
  labelOrderList
);
orderRouter.put(
  "/updatelabelorder/:id",
  isAuthenticated,
  authorizeRoles("Admin", "Label"),
  labelUpdate
);
orderRouter.get(
  "/accountantlist",
  isAuthenticated,
  authorizeRoles("Admin", "Accountant"),
  AccountOrders
);
orderRouter.put(
  "/amountUpdate/:id",
  isAuthenticated,
  authorizeRoles("Admin", "Accountant"),
  AmountUpdate
);
