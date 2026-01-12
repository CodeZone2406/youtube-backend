import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing the channel
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // The user who owns the channel
        ref: "User"
    }
}, { timestamps: true })

export const Subscription = mongoose.model("subscription", subscriptionSchema)

// Note : To find the subscribers of a channel --> select those documents where the channel names are being matched
