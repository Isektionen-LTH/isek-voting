package service;

import java.util.ArrayList;
import java.util.List;
import spark.Request;
import spark.Response;
import spark.Session;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import java.util.Base64;

/**
 * Service class to handle all HTTP requests/responses.
 */
public class Service {
  private Election election; // Election object to handle all data.
  private Gson gson = new Gson(); // Used for JSON/Obj conversion.
  private String password = "isekbjornenadmin1234!"; // Admin password: vote.isek.se/admin
  private String currentElectionPart = "0"; // currentPart which is used for longPolling and client rendering.
  private MailService mail;

  /**
   * Constructor, creates an empty election object.
   */
  public Service() {
    election = gson.fromJson("{electionParts: [], voters: [], tieBreakerId: 0}", Election.class);
    mail = new MailService();
  }

  /**
   * /health endpoint to check that server is working!
   * 
   * @param req Request object
   * @param res Response object
   * @return result - message to indicate server is running.
   */
  public String health(Request req, Response res) {
    var result = "Service: Up and running!\nStatus: OK\n";
    res.body(result);
    res.status(200);
    return result;
  }

  /**
   * Retrieves election data.
   *
   * @param req    Request object
   * @param res    Response object
   * @param params - admin password
   * @return - JSON representation of election data.
   */
  public String getElectionData(Request req, Response res) {
    if (authenticateAdmin(req)) {
      determineWinners();
      var result = gson.toJson(election.electionParts);
      res.body(result);
      res.status(200);
      return result;
    } else {
      res.status(403);
      res.body(null);
      return null;
    }
  }

  /**
   * Determines winners for each election part.
   */
  private void determineWinners() {
    for (ElectionPart p : election.electionParts) {
      p.determineWinner();
    }
  }

  /**
   * Updates the list of election voters.
   * 
   * @param req    Request object
   * @param res    Response object
   * @param params - admin password
   * @return - Success or error message.
   */
  public String updateElectionVoters(Request req, Response res) {
    if (authenticateAdmin(req)) {
      try {
        String requestBody = req.body();

        // Parse the JSON array of voters
        TypeToken<List<Voter>> token = new TypeToken<List<Voter>>() {
        };
        ArrayList<Voter> voters = gson.fromJson(requestBody, token.getType());

        // Add permanent voters as well (styr + utslagsröst)
        ArrayList<Voter> permanentVoters = new ArrayList<Voter>();
        for (Voter voter : election.voters) {
          if (voter.role != null) {
            if (voter.role.equals("styr")) {
              permanentVoters.add(voter);
            } else if (voter.role.equals("utslag")) {
              permanentVoters.add(voter);
            }
          }
        }

        // Update the election's voters with the new values
        election.voters = voters;
        election.voters.addAll(permanentVoters);

        // Return the updated voters as JSON response
        String responseJson = gson.toJson(election.voters);
        res.body(responseJson);
        res.status(200);
        return "Success";
      } catch (Exception e) {
        e.printStackTrace();
        res.status(500);
        res.body("Server error");
        return "Server error";
      }
    } else {
      res.status(403);
      res.body(null);
      return null;
    }
  }

  /**
   * Updates role of a singe voter
   * 
   * @param req
   * @param res
   * @param params Admin password.
   * @return Success or error message.
   */
  public String updateRoles(Request req, Response res) {
    if (authenticateAdmin(req)) {
      try {
        Voter voterToBeChanged = gson.fromJson(req.body(), Voter.class);

        // Remove tiebreaker status
        if (voterToBeChanged.voterId.equals(election.tieBreakerId) && !voterToBeChanged.role.equals("utslag")) {
          election.tieBreakerId = null;
          for (ElectionPart part : election.electionParts) {
            part.tieBreakerId = null;
          }
          // Switch tiebreaker
        } else if (voterToBeChanged.role.equals("utslag")) {
          for (Voter voter : election.voters) {
            if (voter.role != null && voter.role.equals("utslag")) {
              voter.role = null;
            }
          }
          election.tieBreakerId = voterToBeChanged.voterId;
          for (ElectionPart part : election.electionParts) {
            part.tieBreakerId = voterToBeChanged.voterId;
          }
        }

        // Updates role
        for (Voter voter : election.voters) {
          if (voter.voterId.equals(voterToBeChanged.voterId)) {
            voter.role = voterToBeChanged.role;
          }
        }

        // Return the updated voters as JSON response
        String responseJson = gson.toJson(election.voters);
        res.body(responseJson);
        res.status(200);
        return "Success";
      } catch (Exception e) {
        e.printStackTrace();
        res.status(500);
        res.body("Server error");
        return "Server error";
      }
    } else {
      res.status(403);
      res.body(null);
      return null;
    }
  }

