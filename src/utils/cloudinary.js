const cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
    try{
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    }catch(err){
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async(serverFilePath) => {
    try{
        if (!serverFilePath) return null
        const response = await cloudinary.uploader.destroy(serverFilePath, {
            resource_type: "auto"
        })
        console.log("file is deleted from cloudinary ");
        // fs.unlinkSync(localFilePath);
        return response;
    }catch(err){
        // fs.unlinkSync(localFilePath);
        return null;
    }
}

module.exports = 
{
uploadOnCloudinary,
deleteFromCloudinary 
};