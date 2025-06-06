import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileOnCloudinary = async (filePath) => {
    try{
        if (!filePath) return null

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found in local file system: ${filePath}`);
        }
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
        })

        // console.log(`File uploaded on cloudinary: ${result.url}`);

        // unlink file from local file system
        fs.unlinkSync(filePath);

        return result;
    }
    catch (error){
        console.error('Error uploading file to Cloudinary:', error);
        try{
            fs.existsSync(filePath) && fs.unlinkSync(filePath); // remove the locally saved temp file
        }
        catch (unlinkError) {
            console.error('Error removing local file:', unlinkError);
        }
        throw error;
    }
}

export { uploadFileOnCloudinary };