  /**
   * Updates all electionParts.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password.
   * @return success message
   */
  public String updateElectionParts(Request req, Response res) {
    if (authenticateAdmin(req)) {
      try {
        String requestBody = req.body();
        Gson gson = new Gson();

        // Parse the JSON array of election parts
        TypeToken<List<ElectionPart>> token = new TypeToken<List<ElectionPart>>() {
        };
        List<ElectionPart> electionParts = gson.fromJson(requestBody, token.getType());

        ElectionPart[] updatedElectionParts = new ElectionPart[electionParts.size()];

        for (int i = 0; i < electionParts.size(); i++) {
          updatedElectionParts[i] = electionParts.get(i);
        }

        // Update the election's parts with the new array
        election.electionParts = updatedElectionParts;

        if (election.tieBreakerId != null) {
          for (ElectionPart part : election.electionParts) {
            part.tieBreakerId = election.tieBreakerId;
          }
        }

        // Return the success message
        res.status(200);
        return "Success";
      } catch (Exception e) {
        e.printStackTrace();
        res.status(500);
        res.body("Server error");
        return "Server error";
      }
    } else {
      res.status(403);
      res.body(null);
      return null;
    }
  }

  /**
   * Sets current election part id - updates the clients with long-polling!
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password
   * @return success message.
   */
  public String setCurrentPart(Request req, Response res) {
    if (authenticateAdmin(req)) {
      currentElectionPart = req.body();
      res.status(200);
      return "Success";
    } else {
      res.status(403);
      res.body(null);
      return null;
    }
  }

  /**
   * Return Json representation of current electionPart.
   * 
   * @param req The request object.
   * @param res The response object.
   * @return success electionPart data.
   */
  public String getCurrentPart(Request req, Response res) {
    if (currentElectionPart.equals("0")) {
      res.body(currentElectionPart);
      res.status(200);
      return currentElectionPart;
    } else {

      // IMPORTANT: returns whole electionPart data! REMOVE VOTE DATA!
      for (ElectionPart p : election.electionParts) {
        if (p.id == Integer.parseInt(currentElectionPart)) {
          res.status(200);
          JsonObject jsonObject = gson.toJsonTree(p).getAsJsonObject();
          jsonObject.remove("winner");
          jsonObject.remove("winnercount");
          jsonObject.remove("votecount");
          jsonObject.remove("voterSize");
          jsonObject.remove("voteprogress");
          jsonObject.remove("vote");
          jsonObject.remove("decisionVotes");
          jsonObject.remove("multipleVotes");
          jsonObject.remove("personVotes");
          jsonObject.remove("tieBreakerId");
          String data = jsonObject.toString();
          res.body(data);
          return data;
        }
      }
    }
    res.body("Fel");
    res.status(500);
    return gson.toJson("Fel");
  }

