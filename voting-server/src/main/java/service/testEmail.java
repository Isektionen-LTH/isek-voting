package service;

import java.util.ArrayList;

public class testEmail {
    public static void main(String[] args){
        MailService mail = new MailService(); 
        ArrayList<Voter> voters = new ArrayList<>(); 
        Voter v1 = new Voter(); 
        v1.name = "Victor Sannicolo";
        v1.email = "victor@sannicolo.se"; 
        v1.voterId = "3TC7-GK03-LMS1P"; 
        Voter v2 = new Voter(); 
        v2.email = "albinj60@gmail.com"; 
        v2.voterId = "3TC7-GK03-LMS1P"; 
        Voter v3 = new Voter(); 
        v3.email = "tobias.ohlssonbaath@gmail.com";
        v3.voterId = "4TC7-GK03-LMS1P"; 
        voters.add(v1);
        //voters.add(v3); 

        //mail.sendSingleEmail("victor@sannicolo.se", "1234");

        mail.sendEmails(voters);
    }
}
