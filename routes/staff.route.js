import express from "express";

import {
  staffRegistration,
  staffLogin,
  staffData,
} from "../controllers/staff.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

export const staffRouter = express.Router();

staffRouter.post("/staffregistration", staffRegistration);

staffRouter.post("/stafflogin", staffLogin);

staffRouter.get("/staffDetail", isAuthenticated, staffData);
