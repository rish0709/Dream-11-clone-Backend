import mongoose from "mongoose";
// import { images } from "../../image_carousel_react/src/images_data";
const User = new mongoose.Schema({

    teamName:{type:String, required:true},
    players: {type:Array, required:true},
    captain: {type:String, required:true},
    vice_captain: {type:String, required:true},
    total_points: {type:Number, default: 0}, 
    winner: {type: String, default: "False"}

})

export const model = mongoose.model("User", User);
