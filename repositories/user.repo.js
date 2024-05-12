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

export const retrieveAllRecordsFromDatabase = async() => {
    const user = await model.find();
    return user;
}

export const retrieveAllDocumentsWithMaximumPoints = async() => {
    const maxTotalPointsDocument = await model.find().sort({ total_points: -1 }).limit(1);

    const maxTotalPoints = maxTotalPointsDocument[0].total_points; 
    await model.find({ total_points: maxTotalPoints });
    await model.updateMany({ total_points: maxTotalPoints }, { winner: "True" });

    return model.find();
}

