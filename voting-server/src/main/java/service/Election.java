package service;

import java.util.ArrayList;

/**
 * Wrapper class for a whole eleciton, including several electionParts (delval/omröstningar). 
 */
public class Election {
    public ElectionPart[] electionParts; 
    public ArrayList<Voter> voters; 
}
