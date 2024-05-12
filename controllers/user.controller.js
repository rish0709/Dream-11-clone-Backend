import { storeTeamDataInDatabase, retrieveAllRecordsFromDatabase, retrieveAllDocumentsWithMaximumPoints } from "../repositories/user.repo.js";
import { playersList } from "../data/players.js";
import { match } from "../data/match.js";
import { current } from "@reduxjs/toolkit";
import mongoose from "mongoose";
import { model } from "../models/user.model.js";

export const createTeamController = async(req, res) => {
    const {teamName, players, captain, vice_captain} = req.body;
    //  checking for valid input data 
    if (players.length > 11 || players.length < 11){
        return res.send("team should have exact 11 players");

    }
    var rulesObject = {"RR":0, "CSK" : 0, "WICKETKEEPER" : 0, "BATTER" : 0, "ALL-ROUNDER" : 0, "BOWLER" : 0};
    for (var i = 0; i < players.length; i++){
        const foundPlayer = playersList.find(player => player.Player === players[i]);
        if (foundPlayer) {
            const team = foundPlayer.Team;
            if (team == "Chennai Super Kings"){
                rulesObject["CSK"] += 1;
            }
            else{
                rulesObject["RR"] += 1;
            }
            rulesObject[foundPlayer.Role] += 1;

        } else {
            return res.send("Player not found.");
        }

    }

    if (rulesObject["RR"] > 10 || rulesObject["CSK"] > 10){
        return res.send("you cant pick more than 10 players from a single team");
    }
    if (rulesObject["WICKETKEEPER"] < 1 || rulesObject["WICKETKEEPER"] > 8 || rulesObject["BATTER"] < 1 || rulesObject["BATTER"] > 8 || rulesObject["BOWLER"] < 1 || rulesObject["BOWLER"] > 8 || rulesObject["ALL-ROUNDER"] < 1 || rulesObject["ALL-ROUNDER"] > 8 ){
        return res.send("your total number of players are out of range, pick players from minimum 1 to maximum 8");
    }


    const result = await storeTeamDataInDatabase(teamName, players, captain, vice_captain);
    if (result){
        return res.send("data stored successfully");

    }
    else{
        return res.send("Error making team, try again");
    }


}

