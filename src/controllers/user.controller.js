import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../utils/prisma.js";

const addUserToDbOrUpdate = asyncHandler(async (req, res) => {
  const user = req.user;

  // Validate authenticated user
  if (!user?.uid || !user.email) {
    return res.status(401).json({ error: "Unauthorized: user information missing" });
  }

  try {
    // Upsert user: create if not exists, otherwise update
    const userRecord = await prisma.user.upsert({
      where: { firebaseUid: user.uid },
      update: {
        name: user.name || undefined,
        photoUrl: user.picture || undefined,
        email: user.email, // ensure email is always updated
      },
      create: {
        firebaseUid: user.uid,
        email: user.email,
        name: user.name || "",
        photoUrl: user.picture || "",
      },
    });

    if (!userRecord) {
      return res.status(500).json({ error: "Failed to create or update user" });
    }

    return res.status(200).json({
      message: "User successfully created or updated",
      user: {
        id: userRecord.id,
        firebaseUid: userRecord.firebaseUid,
        name: userRecord.name,
        email: userRecord.email,
        photoUrl: userRecord.photoUrl,
      },
    });
  } catch (error) {
    console.error("addUserToDbOrUpdate error:", error);

    // Handle specific Prisma errors if needed
    if (error.code === "P2002") {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

export { addUserToDbOrUpdate };

