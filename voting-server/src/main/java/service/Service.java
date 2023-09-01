package service;

import java.util.ArrayList;
import java.util.List;
import spark.Request;
import spark.Response;
import spark.Session;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

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
   * Endpoint to create an election.
   * 
   * @param req    Request object: Json representation of an Election.
   * @param res    Response object
   * @param params - admin password
   * @return - Success or error message.
   */
  /*
   * public String createElection(Request req, Response res, String params) {
   * if (params.equals(password)) {
   * Election e = gson.fromJson(req.body(), Election.class);
   * election = e;
   * var reponseBody = "Election created";
   * res.body(reponseBody);
   * res.status(201);
   * return reponseBody;
   * } else {
   * res.status(403);
   * res.body("Fel");
   * return "Fel";
   * }
   * }
   */

  /**
   * Retrieves election data.
   *
   * @param req    Request object
   * @param res    Response object
   * @param params - admin password
   * @return - JSON representation of election data.
   */
  public String getElectionData(Request req, Response res, String params) {
    determineWinners();
    if (params.equals(password)) {
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
  public String updateElectionVoters(Request req, Response res, String params) {
    if (params.equals(password)) {
      try {
        String requestBody = req.body();

        // Parse the JSON array of voters
        TypeToken<List<Voter>> token = new TypeToken<List<Voter>>() {
        };
        ArrayList<Voter> voters = gson.fromJson(requestBody, token.getType());

        // Update the election's voters with the new values
        election.voters = voters;

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
   * Removes an election part from election.
   *
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password
   * @return A string indicating the status of the removal process.
   */
  /*
   * public String removeElectionPart(Request req, Response res, String params) {
   * if (params.equals(password)) {
   * try {
   * 
   * int partId = Integer.parseInt(req.body());
   * 
   * // Create a new array to hold the updated election parts
   * ElectionPart[] updatedElectionParts = new
   * ElectionPart[election.electionParts.length - 1];
   * 
   * // Copy the existing election parts to the updated array, excluding the part
   * to
   * // be removed
   * int index = 0;
   * for (ElectionPart electionPart : election.electionParts) {
   * if (electionPart.id != partId) {
   * updatedElectionParts[index] = electionPart;
   * index++;
   * }
   * }
   * 
   * // Update the election's parts with the new array
   * election.electionParts = updatedElectionParts;
   * 
   * // Return the success message
   * res.status(200);
   * return "Success";
   * } catch (Exception e) {
   * e.printStackTrace();
   * res.status(500);
   * res.body("Server error");
   * return gson.toJson("Server error");
   * }
   * } else {
   * res.status(403);
   * res.body(null);
   * return null;
   * }
   * }
   */

  /**
   * Updates all electionParts.
   * 
   * @param req    The request object.
   * @param res    The response object.
   * @param params admin password.
   * @return success message
   */
  public String updateElectionParts(Request req, Response res, String params) {
    if (params.equals(password)) {
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

        /*
         * // Create a new array to hold the updated election parts
         * ElectionPart[] updatedElectionParts = new
         * ElectionPart[election.electionParts.length + electionParts.size()];
         * 
         * // Copy the existing election parts to the updated array
         * System.arraycopy(election.electionParts, 0, updatedElectionParts, 0,
         * election.electionParts.length);
         * 
         * // Add the new row to the updated array
         * int startIndex = election.electionParts.length;
         * for (int i = 0; i < electionParts.size(); i++) {
         * updatedElectionParts[startIndex + i] = electionParts.get(i);
         * }
         */

        // Update the election's parts with the new array
        election.electionParts = updatedElectionParts;

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
  public String setCurrentPart(Request req, Response res, String params) {
    if (params.equals(password)) {
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
      for (ElectionPart p : election.electionParts) {
        if (p.id == Integer.parseInt(currentElectionPart)) {
          res.status(200);
          String data = gson.toJson(p);
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
    System.out.println("Connection established");

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

    for (ElectionPart p : election.electionParts) {
      if (p.id == Integer.parseInt(currentElectionPart)) {
        res.status(200);
        String data = gson.toJson(p);
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
  public String longPollingResults(Request req, Response res, String params) {
    if (params.equals(password)) {
      // Perform long polling logic
      System.out.println("Admin connected.");
      long startTime = System.currentTimeMillis();
      long timeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      synchronized (election.electionParts) {
        try {
          // Wait for changes in votecount or timeout
          while (true) {
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
              return json;
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

            System.out.println("Admin check. Connections:" + Thread.activeCount() + "/1000");

            try {
              Thread.sleep(1000);
            } catch (InterruptedException e) {
              e.printStackTrace();
            }
          }
        } catch (Exception e) {
          e.printStackTrace();
          res.status(500);
          res.body(null);
          return null;
        }
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
  public String validateAdmin(Request req, Response res, String params) {
    if (params.equals(password)) {
      res.status(200);
      var result = gson.toJson("Log in successful");
      res.body(result);
      return result;
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
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
  public String addSingleVoter(Request req, Response res, String params) {
    if (params.equals(password)) {
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
  public String removeSingleVoter(Request req, Response res, String params) {
    if (params.equals(password)) {
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
  public String sendEmails(Request req, Response res, String params) {
    if (params.equals(password)) {
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
  public String sendSingleEmail(Request req, Response res, String params) {
    if (params.equals(password)) {
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
  public String updatePassword(Request req, Response res, String params) {
    if (params.equals(password)) {
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

  public String removeAllVoters(Request req, Response res, String params) {
    if (params.equals(password)) {
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

  public String getAllVoters(Request req, Response res, String params) {
    if (params.equals(password)) {
      res.status(200);
      return gson.toJson(election.voters);
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

  public String setTieBreaker(Request req, Response res, String params) {
    if (params.equals(password)) {
      // Remove previous tiebreaker:
      election.voters.removeIf(v -> v.voterId.equals(election.tieBreakerId));

      // Add new
      String s = "{\"name\":Tiebreaker,\"voterId\":" + req.body() + "}";
      Voter newVoter = gson.fromJson(s, Voter.class);
      election.voters.add(newVoter);
      election.tieBreakerId = newVoter.voterId;
      for (ElectionPart part : election.electionParts) {
        part.tieBreakerId = req.body();
      }
      System.out.println(gson.toJson(election.voters));
      res.status(200);
      res.body("Tiebreaker changed.");
      return "Tiebreaker changed.";
    } else {
      res.status(403);
      res.body("Invalid authentication");
      return gson.toJson("Invalid authentication");
    }
  }

}