import mongoose,{Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trim:true,
            index:true, // For searching
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type: String,
            required: true,
            trim:true,
            index:true, // For searching
        },
        avatar:{
            type: String,// cloudinary url
            required: true,
        },
        coverImage:{
            type: String,// cloudinary url
            required: true,
        },
        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,"Password is required"],
        },
        refreshToken:{
            type:String,
            required:true,
        }
    },
    {timestamps:true}
    );

// hook or middleware for converting the passwrod in hash------
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcryptjs.hash(this.password,10);
    next()
});

//--------------- Custom method---------------------------------
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcryptjs.compare(password,this.password)
}

//================== for generating the jwt token ===================
userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
            process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:ACCESS_TOKEN_EXPIRY
        }
    )

}
userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign(
        {
            _id:this._id,
        },
            process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:REFRESH_TOKEN_EXPIRY
        }
    )

}

//================================================================

export const User = mongoose.model("User",userSchema);