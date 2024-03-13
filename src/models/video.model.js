import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFile:{
            type: String,// cloudinary url
            required: true,
        },
        thumbnail:{
            type: String,// cloudinary url
            required: true,
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        title:{
            type: String,
            required: true,
            trim:true,
        },
        description:{
            type: String,
            required: true,
            trim:true,
        },
        duration:{
            type: Number, // cloudinary
            required: true,
            default:0
        },
        views:{
            type: Number,
            default:0,
        },
        isPublished:{
            type: Boolean,
            required: true,
            default:false,
        },
    },
    {timestamps:true}
);

videoSchema.plugin(mongooseAggregatePaginate);



export const Video = mongoose.model("Video",videoSchema);
