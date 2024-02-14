package service;

public class MailTester {
    public static void main (String[] args){
        MailService mail = new MailService(); 

        mail.sendSingleEmail("victor@sannicolo.se", "1234", "Victor"); 
    }
    
}
