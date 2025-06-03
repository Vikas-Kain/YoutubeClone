import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiErrors.js';
import { User } from '../models/user.model.js';
import { uploadFileOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })

    // Get user info from frontend
    const { fullname, email, username, password } = req.body
    console.log(email, username, password);

    if ([fullname, email, username, password].some(field => field?.trim() === '')) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists
    const userExists = await User.findOne({
        $or: [ { email }, { username }]
    })

    if (userExists) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    console.log(req.body);
    console.log(req.files);

    // check if avatar and cover image are given
    if (!req.files || !req.files.avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatarLocalPath = req.files.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;      // TypeError: Cannot read properties of undefined

    // check avatar id given and located in local file system
    if (!avatarLocalPath) {
        throw new ApiError(500, "Unable to upload avatar in local file system");
    }

    let coverImageLocalPath;
    if (Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0]?.path;
    }

    console.log(`Avatar local path: ${avatarLocalPath}`);
    console.log(`Avatar local path: ${coverImageLocalPath}`);


    // upload on cloudinary
    const avatar = await uploadFileOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar on cloudinary");
    }

    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);
    if (coverImageLocalPath && !coverImage){
        throw new ApiError(500, "Failed to upload coverImage on cloudinary");
    }

    console.log(avatar);
    console.log(coverImage);

    //create user object
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // check if user is created successfully
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // return response
    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));

})

export { registerUser };