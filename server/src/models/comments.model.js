import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"                // if comment is under video
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"              // if comment is under another comment (as reply)
    }
}, { timestamps : true })

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = new mongoose.model("Comment", commentSchema)