import { asyncHandler } from "../utils/asyncHandler.js";
import admin from "../utils/FireBase.js";

const authenticateUser = asyncHandler(
    async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const idToken = authHeader.split("Bearer ")[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.user = decodedToken; 
            next();
        } catch (error) {
            console.error("Error verifying Firebase ID token:", error);
            res.status(401).json({ message: "Invalid or expired token" });
        }
    }
)

export {authenticateUser};