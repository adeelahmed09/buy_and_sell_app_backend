import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error("File path not provided");

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

    return response.secure_url;
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
const deleteOnClundinary = async(url)=>{
  try {
    if(!url){
      return console.log("Error during deleting old image,");
    }
    const splite1 = url.split("/")
    const value = splite1[splite1.length-1]
    const splite2 = value.split(".")
    const id = splite2[0]
    const respone = await cloudinary.uploader.destroy(id)
    console.log("Image deleted successfully:", respone);
    return(
      console.log("deltion complete")
    )
  } catch (error) {
    return console.log("Error during deleting old image," , error);
  }
}

export {uploadOnCloudinary,deleteOnClundinary}
