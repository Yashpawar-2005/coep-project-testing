import { Router } from "express";
import streamResponse from "../middlewares/LLMmiddleware.js";
import { prompt_to_redis_handler } from "../controllers/Prompt.js";
const promptroute=Router();
promptroute.post("/generate_output",streamResponse,prompt_to_redis_handler)
export default promptroute