package service;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * A class representing a part of election (omröstning/delval).
 * Most attributes public so they can be used with gson.fromJson() method.
 */
public class ElectionPart {
    public int id;
    public String title;
    public String type;
    public int winnercount;
    public String[] candidates;
    public String winner;
    public int votecount;
    public int voterSize; 
    private String oldWinner;
    public String voteprogress;
    public HashMap<String, DecisionVote> decisionVotes = new HashMap<String, DecisionVote>();
    public HashMap<String, IRVvote> personVotes = new HashMap<String, IRVvote>();

    /**
     * Adds a decisionVote to decisionVotes.
     * Checks if voter has already voted and in that case updates the vote.
     * 
     * @param vote      DecisionVote
     * @param voterSize How many eligible votes. 
     */
    public void addDecisionVote(DecisionVote vote, int voterSize) {
        if (decisionVotes.containsKey(vote.voterId)) {
            decisionVotes.remove(vote.voterId);
        } else {
            votecount++;
            this.voterSize = voterSize; 
        }
        decisionVotes.put(vote.voterId, vote);
    }

    /**
     * Adds a IRVvote to personVotes.
     * Checks if voter has already voted and in that case updates the vote.
     * 
     * @param vote      IRVvote
     * @param voterSize How many have voted so far.
     */
    public void addPersonVote(IRVvote vote, int voterSize) {
        if (personVotes.containsKey(vote.voterId)) {
            personVotes.remove(vote.voterId);
        } else {
            votecount++;
            this.voterSize = voterSize; 
        }
        personVotes.put(vote.voterId, vote);
    }

    /**
     * Determines the winner of ElectionPart (omröstning/delval).
     * 
     * @return The winner(s)
     */
    public void determineWinner() {
        double percentage = (voterSize != 0) ? (double) votecount / voterSize : 0.0;

        DecimalFormat decimalFormat = new DecimalFormat("#0.0");
        String formattedResult = Double.isNaN(percentage) ? "0.0" : decimalFormat.format(percentage * 100);
        voteprogress = votecount + "/" + voterSize + " (" + formattedResult + "%)";
        
        if (decisionVotes.size() == 0) {
            determinePersonWinner();
        } else if (personVotes.size() == 0) {
            determineDecisionWinner();
        }
    }

    /**
     * Determines winner in a Yes/No election.
     * 
     * @return winner.
     */
    private String determineDecisionWinner() {
        int yes = 0;
        int no = 0;

        for (DecisionVote decisionVote : decisionVotes.values()) {
            if (decisionVote.vote.equals("Ja")) {
                yes++;
            } else {
                no++;
            }
        }

        if (yes > no) {
            winner = "Ja";
            return "Ja";
        } else if (no > yes) {
            winner = "Nej";
            return "Nej";
        } else {
            winner = "Oavgjort";
            return "Lika";
        }
    }

