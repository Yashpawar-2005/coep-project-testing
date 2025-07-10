import { Router } from "express";
import { get_all_submissions, movePendingToMain } from "../controllers/admincontroller.js";
import { authenticate } from "../middlewares/authmiddleware.js";
const adminrouter=Router();
adminrouter.get("/get_all_submissions/:roomid",authenticate,get_all_submissions)
adminrouter.post("/approve_submission",authenticate,movePendingToMain)
export default adminrouter