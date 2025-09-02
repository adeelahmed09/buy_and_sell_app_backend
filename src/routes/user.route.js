import { Router } from "express";
import { authenticateUser } from "../middleware/auth.js";
import { addUserToDbOrUpdate } from "../controllers/user.controller.js";



const router = Router()

router.route("/").post(authenticateUser,addUserToDbOrUpdate)

export default router
