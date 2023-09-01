package service;

import java.util.ArrayList;

/**
 * Wrapper class for a whole eleciton, including several electionParts (delval/omröstningar). 
 */
public class Election {
    public ElectionPart[] electionParts; 
    public ArrayList<Voter> voters; 
    public String tieBreakerId; 

    public boolean containsVoterWithId(String params) {
        for (Voter voter : voters) {
            if (voter.voterId.equals(params)) {
                return true;
            }
        }
        return false;
    }
}



