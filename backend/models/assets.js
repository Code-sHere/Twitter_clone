import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const assets = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId,ref:"User", required: true},
    assetsId:{type: mongoose.Schema.Types.ObjectId,ref:"Tweet", required: true, unique: true},
    image : {type: String, default: null},
    audio : {type: String, default: null},
    timestamp : {type: Date, default: Date.now()},
})

export default mongoose.model("Assets", assets);
 