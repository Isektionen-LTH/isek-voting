package service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class TESTWix {
    public static void main(String[] args) {
        String retrieveEventUrl = "https://www.wixapis.com/events/v1/events/event?slug=ht-mote-2023";
        String wixAccountId = "79ee1d9c-1457-4e91-83d1-969c23b1de32";
        String wixSiteId = "10931ecf-bcec-4203-9a8a-df44a225b0d2";
        String auth = "IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcImRkYTU0ZTE5LWVkMmItNDJmMC1hYTU0LWUyOWNkNjYwMThjYVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcImY3NzllMTI1LTVjMjMtNGViNS1hM2FlLWIwYTBlNTA5YzZiMlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCI3OWVlMWQ5Yy0xNDU3LTRlOTEtODNkMS05NjljMjNiMWRlMzJcIn19IiwiaWF0IjoxNzAyMDQ1MTgxfQ.QgI1ho7WFBs_rzipLbtm1QihX94e3G64J4aYISNjfrZWVplC4Liqr4MloIpA72lQ_SU8MjaM51Yqj1SoGrfxnZhIzRyw9kKAJXdBGIGSxvUqbi6YcWeyPtzYnI1UdNEGsKJioK6rD-2bmxQvDIoKX7swDGSGpwE8X58ZnR05Nn-TMA6Z58Jj7hMoOw9fao1ZBcBA0LEI5_YsBKSQq66Jd8mZ0t9EBws-BlcQ1gN40-2WZ88EOUpn2_GBTIKqRhKRvCyfshAQ_VbZ75gnS5tco3zeHdYzLEwmFuPnkKRQS6yszWB7vPhfr3vDMxeNhyBvPhS_s4uFbYqxGpKiUJkWjg";
        String eventId = null;

        // Retrieve event id from Wix.
        try {
            URL url = new URL(retrieveEventUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // Set request method to GET
            connection.setRequestMethod("GET");

            // Set request headers
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", auth);
            connection.setRequestProperty("wix-account-id", wixAccountId);
            connection.setRequestProperty("wix-site-id", wixSiteId);

            // Print response code
            int responseCode = connection.getResponseCode();

            // Read and print response body
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String inputLine;
                StringBuilder content = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }

                in.close();

                // Parse the JSON response
                JsonObject jsonObject = JsonParser.parseString(content.toString()).getAsJsonObject();

                // Extract the event ID as a string
                eventId = jsonObject.getAsJsonObject("event").get("id").getAsString();

                // Print the event ID
                System.out.println("Event ID: " + eventId);
            } else {
                System.out.println("Request failed with error code: " + responseCode);
            }

            // Close the connection
            connection.disconnect();

        } catch (IOException e) {
            e.printStackTrace();
        }

        // Retreieve guest data from Wix.
        try {
            URL url = new URL("https://www.wixapis.com/events-guests/v2/guests/query");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // Set request method to POST
            connection.setRequestMethod("POST");

            // Set request headers
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Authorization", auth);
            connection.setRequestProperty("wix-account-id", wixAccountId);
            connection.setRequestProperty("wix-site-id", wixSiteId);

            // Enable input/output streams
            connection.setDoOutput(true);

            // Define the JSON body
            String jsonBody = "{\n" +
                    "    \"query\": {\n" +
                    "        \"filter\": {\n" +
                    "            \"eventId\": \"" + eventId + "\"\n" +
                    "        },\n" +
                    "        \"fieldsets\": [\n" +
                    "            \"guestDetails\"\n" +
                    "        ],\n" +
                    "        \"paging\": {\n" +
                    "            \"limit\": 50\n" +
                    "        }\n" +
                    "    }\n" +
                    "}";

            // Write the JSON body to the output stream
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Print response code
            int responseCode = connection.getResponseCode();

            // Read and print response body
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String inputLine;
                StringBuilder content = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }

                in.close();

                // Parse the JSON string
                JsonObject jsonObject = JsonParser.parseString(content.toString()).getAsJsonObject();

                // Get the "guests" array from the JSON
                JsonArray guestsArray = jsonObject.getAsJsonArray("guests");

                System.out.println(guestsArray);

                // Create a new JSON array to store the filtered guests
                JsonArray filteredGuestsArray = new JsonArray();

                // Iterate through each guest in the "guests" array
                for (int i = 0; i < guestsArray.size(); i++) {
                    JsonObject guest = guestsArray.get(i).getAsJsonObject();

                    // Check if the guest has "checkedIn" set to true
                    boolean checkedIn = guest.getAsJsonObject("guestDetails").get("checkedIn").getAsBoolean();

                    if (checkedIn) {
                        // Create a new JSON object for the filtered guest
                        JsonObject filteredGuest = new JsonObject();

                        // Extract relevant information and add it to the filtered guest object
                        filteredGuest.addProperty("name",
                                guest.getAsJsonObject("guestDetails").get("firstName").getAsString() +
                                        " " + guest.getAsJsonObject("guestDetails").get("lastName").getAsString());
                        filteredGuest.addProperty("email",
                                guest.getAsJsonObject("guestDetails").get("email").getAsString());
                        filteredGuest.addProperty("voterId", guest.getAsJsonPrimitive("orderNumber").getAsString());

                        // Add the filtered guest to the new array
                        filteredGuestsArray.add(filteredGuest);
                    }
                }

                // Print the final JSON array
                System.out.println();
                System.out.println();

                System.out.println(filteredGuestsArray.toString());
            } else {
                System.out.println("Request failed with error code: " + responseCode);
            }

            // Close the connection
            connection.disconnect();

        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
