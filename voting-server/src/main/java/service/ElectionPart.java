package service;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

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
    public String alternative1;
    public String alternative2;
    public String winner;
    public int votecount;
    public int voterSize;
    private String oldWinner;
    public String voteprogress;
    public String tieBreakerVote;
    public String[] tieBreakerIRVvote;
    public String tieBreakerId;
    public HashMap<String, DecisionVote> decisionVotes = new HashMap<String, DecisionVote>();
    public HashMap<String, DecisionVote> multipleVotes = new HashMap<String, DecisionVote>();
    public HashMap<String, IRVvote> personVotes = new HashMap<String, IRVvote>();

    /**
     * Adds a decisionVote to decisionVotes.
     * Checks if voter has already voted and in that case updates the vote.
     * 
     * @param vote      DecisionVote
     * @param voterSize How many eligible votes.
     */
    public void addDecisionVote(DecisionVote vote, int voterSize) {
        if (!decisionVotes.containsKey(vote.voterId)) {
            votecount++;
        }
        if (vote.voterId.equals(tieBreakerId)) {
            tieBreakerVote = vote.vote;
        }

        decisionVotes.put(vote.voterId, vote);
        this.voterSize = voterSize;
    }

    /**
     * Adds a MultipleVote to multipleVotes.
     * Checks if voter has already voted and in that case updates the vote.
     * 
     * @param vote      DecisionVote
     * @param voterSize How many eligible votes.
     */
    public void addMultipleVote(DecisionVote vote, int voterSize) {
        if (!multipleVotes.containsKey(vote.voterId)) {
            votecount++;
        }

        if (vote.voterId.equals(tieBreakerId)) {
            tieBreakerVote = vote.vote;
        }

        multipleVotes.put(vote.voterId, vote);
        this.voterSize = voterSize;
    }

    /**
     * Adds a IRVvote to personVotes.
     * Checks if voter has already voted and in that case updates the vote.
     * 
     * @param vote      IRVvote
     * @param voterSize How many have voted so far.
     */
    public void addPersonVote(IRVvote vote, int voterSize) {
        if (!personVotes.containsKey(vote.voterId)) {
            votecount++;
        }

        if (vote.voterId.equals(tieBreakerId)) {
            tieBreakerIRVvote = vote.vote;
        }

        personVotes.put(vote.voterId, vote);
        this.voterSize = voterSize;
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

        if (personVotes.size() != 0) {
            determinePersonWinner();
        } else if (decisionVotes.size() != 0) {
            determineDecisionWinner();
        } else if (multipleVotes.size() != 0) {
            determineMultipleWinner();
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
            if (tieBreakerVote != null) {
                winner = tieBreakerVote;
                return tieBreakerVote;
            } else {
                winner = "Oavgjort";
                return "Lika";
            }
        }
    }

    /**
     * Determines winner in a "Flerval" election.
     * 
     * @return winner.
     */
    private String determineMultipleWinner() {
        int alternative1Count = 0;
        int alternative2Count = 0;

        for (DecisionVote decisionVote : multipleVotes.values()) {
            if (decisionVote.vote.equals(alternative1)) {
                alternative1Count++;
            } else {
                alternative2Count++;
            }
        }

        if (alternative1Count > alternative2Count) {
            winner = alternative1;
            return alternative1;
        } else if (alternative2Count > alternative1Count) {
            winner = alternative2;
            return alternative2;
        } else {
            if (tieBreakerVote != null) {
                winner = tieBreakerVote;
                return tieBreakerVote;
            } else {
                winner = "Oavgjort";
                return "Lika";
            }
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
            // Only add rankings if not all null or blank.
            if (rankings.size() != 0) {
                allVotes.add(rankings);
            }
        }

        // Initialize tie-breaker hashmap.
        for (ArrayList<String> rankings : allVotes) {
            String firstChoice = rankings.get(0);
            tieBreakerOriginalFirstRanks.put(firstChoice, firstRanks.getOrDefault(firstChoice, 0) + 1);
        }


        // Main loop
        while (winners.size() < winnercount && allVotes.size() > 0) {
            firstRanks.clear();

            System.out.println(allVotes);

            // Check if there are enough unique candidates to fill empty winner positions.
            // If not, break loop and rest of candidates are winners.
            Set<String> uniqueCandidates = new HashSet<>();
            allVotes.forEach(uniqueCandidates::addAll);

            if (uniqueCandidates.size() <= (winnercount - winners.size())) {
                // Automatically declare unique candidates as winners
                uniqueCandidates.stream()
                        .forEach(winners::add);
                break; // Exit the main loop since we have enough winners
            }

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
            while (iterator.hasNext() && !winnerFound) {
                Map.Entry<String, Integer> entry = iterator.next();
                if (entry.getValue() > threshold) {
                    winners.add(entry.getKey());
                    iterator.remove(); // Remove entry from firstRanks
                    winnerFound = true;

                    // Redistribute votes
                    redistributeVotes(entry.getKey(), allVotes);
                }
            }

            // Remove candidate with least amount of votes if winner is not found
            if (!winnerFound) {
                int minCount = Integer.MAX_VALUE;
                ArrayList<String> candidatesWithLeastVotes = new ArrayList<>();
                // Initializes minCount value:
                for (Map.Entry<String, Integer> candidateSet : firstRanks.entrySet()) {
                    if (candidateSet.getValue() <= minCount) {
                        minCount = candidateSet.getValue();
                    }
                }

                // Checks for several candidates with same least amount of votes.
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
                    redistributeVotes(candidatesWithLeastVotes.get(0), allVotes);

                } else if (candidatesWithLeastVotes.size() > 1) {
                    if (winnercount - winners.size() == 1) { // One position left, show tie

                        // Check if tieBreakerIRVVote contains at least one in candidatesWithLeastVotes.
                        boolean containsCandidate = false;
                        if (tieBreakerIRVvote != null) {
                            for (String candidate : candidatesWithLeastVotes) {
                                for (String vote : tieBreakerIRVvote) {
                                    if (candidate.equals(vote)) {
                                        containsCandidate = true;
                                    }
                                }
                            }
                        }

                        if (containsCandidate) {
                            for (String candidate : tieBreakerIRVvote) {
                                if (candidatesWithLeastVotes.contains(candidate) && !winners.contains(candidate)) {
                                    winners.add(candidate);
                                    break;
                                }
                            }
                        } else {
                            winners.add("Lika (" + String.join(", ", candidatesWithLeastVotes) + ")");
                        }
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
                            Collections.shuffle(candidatesWithLeastVotes); // Randomize the candidate list
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
                        redistributeVotes(candidateToRemove, allVotes);

                    }
                }

            }

        }
        winner = String.join(", ", winners);
        return winner;
    }

    private ArrayList<ArrayList<String>> redistributeVotes(String candidateToRemove,
            ArrayList<ArrayList<String>> allVotes) {
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
        return allVotes;
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
        if (winner == null) {
            oldWinner = winner;
            return false;
        } else if (oldWinner == null || !oldWinner.equals(winner)) {
            oldWinner = winner;
            return true;
        } else {
            return false;
        }
    }

}
