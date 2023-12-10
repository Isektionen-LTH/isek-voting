package service;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.options;
import static spark.Spark.before;

/**
 * Main class seting up a spark HTTP server and its endpoints. 
 */
public class Main {
    public static void main(String[] args) {
        port(8080);
        Service s = new Service();
        spark.Spark.threadPool(1000);


        before(
                (request, response) -> {
                    response.header("Access-Control-Allow-Origin", "*");
                    response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    response.header(
                            "Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
                    response.header("Access-Control-Allow-Credentials", "true");
                });

        options(
                "/*",
                (request, response) -> {
                    String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
                    if (accessControlRequestHeaders != null) {
                        response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
                    }

                    String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
                    if (accessControlRequestMethod != null) {
                        response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
                    }

                    return "OK";
                });


        //All endpoints explained in service class. 
        get("/health", (req, res) -> s.health(req, res));

        get("/validate-voter/:voterId", (req, res) -> s.validateVoter(req, res, req.params(":voterId")));

        get("/validate-admin/:password", (req, res) -> s.validateAdmin(req, res, req.params(":password")));

        get("/elections/getdata/:password", (req, res) -> s.getElectionData(req, res, req.params(":password")));

        post("/elections/update-voters/:password", (req, res) -> s.updateElectionVoters(req, res, req.params(":password")));

        post("/elections/update-roles/:password", (req, res) -> s.updateRoles(req, res, req.params(":password")));

        post("/elections/update-electionparts/:password", (req, res) -> s.updateElectionParts(req, res, req.params(":password"))); 
        
        post("/set-current-part/:password", (req, res) -> s.setCurrentPart(req, res, req.params(":password"))); 

        get("/get-current-part", (req, res) -> s.getCurrentPart(req, res));

        post("/cast-decision-vote/:voterId", (req, res) -> s.castDecisionVote(req, res, req.params(":voterId")));

        post("/cast-person-vote/:voterId", (req, res) -> s.castPersonVote(req, res, req.params(":voterId")));

        post("/cast-multiple-vote/:voterId", (req, res) -> s.castMultipleVote(req, res, req.params(":voterId")));

        post("/elections/add-voter/:password", (req, res) -> s.addSingleVoter(req, res, req.params(":password")));

        post("/elections/remove-voter/:password", (req, res) -> s.removeSingleVoter(req, res, req.params(":password")));

        get("/send-emails/:password", (req, res) -> s.sendEmails(req, res, req.params(":password")));

        post("/send-single-email/:password", (req, res) -> s.sendSingleEmail(req, res, req.params(":password")));

        post("/update-password/:password", (req, res) -> s.updatePassword(req, res, req.params(":password")));

        get("/long-polling-part/:voterId", (req, res) -> s.longPollingPart(req, res, req.params(":voterId"))); 

        get("/long-polling-results/:password", (req, res) -> s.longPollingResults(req, res, req.params(":password"))); 
        
        get("/remove-all-voters/:password", (req, res) -> s.removeAllVoters(req, res, req.params(":password")));

        get("/get-all-voters/:password", (req, res) -> s.getAllVoters(req, res, req.params(":password")));

        get("/reload-all-voters/:password", (req, res) -> s.reloadGuestList(req, res, req.params(":password")));


    }
}