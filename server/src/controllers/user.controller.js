import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from 'fs'

const registerUser = asyncHandler( async (req, res) => {
    // get user info
    // validate details
    // check if user already exists
    // check images (avatar, coverImage)
    // upload images to cloudinary
    // check images are uploaded
    // create user instance / object (in db)
    // check if user is created
    // remove password and refreshToken field from response
    // return res

    // get input data from req.body if input is in form of json or form
    const { username, email, fullname, password } = req.body
    
    if ([username, email, fullname, password].some
    ((field) => field?.trim() === "")) {
        
        throw new ApiError(400, "All fields are required")
    };

    // validate email (regex, valid email)

    // check if email or username already exists
    // User.findOne({email})
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // console.log("existedUser:", existedUser)

    if (existedUser) {
        
        throw new ApiError(400, "username or email already exists!")
    }

    // Check image files
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // upload on cloudinary
    const avatar = await uploadFileOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(500, "Couldn't upload Avatar. Try again")
    }

    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)
    if ( coverImageLocalPath && !coverImage ) {
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
        new ApiResponse(200, createdUser.toObject(), "User Registered Successfully")
    )

})

export { registerUser } 