  /**
   * Long polling endpoint used in voter clients. Used to render current
   * electionPart when voting.
   * 
   * @param req The request object.
   * @param res The response object.
   * @return JSON representation of data.
   */
  public String longPollingPart(Request req, Response res, String params) {
    System.out.println("Voter connection established, " + Thread.activeCount() + "/1000");

    Session session = req.session(true);
    String lastElectionPart = session.attribute("lastElectionPart");

    if (lastElectionPart == null) {
      session.attribute("lastElectionPart", currentElectionPart);
      lastElectionPart = currentElectionPart;
    }

    long startTime = System.currentTimeMillis();
    long timeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    while (currentElectionPart.equals(lastElectionPart)) {
      long elapsedTime = System.currentTimeMillis() - startTime;
      if (elapsedTime >= timeout) {
        // Timeout reached, end the connection
        System.out.println("Client connection timed out.");
        res.status(200);
        res.body(null);
        return null;
      } else if (!election.containsVoterWithId(params)) {
        res.status(200);
        res.body(gson.toJson("No voter with that id"));
        return gson.toJson("No voter with that id");
      }

      try {
        Thread.sleep(1000);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }

    session.attribute("lastElectionPart", currentElectionPart);

    // IMPORTANT: return whole electionPart data! REMOVE VOTE DATA!
    for (ElectionPart p : election.electionParts) {
      if (p.id == Integer.parseInt(currentElectionPart)) {
        res.status(200);
        JsonObject jsonObject = gson.toJsonTree(p).getAsJsonObject();
        jsonObject.remove("winner");
        jsonObject.remove("winnercount");
        jsonObject.remove("votecount");
        jsonObject.remove("voterSize");
        jsonObject.remove("voteprogress");
        jsonObject.remove("vote");
        jsonObject.remove("decisionVotes");
        jsonObject.remove("multipleVotes");
        jsonObject.remove("personVotes");
        jsonObject.remove("tieBreakerId");
        String data = jsonObject.toString();
        res.body(data);
        return data;
      }
    }

    res.status(204);
    res.body(gson.toJson("Omröstning saknas"));
    return gson.toJson("Omröstning saknas");
  }

  /**
   * Long polling endpoint used for admin console. Used to fetch new results.
   * 
   * @param req The request object.
   * @param res The response object.
   * @return JSON representation of data.
   */
  public String longPollingResults(Request req, Response res) {
    if (authenticateAdmin(req)) {
      long startTime = System.currentTimeMillis();
      long timeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      System.out.println("Admin connected, " + Thread.activeCount());
      try {
        while (true) {
          synchronized (election.electionParts) {
            determineWinners();
            boolean voteCountChanged = false;

            for (ElectionPart part : election.electionParts) {
              if (part.isWinnerChanged()) {
                voteCountChanged = true;
                break;
              }
            }

            if (voteCountChanged) {
              String json = gson.toJson(election.electionParts);
              res.type("application/json");
              res.status(200);
              res.body(json);
              return json; // Return the JSON response and exit the function
            }

            // Continue checking for changes even when voteCountChanged is false
            // Sleep for a short interval to avoid high CPU usage
            Thread.sleep(1000);
          }

          long elapsedTime = System.currentTimeMillis() - startTime;
          long remainingTime = timeout - elapsedTime;

          if (remainingTime <= 0) {
            // Timeout reached, end the connection
            System.out.println("Admin connection timed out.");
            res.status(200);
            res.body(null);
            return null;
          }

          System.out.println("Admin check. Connections: " + Thread.activeCount() + "/1000");
        }
      } catch (InterruptedException e) {
        e.printStackTrace();
        res.status(1000);
        res.body(null);
        return null;
      }
    } else {
      res.status(403);
      res.body(null);
      return null;
    }
  }

  /**
   * Validates admin on login.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password.
   * @return success message.
   */
  public String validateAdmin(Request req, Response res) {
    if (authenticateAdmin(req)) {
      res.status(200);
      String result = gson.toJson("Log in successful");
      res.body(result);
      return result;
    } else {
      res.status(401);
      res.header("WWW-Authenticate", "Basic realm=\"Restricted\"");
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

  /**
   * Helper method to authenticate admin using HTTP Basic Authentication.
   * 
   * @param req The request object.
   * @return true if authentication is successful, false otherwise.
   */
  private boolean authenticateAdmin(Request req) {
    String authorizationHeader = req.headers("Authorization");
    if (authorizationHeader != null && authorizationHeader.startsWith("Basic ")) {
      String credentials = new String(Base64.getDecoder().decode(authorizationHeader.substring(6)));
      return credentials.equals(password);
    }
    return false;
  }

  /**
   * Validates voter on login.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params voterId
   * @return success message.
   */
  public String validateVoter(Request req, Response res, String params) {
    for (Voter v : election.voters) {
      if (v.voterId.equals(params)) {
        res.status(200);
        res.body(v.name);
        return gson.toJson(v.name);
      }
    }
    res.status(203);
    res.body("No voter with that id");
    return "No voter with that id";
  }

  /**
   * Casts vote for Yes/No election.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params voterId.
   * @return success message.
   */
  public String castDecisionVote(Request req, Response res, String params) {
    for (Voter v : election.voters) {
      if (v.voterId.equals(params)) {
        DecisionVote vote = gson.fromJson(req.body(), DecisionVote.class);
        for (ElectionPart p : election.electionParts) {
          // If part matches id and the voter has not yet voted.
          if (p.id == Integer.parseInt(vote.electionPart)) {
            p.addDecisionVote(vote, election.voters.size());
            res.status(200);
            res.body("Vote has been cast");
            return gson.toJson("Vote has been cast");
          }
        }
      }
    }
    res.status(403);
    res.body("No voter with that id");
    return gson.toJson("No voter with that id");
  }

  /**
   * Casts vote for "Flerval" election.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params voterId.
   * @return success message.
   */
  public String castMultipleVote(Request req, Response res, String params) {
    for (Voter v : election.voters) {
      if (v.voterId.equals(params)) {
        DecisionVote vote = gson.fromJson(req.body(), DecisionVote.class);
        for (ElectionPart p : election.electionParts) {
          // If part matches id and the voter has not yet voted.
          if (p.id == Integer.parseInt(vote.electionPart)) {
            p.addMultipleVote(vote, election.voters.size());
            res.status(200);
            res.body("Vote has been cast");
            return gson.toJson("Vote has been cast");
          }
        }
      }
    }
    res.status(403);
    res.body("No voter with that id");
    return gson.toJson("No voter with that id");
  }

  /**
   * Casts vote for person election.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params voterId.
   * @return success message.
   */
  public String castPersonVote(Request req, Response res, String params) {
    for (Voter v : election.voters) {
      if (v.voterId.equals(params)) { // Voter exists
        IRVvote vote = gson.fromJson(req.body(), IRVvote.class);
        for (ElectionPart p : election.electionParts) {
          // If part matches id and the voter has not yet voted.
          if (p.id == Integer.parseInt(vote.electionPart)) {
            p.addPersonVote(vote, election.voters.size());
            res.status(200);
            res.body("Vote has been cast");
            return gson.toJson("Vote has been cast");
          }
        }
      }
    }
    res.status(403);
    res.body("No voter with that id");
    return gson.toJson("No voter with that id");
  }

  /**
   * Adds a voterId to election.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password.
   * @return success message.
   */
  public String addSingleVoter(Request req, Response res) {
    if (authenticateAdmin(req)) {
      Voter newVoter = gson.fromJson(req.body(), Voter.class);
      for (Voter v : election.voters) {
        if (v.voterId.equals(newVoter.voterId)) {
          res.status(200);
          res.body("Voter already exists");
          return gson.toJson("Voter already exists");
        }
      }
      election.voters.add(newVoter);
      res.status(200);
      res.body("Voter added");
      return gson.toJson("Voter added");
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

  /**
   * Removes a single voterId.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password.
   * @return success message.
   */
  public String removeSingleVoter(Request req, Response res) {
    if (authenticateAdmin(req)) {
      Voter newVoter = gson.fromJson(req.body(), Voter.class);
      for (Voter v : election.voters) {
        if (v.voterId.equals(newVoter.voterId)) {
          election.voters.remove(v);
          res.status(200);
          res.body("Voter removed.");
          return gson.toJson("Voter removed.");
        }
      }
      res.status(200);
      res.body("Voter doesn't exist");
      return gson.toJson("Voter doesn't exist");
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

  /**
   * Sends all emails to current voters.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password.
   * @return Amount of emails sent.
   */
  public String sendEmails(Request req, Response res) {
    if (authenticateAdmin(req)) {
      mail.sendEmails(election.voters);
      res.body(gson.toJson(mail.getEmailSentCount()));
      res.status(200);
      return gson.toJson(mail.getEmailSentCount());
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

  /**
   * Sends a single email. If voter exists it sends the actual voterId, otherwise
   * just "1234" as test.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password
   * @return success message.
   */
  public String sendSingleEmail(Request req, Response res) {
    if (authenticateAdmin(req)) {
      String email = req.body();
      Boolean foundVoter = false;
      for (Voter voter : election.voters) {
        if (voter.email != null && voter.email.equals(email)) {
          mail.sendSingleEmail(email, voter.voterId, voter.name);
          foundVoter = true;
        }
      }
      if (!foundVoter) {
        mail.sendSingleEmail(email, "1234", "");
      }
      res.body("Email sent");
      res.status(200);
      return gson.toJson("Email sent");
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

  /**
   * Updates admin password.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params current admin password.
   * @return success message.
   */
  public String updatePassword(Request req, Response res) {
    if (authenticateAdmin(req)) {
      String newPassword = req.body();
      password = newPassword;
      mail.resetPasswordEmail(newPassword);
      res.body("Password changed");
      res.status(200);
      return gson.toJson("Password changed");
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

  /**
   * Removes all voters, including styr and tiebreaker.
   * 
   * @param req
   * @param res
   * @param params
   * @return
   */
  public String removeAllVoters(Request req, Response res) {
    if (authenticateAdmin(req)) {
      election.voters = new ArrayList<>();
      res.body("Voters removed");
      res.status(200);
      return gson.toJson("Voters removed");
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

  /**
   * Returns all voters.
   * 
   * @param req
   * @param res
   * @param params
   * @return
   */
  public String getAllVoters(Request req, Response res) {
    validateAdmin(req, res); // Add this line to validate admin before accessing voters
    if (authenticateAdmin(req)) {
      res.status(200);
      return gson.toJson(election.voters);
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

}