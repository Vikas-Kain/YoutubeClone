import mongoose, { Schema } from 'mongoose';
import mongooseAggrigatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema({
    title: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    videoFile: {
        type: String,   // cloudinary url
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    duration: {
        type: Number,   // Given by cloudinary
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

videoSchema.plugin(mongooseAggrigatePaginate);

export const Video = mongoose.model("Video", videoSchema)