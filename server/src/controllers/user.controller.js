import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import deleteFile from "../utils/deleteFile.js";
import jwt from "jsonwebtoken"

const cleanupFiles = async (...paths) => {
    for (const filepath of paths) {
        if (filepath) {
            await deleteFile(filepath)
        }
    }
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }

}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerUser = asyncHandler(async (req, res) => {
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
        if (coverImageLocalPath) await deleteFile(coverImageLocalPath)
        throw new ApiError(400, "Avatar is required")
    }

    // validate input fields
    if ([username, email, fullname, password].some
        ((field) => field?.trim() === "")) {
        await cleanupFiles(avatarLocalPath, coverImageLocalPath)
        throw new ApiError(400, "All fields are required")
    };

    // validate email (regex, valid email)
    if (!emailRegex.test(email)) {
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
    if (coverImageLocalPath && !coverImage) {
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

    // console.log(coverImage)
    // console.log(avatar)

    // check if user is created in DB
    const createdUser = await User.findById(user._id).select("-password -refreshToken")     // remove password and refreshToken
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user in Database")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser.toObject(), "User Registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // req.body -> data
    // validate
    // search user
    // check password
    //generate access token

    const { username, email, password } = req.body

    // validate fields
    if (( !username || username.trim() === "" ) && ( !email || email.trim() === "")) {
        throw new ApiError(400, "username or email required")
    }
    if ( email && !emailRegex.test(email) ) {
        throw new ApiError(400, "Invalid Email")
    }
    if ( !password || password.trim() == "") {
        throw new ApiError(400, "password required")
    }

    // find user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User with given details could not be found")
    }

    const isValidPassword = await user.isPasswordCorrect(password)
    if (!isValidPassword) {
        throw new ApiError(404, "Wrong password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    user.refreshToken = refreshToken        // Can also get updated user (user with refreshToken) by querying DB (User.findById(user._id))
    delete user.password

    const options = {
        httpsOnly : true,
        secure : true
    }

    return res.
    status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : user, accessToken, refreshToken      // tokens sent in data in case of mobile app dev (no concept of cookie)
            },
            "User loggedIn successfully"
        )
    )

})


const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        }
    )

    const options = {
        httpsOnly : true,
        secure : true
    }

    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if ( !incomingRefreshToken ) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = User.findById(decodedToken?._id)
    
        if ( !user ) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if ( incomingRefreshToken !== user.refreshToken ) {
            throw new ApiError(401, "Expired refresh token")
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpsOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: user, accessToken, refreshToken
                },
                "Access token generated successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }

})


export { registerUser, loginUser, logoutUser, refreshAccessToken } 