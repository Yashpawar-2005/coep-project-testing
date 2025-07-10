import { Router } from "express";
import streamResponse from "../middlewares/LLMmiddleware.js";
import { prompt_to_redis_handler, submit_to_admin } from "../controllers/Prompt.js";
import { authenticate } from "../middlewares/authmiddleware.js";
const promptroute=Router();
promptroute.post("/generate_output",authenticate,streamResponse,prompt_to_redis_handler)
promptroute.post("/submit_to_admin/:teamid",authenticate,submit_to_admin)
export default promptroute