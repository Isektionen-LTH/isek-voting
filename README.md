Hej! 

Det här är en Java backend server + React frontend för att hantera I-sektionens röstningsystem på HT/VT möten. 
All kommunikation sker över HTTP med JSON objekt. Jag har försökt dokumentera all kod så noggrant som möjligt. 
Om det återstår några frågor går det bra att kontakta mig på victor@sannicolo.se. Det blev lite större projekt än
vad jag hade tänkt mig, så ber om ursäkt om något är rörigt! 

Översikt av alla klasser i voting-server: 
- Main.java: innehåller main metod och hanterar alla HTTP endpoints. 
- Service.java: Innehåller metoder för att hantera requests/response från HTTP kommunikaitonen. Innehåller även datastruktur för pågående val. 
- Election.java: Wrapperklass för ett val innehållande flera delval (electionParts) och voters. 
- Voter.java: Wrapperklass för en enskild voter (röstare). 
- ElectionPart.java: Wrapperklass för ett delval/omröstning. Ex rösta på Ordförande för sektionen. 
- DecisionVote.java: Wrapperklass för en enskild DecisionVote (Ja/Nej röst).
- IRVvote.java: Wrapperklass för en enskild IRVvote (personröst). Används för personval.
- MailService.java: Klas som hanterar automatiska mejlutskick. 

Förbättrinsmöjligheter:
- Använd web sockets eller server send events istället för long-polling: mer tillförlitligt och effektivt. 
- Förbättra användarvänligheten på admin-sidan (klient). 
- Refaktorisera kod... 

En hel del kommer från kurserna "Agil programvaruutveckling" (server) och "Webbutveckling" (client), samt programmeringskurserna. Däremot är det en hel del som inte kurserna går igenom, där hänvisar jag till Google och ChatGPT :) 
Läs gärna igenom testamentet på WebbIs drive samt "Guide för WebbI" i samma mapp!!! 

Clienten är byggd med React och ligger på Google Firebase (WebbIs konto) : vote.isek.se 
Servern ligger och kör i en dockercontainer på DigitalOcean : vote-server.isek.se 
Se One.com för DNS hantering. 

För att köra lokalt/utveckla: 

    Server: 
    - cd voting-server: gå in i rätt directory 
    - gradle build: "updatera" gradle filen, kör efter ändringar. 
    - gradle run: "Starta" servern lokalt. Körs på localhost:8080

    Web: 
    - cd web-voting
    - npm start: startar React lokalt, öppna en browser och nå systemet på localhost:3000. 
    - npm run build: bygger en version redo att publiseras (firebase). 
    - firebase deploy: uppdatera versionen på firebase (se till att du är inloggad med WebbIs konto). 




Röstsystemet skapades våren 2023 av Victor Sannicolo (WebbI-23). 
