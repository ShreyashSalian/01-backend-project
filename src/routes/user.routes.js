import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js"

const userRouter = Router();

userRouter.route("/login").post(loginUser);
userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
    );



//------------------------Secured routes--------------------------
userRouter.route("/logout").post(verifyToken,logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);

export default userRouter;