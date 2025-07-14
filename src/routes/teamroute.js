import { Router } from "express" ;
import { authenticate } from "../middlewares/authmiddleware.js";
import { create_room, get_all_rooms_info, get_maincode_info, get_room_info, get_rooms, join_room } from "../controllers/teamcontroller.js";
const teamrouter=Router();
teamrouter.post("/create-team",authenticate,create_room)
teamrouter.post("/join-team",authenticate,join_room)
teamrouter.get("/getinfo/:roomid",authenticate,get_room_info)
teamrouter.get("/get_team",authenticate,get_rooms)
teamrouter.get("/get_all_teams/:id",authenticate,get_all_rooms_info)
teamrouter.get(`/get_main_codebase/:id`,authenticate,get_maincode_info)
export default teamrouter
