import express from "express";

import {
  staffRegistration,
  staffLogin,
  staffData,
  staffMebmers,
} from "../controllers/staff.controller.js";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";

export const staffRouter = express.Router();

staffRouter.post(
  "/staffregistration",
  isAuthenticated,
  authorizeRoles("Admin"),
  staffRegistration
);

staffRouter.post("/stafflogin", staffLogin);

staffRouter.get("/staffDetail", isAuthenticated, staffData);
staffRouter.get(
  "/staffmembers",
  isAuthenticated,
  authorizeRoles("Admin"),
  staffMebmers
);
