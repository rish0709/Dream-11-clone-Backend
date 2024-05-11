import mongoose from "mongoose";
import { model } from "../models/user.model.js";

export const storeTeamDataInDatabase = async(teamName, players, captain, vice_captain) => {
    try {
        const user = new model({teamName, players, captain, vice_captain})
        await user.save();
        return true;
    }
    catch(err){
        console.log(err, "error creating team");

    }
    

}

