package service;

public class test {
    public static void main(String[] args) {
        ElectionPart electionPart = new ElectionPart();
        electionPart.winnercount = 4;  // Set the number of winners to 2

        // Set up candidates
        String[] candidates = {"A", "B", "C", "D"};
        electionPart.candidates = candidates;

        // Add person votes
        IRVvote vote1 = new IRVvote();
        vote1.voterId = "Voter 1";
        vote1.vote = new String[]{"A", "C", "D"};

        IRVvote vote2 = new IRVvote();
        vote2.voterId = "Voter 2";
        vote2.vote = new String[]{"A", "B"};

        IRVvote vote3 = new IRVvote();
        vote3.voterId = "Voter 3";
        vote3.vote = new String[]{"A", "B"};

        IRVvote vote4 = new IRVvote();
        vote4.voterId = "Voter 4";
        vote4.vote = new String[]{"C"};

        IRVvote vote5 = new IRVvote();
        vote5.voterId = "Voter 5";
        vote5.vote = new String[]{"B", "C", "D"};

        electionPart.addPersonVote(vote1, 2);
        electionPart.addPersonVote(vote2, 2);
        electionPart.addPersonVote(vote3, 3);
        electionPart.addPersonVote(vote4, 5);
        electionPart.addPersonVote(vote5, 5);



        // Determine the winners
        System.out.println("Winner: " + electionPart.winner);
    }
}
