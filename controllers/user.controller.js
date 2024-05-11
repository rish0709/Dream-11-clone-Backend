import { storeTeamDataInDatabase } from "../repositories/user.repo.js";
import { players } from "../data/players.js";
import { match } from "../data/match.js";
import { current } from "@reduxjs/toolkit";

export const createTeamController = async(req, res) => {
    const {teamName, players, captain, vice_captain} = req.body;
    // console.log(imageData, "image data in controller");
    const result = await storeTeamDataInDatabase(teamName, players, captain, vice_captain);
    if (result){
        res.send("data stored successfully");

    }
    else{
        res.send("Error storing data");
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

        if (currentMatch["bowler"] in totalPlayers){

        // assigning bowler points
            if (currentMatch["isWicketDelivery"] == 1 ){
                console.log("inside bowler if");

                // 1 wicket point
                if (currentMatch["bowler"] == "R Ashwin"){
                    console.log(totalPlayers[currentMatch["bowler"]], "ashwin figures before");
                }
                totalPlayers[currentMatch["bowler"]][0]["total_points"] += 25
                totalPlayers[currentMatch["bowler"]][0]["wickets_taken"] += 1

                


                if (currentMatch["kind"] == "lbw" || currentMatch["kind"] == "bowled"){
                    totalPlayers[currentMatch["bowler"]][0]["total_points"] += 8

                }
                if (currentMatch["bowler"] == "R Ashwin"){
                    console.log(totalPlayers[currentMatch["bowler"]], "ashwin figures after");
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
    
    res.status(200).send(totalPlayers);

}




