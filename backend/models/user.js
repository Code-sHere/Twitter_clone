import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    username: {type: String, required: true},
    displayName: { type:String, required: true},
    avatar: {type: String, required: true},
    email : {type: String, required: true, unique: true},
    bio : {type: String, default:""},
    location:{type: String, default: ""},
    website : {type: String, default: ""},
    password : {type: String, required: true},
    lastPasswordResetRequest : {type: Date, default: null},
    isTemporaryPassword:{
        type: Boolean,
        default: false
    }
})


export default mongoose.model("User", UserSchema);
 