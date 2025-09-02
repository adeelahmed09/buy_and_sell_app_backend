import { Router } from "express";
import { authenticateUser } from "../middleware/auth.js";
import { addListing, getLists } from "../controllers/listing.controller.js";
import { upload } from "../middleware/multer.js";


const router = Router()

router.route("/create-listing").post(authenticateUser,upload.array("images", 10),addListing)
router.route("/").get(getLists)

export default router