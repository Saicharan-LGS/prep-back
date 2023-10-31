import express from "express";

import {
  customerRegistration,
  customerLogin,
  customerorder,
} from "../controllers/customerControllers.js";
import { isAuthenticatedCustomer } from "../middleware/auth.js";

export const customerRouter = express.Router();

customerRouter.post("/registration", customerRegistration);

customerRouter.post("/login", customerLogin);

customerRouter.post("/customerorder", isAuthenticatedCustomer, customerorder);