    /**
     * Determines the winners of the election based on person votes using the
     * Instant Runoff Voting (IRV) algorithm.
     * 
     * In case of a tie when removing candidate with least votes:
     * - The candidate with the least amount of first choices (in original votes) is
     * removed, meaning the candidate that is most voters favourite is left.
     * - If none of the tied candidates have been a first choice ony ballot the one
     * to be removed is randomly selected.
     *
     * @return winners(s)
     */
    public String determinePersonWinner() {
        HashMap<String, Integer> tieBreakerOriginalFirstRanks = new HashMap<>();
        HashMap<String, Integer> firstRanks = new HashMap<>();
        ArrayList<ArrayList<String>> allVotes = new ArrayList<>();
        ArrayList<String> winners = new ArrayList<>();

        // Initilize allVotes
        for (IRVvote vote : personVotes.values()) {
            List<String> temp = Arrays.asList(vote.vote);
            ArrayList<String> rankings = new ArrayList<>();
            for (String candidate : temp) {
                if (candidate != null && !candidate.equals("Blankt")) {
                    rankings.add(candidate);
                }
            }
            allVotes.add(rankings);
        }

        // Initialize tie-breaker hashmap.
        for (ArrayList<String> rankings : allVotes) {
            String firstChoice = rankings.get(0);
            tieBreakerOriginalFirstRanks.put(firstChoice, firstRanks.getOrDefault(firstChoice, 0) + 1);
        }

        // Main loop
        while (winners.size() < winnercount && allVotes.size() > 0) {

            firstRanks.clear();

            // Set firstRanks values
            for (ArrayList<String> rankings : allVotes) {
                String firstChoice = rankings.get(0);
                firstRanks.put(firstChoice, firstRanks.getOrDefault(firstChoice, 0) + 1);
            }

            // Set threshold
            int threshold = Math.round(allVotes.size() / 2);

            // Check for winner
            Iterator<Map.Entry<String, Integer>> iterator = firstRanks.entrySet().iterator();
            Boolean winnerFound = false;
            while (iterator.hasNext()) {
                Map.Entry<String, Integer> entry = iterator.next();
                if (entry.getValue() > threshold) {
                    winners.add(entry.getKey());
                    iterator.remove(); // Remove entry from firstRanks
                    winnerFound = true;

                    // Redistribute votes
                    Iterator<ArrayList<String>> votesIterator = allVotes.iterator();
                    while (votesIterator.hasNext()) {
                        ArrayList<String> ranking = votesIterator.next();
                        if (ranking.contains(entry.getKey())) {
                            ranking.remove(entry.getKey());
                        }
                        if (ranking.isEmpty()) {
                            votesIterator.remove();
                        }
                    }
                }
            }

            // Remove candidate with least amount of votes if winner is not found
            if (!winnerFound) {
                int minCount = Integer.MAX_VALUE;
                ArrayList<String> candidatesWithLeastVotes = new ArrayList<>();

                for (Map.Entry<String, Integer> candidateSet : firstRanks.entrySet()) {
                    if (candidateSet.getValue() <= minCount) {
                        candidatesWithLeastVotes.add(candidateSet.getKey());
                        minCount = candidateSet.getValue();
                    }
                }

                // No ties
                if (candidatesWithLeastVotes.size() == 1) {
                    // Remove least votes candidate from firstRanks and allVotes
                    firstRanks.remove(candidatesWithLeastVotes.get(0));

                    // Redistribute votes
                    Iterator<ArrayList<String>> votesIterator = allVotes.iterator();
                    while (votesIterator.hasNext()) {
                        ArrayList<String> ranking = votesIterator.next();
                        if (ranking.contains(candidatesWithLeastVotes.get(0))) {
                            ranking.remove(candidatesWithLeastVotes.get(0));
                        }
                        if (ranking.isEmpty()) {
                            votesIterator.remove();
                        }
                    }
                } else if (candidatesWithLeastVotes.size() > 1) {
                    if (winnercount - winners.size() == 1) { // One position left, show tie
                        winners.add("Lika (" + String.join(", ", candidatesWithLeastVotes) + ")");
                        allVotes.clear(); // Stop while loop next iteration!
                    } else {
                        // TIE! Tiebreaker is used. The candidate with least original first vote choices
                        // is removed. First it it checked if at least one of the ties exist in
                        // tiebreaker.
                        boolean atLeastOneIsInOriginalVotes = false;
                        for (String candidate : candidatesWithLeastVotes) {
                            if (tieBreakerOriginalFirstRanks.containsKey(candidate)) {
                                atLeastOneIsInOriginalVotes = true;
                            }
                        }

                        int leastAmountOfOriginalFirstVotes = Integer.MAX_VALUE;
                        String candidateToRemove = null;

                        // Least is removed.
                        if (atLeastOneIsInOriginalVotes) {
                            for (String candidate : candidatesWithLeastVotes) {
                                if (tieBreakerOriginalFirstRanks.containsKey(candidate) && tieBreakerOriginalFirstRanks
                                        .get(candidate) < leastAmountOfOriginalFirstVotes) {
                                    leastAmountOfOriginalFirstVotes = tieBreakerOriginalFirstRanks.get(candidate);
                                    candidateToRemove = candidate;
                                }
                            }
                        } else { // Random one is removed!
                            candidateToRemove = getRandomElement(candidatesWithLeastVotes);
                        }

                        // Redistribute votes for each candidate to remove:
                        Iterator<ArrayList<String>> votesIterator = allVotes.iterator();
                        while (votesIterator.hasNext()) {
                            ArrayList<String> ranking = votesIterator.next();
                            if (ranking.contains(candidateToRemove)) {
                                ranking.remove(candidateToRemove);
                            }
                            if (ranking.isEmpty()) {
                                votesIterator.remove();
                            }
                        }
                    }
                }

            }
        }
        winner = String.join(", ", winners);
        return winner;
    }

    private static <T> T getRandomElement(ArrayList<T> list) {
        if (list.isEmpty()) {
            return null;
        }

        Random random = new Random();
        int randomIndex = random.nextInt(list.size());
        return list.get(randomIndex);
    }

    public boolean isWinnerChanged() {
        if (oldWinner == null || !oldWinner.equals(winner)) {
            oldWinner = winner;
            return true;
        } else {
            return false;
        }
    }

}
