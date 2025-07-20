import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import deleteFile from "../utils/deleteFile.js";

const cleanupFiles = async ( ...paths ) => {
    for (const filepath of paths) {
        if ( filepath ) {
            await deleteFile(filepath)
        }
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user info
    // check images (avatar, coverImage)
    // validate details
    // check if user already exists
    // upload images to cloudinary
    // check images are uploaded
    // create user instance / object (in db)
    // check if user is created
    // remove password and refreshToken field from response
    // return res

    // get input data from req.body if input is in form of json or form
    const { username, email, fullname, password } = req.body

    // Check image files
    const avatarFile = req.files?.avatar?.[0]
    const coverImageFile = req.files?.coverImage?.[0]

    const avatarLocalPath = avatarFile?.path
    const coverImageLocalPath = coverImageFile?.path

    if (!avatarLocalPath) {
        if ( coverImageLocalPath ) await deleteFile(coverImageLocalPath)
        throw new ApiError(400, "Avatar is required")
    }
    
    // validate input fields
    if ([username, email, fullname, password].some
    ((field) => field?.trim() === "")) {
        await cleanupFiles(avatarLocalPath, coverImageLocalPath)
        throw new ApiError(400, "All fields are required")
    };

    // validate email (regex, valid email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if ( !emailRegex.test(email) ) {
        await cleanupFiles(avatarLocalPath, coverImageLocalPath)
        throw new ApiError(400, "Invalid Email")
    }

    // check if email or username already exists : User.findOne({email}) or:
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })


    if (existedUser) {
        await cleanupFiles(avatarLocalPath, coverImageLocalPath)
        throw new ApiError(400, "username or email already exists!")
    }

    // upload on cloudinary
    const avatar = await uploadFileOnCloudinary(avatarLocalPath)
    if (!avatar) {
        await cleanupFiles(avatarLocalPath, coverImageLocalPath)
        throw new ApiError(500, "Couldn't upload Avatar. Try again")
    }

    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)
    if ( coverImageLocalPath && !coverImage ) {
        await cleanupFiles(avatarLocalPath, coverImageLocalPath)
        throw new ApiError(500, "Couldn't upload Cover Image. Try again")
    }

    // Create user in DB
    const user = await User.create({
        username: username.toLowerCase(),
        fullname: fullname.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // console.log("user: ", user)

    // check if user is created in DB
    const createdUser = await User.findById(user._id).select( "-password -refreshToken" )     // remove password and refreshToken
    if ( !createdUser ) {
        throw new ApiError(500, "Failed to create user in Database")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser.toObject(), "User Registered Successfully")
    )

})

export { registerUser } 