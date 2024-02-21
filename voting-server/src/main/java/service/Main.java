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

        get("/validate-admin", (req, res) -> s.validateAdmin(req, res));

        get("/elections/getdata", (req, res) -> s.getElectionData(req, res));

        post("/elections/update-voters", (req, res) -> s.updateElectionVoters(req, res));

        post("/elections/update-roles", (req, res) -> s.updateRoles(req, res));

        post("/elections/update-electionparts", (req, res) -> s.updateElectionParts(req, res)); 
        
        post("/set-current-part", (req, res) -> s.setCurrentPart(req, res)); 

        get("/get-current-part", (req, res) -> s.getCurrentPart(req, res));

        post("/cast-decision-vote/:voterId", (req, res) -> s.castDecisionVote(req, res, req.params(":voterId")));

        post("/cast-person-vote/:voterId", (req, res) -> s.castPersonVote(req, res, req.params(":voterId")));

        post("/cast-multiple-vote/:voterId", (req, res) -> s.castMultipleVote(req, res, req.params(":voterId")));

        post("/elections/add-voter", (req, res) -> s.addSingleVoter(req, res));

        post("/elections/remove-voter", (req, res) -> s.removeSingleVoter(req, res));

        get("/send-emails", (req, res) -> s.sendEmails(req, res));

        post("/send-single-email", (req, res) -> s.sendSingleEmail(req, res));

        post("/update-password", (req, res) -> s.updatePassword(req, res));

        get("/long-polling-part/:voterId", (req, res) -> s.longPollingPart(req, res, req.params(":voterId"))); 

        get("/long-polling-results", (req, res) -> s.longPollingResults(req, res)); 
        
        get("/remove-all-voters", (req, res) -> s.removeAllVoters(req, res));

        get("/get-all-voters/", (req, res) -> s.getAllVoters(req, res));

    }
}