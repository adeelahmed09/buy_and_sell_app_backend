import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import prisma from "../utils/prisma.js";

// const addListing = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     price,
//     currency,
//     make,
//     model,
//     year,
//     mileageKm,
//     engineCc,
//     fuelType,
//     color,
//     bodyType,
//     condition,
//     vin,
//     locationText,
//     lat,
//     lng,
//     isFeatured,
//     status,
//     views,
//   } = req.body;
//   const user = req.user;
//   console.log(user, req.files, lat, lng, mileageKm, engineCc, isFeatured);
//   if (!user?.uid) {
//     return res.status(500).json({ error: "Something went worng" });
//   }
//   if (
//     !title ||
//     !description ||
//     !price ||
//     !currency ||
//     !make ||
//     !model ||
//     !year ||
//     !mileageKm ||
//     !fuelType ||
//     !condition ||
//     !locationText
//   ) {
//     return res.status(400).json({ error: "all fields are required" });
//   }
//   try {
//     const existingUser = await prisma.user.findUnique({
//       where: { firebaseUid: user.uid },
//     });

//     if (!existingUser) {
//       return res.status(400).json({ error: "User does not exist" });
//     }
//     const list = await prisma.listing.findMany();
//     console.log(list);
//     const listCreated = await prisma.listing.create({
//       data: {
//         userId: existingUser.id,
//         title,
//         description,
//         price: parseInt(price),
//         currency,
//         make,
//         model,
//         year: parseInt(year),
//         mileageKm: parseInt(mileageKm),
//         engineCc: engineCc ? parseInt(engineCc) : null,
//         fuelType,
//         color,
//         bodyType,
//         condition,
//         vin,
//         locationText,
//         lat: lat ? parseFloat(lat) : null,
//         lng: lng ? parseFloat(lng) : null,
//         isFeatured: isFeatured === "true",
//         status,
//         views: views ? parseInt(views) : 0,
//       },
//     });

//     console.log(listCreated);
//     const uploadPromises = req.files.map((file) =>
//       uploadOnCloudinary(file.path)
//     );
//     const uploadedUrls = await Promise.all(uploadPromises);

//     return res.status(200).json({ message: "created" });
//   } catch (error) {
//     console.log(error);
//   }
// });
const addListing = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    currency,
    make,
    model,
    year,
    mileageKm,
    engineCc,
    fuelType,
    color,
    bodyType,
    condition,
    vin,
    locationText,
    lat,
    lng,
    isFeatured,
    status,
    views = 0,
  } = req.body;

  const user = req.user;

  // Validate authenticated user
  if (!user?.uid) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  // Validate required fields
  const requiredFields = [
    "title",
    "description",
    "price",
    "currency",
    "make",
    "model",
    "year",
    "mileageKm",
    "fuelType",
    "condition",
    "locationText",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `Field "${field}" is required` });
    }
  }

  // Ensure at least one photo is uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one photo is required" });
  }

  try {
    // Find user in DB
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // Create listing
    const listCreated = await prisma.listing.create({
      data: {
        userId: existingUser.id,
        title,
        description,
        price: parseInt(price),
        currency,
        make,
        model,
        year: parseInt(year),
        mileageKm: parseInt(mileageKm),
        engineCc: engineCc ? parseInt(engineCc) : null,
        fuelType,
        color,
        bodyType,
        condition,
        vin,
        locationText,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        isFeatured: isFeatured === "true" || isFeatured === true,
        status,
        views: parseInt(views) || 0,
      },
    });

    // Upload photos to Cloudinary
    const uploadPromises = req.files.map((file) => uploadOnCloudinary(file.path));
    const uploadedUrls = await Promise.all(uploadPromises);

    // Save photos in Prisma
    await Promise.all(
      uploadedUrls.map((url,index) =>
        prisma.photo.create({
          data: {
            listingId: listCreated.id,
            url,
            order:index,
          },
        })
      )
    );

    return res.status(201).json({
      message: "Listing created successfully",
      listing: listCreated,
      photos: uploadedUrls,
    });
  } catch (error) {
    console.error("Add listing error:", error);
    return res.status(500).json({ error: "Failed to create listing" });
  }
})
const getLists = asyncHandler(async (req, res) => {
  try {
    const {
      search,
      minMileage,
      maxMileage,
      minEngine,
      maxEngine,
      fuelType,
      color,
      bodyType,
    } = req.query;

    const listings = await prisma.listing.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          minMileage ? { mileageKm: { gte: parseInt(minMileage) } } : {},
          maxMileage ? { mileageKm: { lte: parseInt(maxMileage) } } : {},
          minEngine ? { engineCc: { gte: parseInt(minEngine) } } : {},
          maxEngine ? { engineCc: { lte: parseInt(maxEngine) } } : {},
          fuelType ? { fuelType } : {},
          color ? { color: { contains: color, mode: "insensitive" } } : {},
          bodyType ? { bodyType } : {},
        ],
      },
      include: { photos: true, user: true },
    });

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
})
export { addListing,getLists };
