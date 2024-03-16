import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)



    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  try{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        return new ApiError(401,"Unauthorized request");
    }  
    const decodedToken = await jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if(!user){
        return new ApiError(401,"Invalid refresh token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
        return new ApiError(401,"Refresh token is expired or used");   
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
  }catch(err){
    return new ApiError(401,error?.message || "Invalid refresh token");
  }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    try{
        const {oldPassword,newPassword} = req.body;
        // if(!(oldPassword,newPassword)){

        // }
        const user = await User.findById(req.user?._id);
        if(!user){
            return new ApiError(401,"No user found");
        }
        const passwordCheck = await user.isPasswordCorrect(oldPassword);
        if(!passwordCheck){
            return new ApiError(400,"Please enter correct password");
        }
        user.password = newPassword;
        await user.save({
            validateBeforeSave:false
        });
       return res.
       status(200).json(new ApiResponse(
        200,{},"Password changed successfully"
       ))

    }catch(err){
        return new ApiError(401,error?.message || "Please enter the correct password");
    }
})


const getCurrentUser = asyncHandler(async(req,res)=>{
    try{
        // const user = await User.findById(req.user?._id).select("-password -refreshToken");
        // if(!user){
        //     return new ApiError(400,"No user found");
        // }
        // return res.status(200).json(new ApiResponse(
        //     200,
        //     {
        //         data:user,
        //     },
        //     "User Details"
        // ))
        return res.status(200).json(
            200,req.user,"current user fetched successfully"
        )

    }catch(err){
        return new ApiError(500,err?.message || "Not able to get the details of user");
    }
})


const updateAccount = asyncHandler(async(req,res)=>{
    try{
        const {fullName,username} = req.body;
        if((!fullName || !username)){
            return new ApiError(400,"All Fields are required");
        }
        const user = User.findByIdAndUpdate(req.user?._id,
            {
                $et:{
                    fullName,
                    username
                }
            },
            {
                new:true
            }
        ).select("-password -refreshToken");
        return res.status(200).json(
            200,user,"User details updated successfully"
        )
         


    }catch(err){
        return new ApiError(500,err?.message || "Not able to get the details of user");   
    }
});

const updateUserAvator = asyncHandler(async(req,res)=>{
    try{
        const avatarLocalPath = req.file?.path;
        if(!avatarLocalPath){
            return new ApiError(400,"Please upload the avatar");
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if(!avatar.url){
            return new ApiError(400,"Error while uploading on avatar");
        }

       const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:
            {
                avatar:avatar.url
            },
        },
        {
            new:true
        }
        ).select("-password -refreshToken");

        return res.status(200).json(
            new ApiResponse(200,user,"User avatar updated successfully")
        )
    }catch(err){
        return new ApiError(500,err?.message || "Not able to update the user avatar");   
    }
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    try{
        const coverImageLocalPath = req.file?.path;
        if(!coverImageLocalPath){
            return new ApiError(400,"Please upload the cover image");
        }
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if(!coverImage.url){
            return new ApiError(400,"Error while uploading on cover image");
        }

       const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:
            {
                coverImage:coverImage.url
            },
        },
        {
            new:true
        }
        ).select("-password -refreshToken");

        return res.status(200).json(
            new ApiResponse(200,user,"User cover image updated successfully")
        )
    }catch(err){
        return new ApiError(500,err?.message || "Not able to update the user's cover image");   
    }
})
const getUserChannelProfile = asyncHandler(async(req,res)=>{
    try{
        let {username} = req.params;
        if(!username?.trim()){
            return new ApiError(400,"username is missing");
        }
        const channel = await User.aggregate([
            {
                //Used to match the given username with the database--------------
                $match:{
                    username : username?.toLowerCase()
                }
            },
            {
                //Used to join with the subscription table---------------------------
                $lookup:{
                    from : "subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },
            {
                //Used to join with the subscription table---------------------------
                $lookup:{
                    from : "subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },
            {
                //Used to count the total number of subscriber, subscribedto
                $addFields:{
                    subscriberCount:{
                        $size:"$subscribers"
                    },
                    channelSubscribedToCount:{
                        $size:"$subscribedTo"
                    },
                    // Check whether the user is subscribed to channel to.
                    isSubscribed:{
                        $cond:{
                            if:{
                                $in : [req.user?._id,"$subscribers.subscriber"]
                            },
                            then:true,
                            else:false
                        }
                    }
                }
            },{
                //Used to display the particular fields.
                $project:{
                    fullName:1,
                    username:1,
                    subscriberCount:1,
                    avatar:1,
                    coverImage:1,
                    channelSubscribedToCount:1,
                    isSubscribed:1,
                }
            }
        ]);

        if(!channel?.length){
            throw new ApiError(404,"The channel does not exit");
        }


        res.status(200).json(
         new ApiResponse(200,channel[0],"The channel list")
        )

    }catch(err){
        return new ApiError(500,err?.message || "Not able to get the user channel details");   
    }
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    try{
        const user = await User.aggregate(
            [
                {
                    $match:{
                        _id : new mongoose.Types.ObjectId(req.user?._id)
                    }
                },
                {
                    $lookup:{
                        from:"videos",
                        localField:"watchHistory",
                        foreignField:"_id",
                        as:"WatchedHistory",
                        pipeline:[
                            {
                                $lookup:{
                                    from:"users",
                                    localField:"owner",
                                    foreignField:"_id",
                                    as:"videoOwnerDetails",
                                    pipeline:[
                                        {
                                            $project:{
                                                fullName:1,
                                                username:1,
                                                avatar:1,
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields:{
                                    owner:{
                                        $first:"$owner"
                                    }
                                }
                            }
                        ]
                    }
                }

            ]
        );
        if(!user?.length){
            return new ApiError(400,"No history found");
        }
        return res.status(200).json(
            new ApiResponse(200,user[0].WatchedHistory,"Watched History.")
        )

    }catch(err){
        return new ApiError(500,err?.message || "Not ablw to get the watch history");   
    }
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccount,
    updateUserAvator,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
}