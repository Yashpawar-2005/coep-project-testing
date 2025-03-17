import { Router } from "express";
import { authenticate } from "../middlewares/authmiddleware.js";
import { create_room, get_room_info, join_room } from "../controllers/teamcontroller.js";
const teamrouter=Router();
teamrouter.post("/create-team",authenticate,create_room)
teamrouter.post("/join-team",authenticate,join_room)
teamrouter.get("/getinfo/:roomid",authenticate,get_room_info)
export default teamrouter