export const calculateAllPointsController = async(req, res) => {
    const totalPlayers = {}
    // when batsman scores runs
    for (var i = 0; i < match.length; i++){
        const currentMatch = match[i]
        if (currentMatch["batsman_run"] > 0){
            // bonuses

            // every single run point
            if (currentMatch["batter"] in totalPlayers){
                totalPlayers[currentMatch["batter"]][0]["total_points"] += currentMatch["batsman_run"]
                totalPlayers[currentMatch["batter"]][0]["runs_scored"] += currentMatch["batsman_run"]
                

                
                    // 30 runs bonus
                if (totalPlayers[currentMatch["batter"]][0]["runs_scored"] >= 30 && totalPlayers[currentMatch["batter"]][0]["runs_scored"] - currentMatch["batsman_run"] < 30){
                    totalPlayers[currentMatch["batter"]][0]["total_points"] += 4
                

                }
        
                // half-century bonus
                if (totalPlayers[currentMatch["batter"]][0]["runs_scored"] >= 50 && totalPlayers[currentMatch["batter"]][0]["runs_scored"] - currentMatch["batsman_run"] < 50){
                    totalPlayers[currentMatch["batter"]][0]["total_points"] += 8

                }
                // century bonus
                if (totalPlayers[currentMatch["batter"]][0]["runs_scored"] >= 100 && totalPlayers[currentMatch["batter"]][0]["runs_scored"] - currentMatch["batsman_run"] < 100){
                    totalPlayers[currentMatch["batter"]][0]["total_points"] += 16

                }
                // boundary bonus
                if (currentMatch["batsman_run"] == 4){
                    totalPlayers[currentMatch["batter"]][0]["total_points"] += 1

                }
                //  six bonus
                if (currentMatch["batsman_run"] == 6){
                    totalPlayers[currentMatch["batter"]][0]["total_points"] += 2

                }
            }
            else{
                totalPlayers[currentMatch["batter"]] = [{"total_points" : currentMatch["batsman_run"], "runs_scored" : currentMatch["batsman_run"], "wickets_taken" : 0, "catches_taken" : 0}]
                if (currentMatch["batsman_run"] == 4){
                    totalPlayers[currentMatch["batter"]][0]["total_points"] += 1
                    // total_points[currentMatch["batter"]]["runs_scored"] += 4

                }
                if (currentMatch["batsman_run"] == 6){
                    totalPlayers[currentMatch["batter"]][0]["total_points"] += 2

                }

            }

                
                
            
        }
        else{
            if(currentMatch["isWicketDelivery"] == 1 && currentMatch["batter"]["runs_scored"] == 0){
                totalPlayers[currentMatch["batter"]] = [{"total_points" : -2, "runs_scored" : currentMatch["batsman_run"], "wickets_taken" : 0, "catches_taken" : 0}]
            }
        }

        var currentOverRuns = 0;

        if (currentMatch["bowler"] in totalPlayers){

        // assigning bowler points
            if (currentMatch["isWicketDelivery"] == 1 ){


                // 1 wicket point
                totalPlayers[currentMatch["bowler"]][0]["total_points"] += 25
                totalPlayers[currentMatch["bowler"]][0]["wickets_taken"] += 1

                


                if (currentMatch["kind"] == "lbw" || currentMatch["kind"] == "bowled"){
                    totalPlayers[currentMatch["bowler"]][0]["total_points"] += 8

                }
                // 3 wicket bonus
                if (totalPlayers[currentMatch["bowler"]][0]["wickets_taken"] == 3){
                    totalPlayers[currentMatch["bowler"]][0]["total_points"] += 4

                }

                // 4 wicket bonus
                if (totalPlayers[currentMatch["bowler"]][0]["wickets_taken"] == 4){
                    totalPlayers[currentMatch["bowler"]][0]["total_points"] += 8

                }

                // 5 wicket bonus

                if (totalPlayers[currentMatch["bowler"]][0]["wickets_taken"] == 5){
                    totalPlayers[currentMatch["bowler"]][0]["total_points"] += 16

                }
            }


            currentOverRuns += currentMatch["total_runs"]
            // checking the maiden over
            if (currentMatch["ballnumber"] == 6 && currentOverRuns == 0){
                totalPlayers[currentMatch["bowler"]][0]["total_points"] += 12

                
            }
        
        
            
        }
        else{
            totalPlayers[currentMatch["bowler"]] = [{"total_points" : 0, "runs_scored" : 0, "wickets_taken" : 0, "catches_taken" : 0}]
            if (currentMatch["isWicketDelivery"] == 1){
                console.log(currentMatch["bowler"], "required data");
                totalPlayers[currentMatch["bowler"]][0]["total_points"] = 25
                totalPlayers[currentMatch["bowler"]][0]["wickets_taken"] = 1

            }
            if (currentMatch["kind"] == "lbw" || currentMatch["kind"] == "bowled"){
                totalPlayers[currentMatch["bowler"]][0]["total_points"] = 8 

            }
            currentOverRuns += currentMatch["total_runs"]
        }

        // fielding points
        if (currentMatch["fielders_involved"] != "NA"){
        // caught
            if ( currentMatch["fielders_involved"] in totalPlayers){
                if (currentMatch["kind"] == "caught"){
                    if (totalPlayers[currentMatch["fielders_involved"]][0]["catches_taken"] >= 3){
                        totalPlayers[currentMatch["fielders_involved"]][0]["total_points"] += 4

                    }
                    totalPlayers[currentMatch["fielders_involved"]][0]["total_points"] += 8
                    totalPlayers[currentMatch["fielders_involved"]][0]["catches_taken"] += 1

                }
                //  stumping
                if (currentMatch["kind"] == "stumping"){
                    totalPlayers[currentMatch["fielders_involved"]][0]["total_points"] += 12
                }
                //  run out
                if (currentMatch["kind"] == "run_out"){
                    totalPlayers[currentMatch["fielders_involved"]][0]["total_points"] += 6
                }
        }
    
        else{
            totalPlayers[currentMatch["fielders_involved"]] = [{"total_points" : 0, "runs_scored" : 0, "wickets_taken" : 0, "catches_taken" : 0}]
            if (currentMatch["kind"] == "caught"){
                totalPlayers[currentMatch["fielders_involved"]][0]["total_points"] = 8
                totalPlayers[currentMatch["fielders_involved"]][0]["catches_taken"] = 1
            }
            //  stumping
            if (currentMatch["kind"] == "stumping"){
                totalPlayers[currentMatch["fielders_involved"]][0]["total_points"] = 12
            }
            //  run out
            if (currentMatch["kind"] == "run_out"){
                totalPlayers[currentMatch["fielders_involved"]][0]["total_points"] = 6
            }
        }

    }
}

    // calculating and assigning total_points to each registered team
    const allRecords = await retrieveAllRecordsFromDatabase();
    console.log(allRecords, "all records");
    for (var i = 0; i < allRecords.length; i++){
        
        const playersInASingleTeam = allRecords[i]["players"];
        var totalPointsOfASingleTeam = 0;

        for (var j = 0; j < playersInASingleTeam.length; j++){

            if (playersInASingleTeam[j] in totalPlayers){
                // totalPlayers[allRecords[i]["captain"]][0]["total_points"] *= 2
                // totalPlayers[allRecords[i]["vice_captain"]][0]["total_points"] *= 1.5
                if (playersInASingleTeam[j] == allRecords[i]["captain"]){
                    console.log("in desired place");
                    totalPlayers[allRecords[i]["captain"]][0]["total_points"] *= 2
                }
                if (playersInASingleTeam[j] == allRecords[i]["vice_captain"]){
                    totalPlayers[allRecords[i]["vice_captain"]][0]["total_points"] *= 1.5

                }

                


                totalPointsOfASingleTeam += totalPlayers[playersInASingleTeam[j]][0]["total_points"]
                if (totalPointsOfASingleTeam == 188){
                    console.log(totalPlayers, "totalPlayers points");
                }
                
            }

        }

        const updatedDocument = await model.findOneAndUpdate({teamName: allRecords[i]["teamName"]}, {total_points: totalPointsOfASingleTeam});
        


    }
    res.send("data");

}


export const processFinalResultController = async(req, res) => {
    const allTeamsWithTheirStatus = await retrieveAllDocumentsWithMaximumPoints();
    res.send(allTeamsWithTheirStatus);

    
}




