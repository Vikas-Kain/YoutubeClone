import { Router } from "express";
import { changeUserPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateUserDetails } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    },
    {
        name: 'coverImage',
        maxCount: 1
    }
]), registerUser);

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT, logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route('/change-password').post(verifyJWT, changeUserPassword)

router.route('/current-user').get(verifyJWT, getCurrentUser)

router.route('/update-details').patch(verifyJWT, updateUserDetails)

router.route('/update-avatar').patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route('/update-cover-image').patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route('/channel/:username').get(verifyJWT, getUserChannelProfile)    // username sent in params

router.route('/watch-history').get(verifyJWT, getWatchHistory)


export default router;