import express from "express";

import {
  staffRegistration,
  staffLogin,
} from "../controllers/staff.controller.js";

export const staffRouter = express.Router();

staffRouter.post("/staffregistration", staffRegistration);

staffRouter.post("/stafflogin", staffLogin);
