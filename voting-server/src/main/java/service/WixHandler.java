package service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class WixHandler {
    static String wixAccountId = "79ee1d9c-1457-4e91-83d1-969c23b1de32";
    static String wixSiteId = "10931ecf-bcec-4203-9a8a-df44a225b0d2";
    static String auth = "IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcImRkYTU0ZTE5LWVkMmItNDJmMC1hYTU0LWUyOWNkNjYwMThjYVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcImY3NzllMTI1LTVjMjMtNGViNS1hM2FlLWIwYTBlNTA5YzZiMlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCI3OWVlMWQ5Yy0xNDU3LTRlOTEtODNkMS05NjljMjNiMWRlMzJcIn19IiwiaWF0IjoxNzAyMDQ1MTgxfQ.QgI1ho7WFBs_rzipLbtm1QihX94e3G64J4aYISNjfrZWVplC4Liqr4MloIpA72lQ_SU8MjaM51Yqj1SoGrfxnZhIzRyw9kKAJXdBGIGSxvUqbi6YcWeyPtzYnI1UdNEGsKJioK6rD-2bmxQvDIoKX7swDGSGpwE8X58ZnR05Nn-TMA6Z58Jj7hMoOw9fao1ZBcBA0LEI5_YsBKSQq66Jd8mZ0t9EBws-BlcQ1gN40-2WZ88EOUpn2_GBTIKqRhKRvCyfshAQ_VbZ75gnS5tco3zeHdYzLEwmFuPnkKRQS6yszWB7vPhfr3vDMxeNhyBvPhS_s4uFbYqxGpKiUJkWjg";
    static String eventId = null;
    static JsonArray filteredGuestsArray = new JsonArray();
    static JsonArray guestDetailsArray = new JsonArray();

    public static JsonArray getDataFromWix() {
        getWixEventId("ht-mote-2023");
        System.out.println(guestDetailsArray.size());
        int totalNumberOfGuests = getTotalNumberOfGuests();
        int batchSize = 100;

        System.out.println(totalNumberOfGuests);

        for (int offset = 0; offset < totalNumberOfGuests; offset += batchSize) {
            int limit = Math.min(batchSize, totalNumberOfGuests - offset);

            getGuestStatusFromWix(limit, offset);
        }
        getGuestStatusFromWix(100, 0);
        getGuestStatusFromWix(100, 50);
        getGuestStatusFromWix(100, 100);
        getGuestStatusFromWix(100, 150);
        getGuestStatusFromWix(100, 200);
        getGuestStatusFromWix(100, 250);
        getGuestStatusFromWix(100, 300);
        getGuestStatusFromWix(100, 350);
        getGuestStatusFromWix(100, 400);
        getGuestStatusFromWix(100, 450);

        System.out.println(guestDetailsArray.size());

        System.out.println(guestDetailsArray);
        return new JsonArray();
    }

    private static void getWixEventId(String slug) {
        URL url;
        try {
            url = new URL("https://www.wixapis.com/events/v1/events/event?slug=" + slug);
        } catch (MalformedURLException e) {
            System.out.println("URL malformed");
            url = null;
            e.printStackTrace();
        }

        try {
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
    }

    private static int getTotalNumberOfGuests() {
        URL url;
        int nbrGuests = 0;

        try {
            url = new URL("https://www.wixapis.com/events/v1/events/" + eventId + "/tickets");
        } catch (MalformedURLException e) {
            System.out.println("URL malformed");
            url = null;
            e.printStackTrace();
        }

        try {
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
                nbrGuests = jsonObject.get("total").getAsInt();

            } else {
                System.out.println("Request failed with error code: " + responseCode);
            }

            // Close the connection
            connection.disconnect();

        } catch (IOException e) {
            e.printStackTrace();
        }

        return nbrGuests;
    }

    private static JsonArray getGuestStatusFromWix(int limit, int offset) {
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
                    "            \"offset\": " + offset + ",\n" +
                    "            \"limit\": " + limit + "\n" +
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
                filteredGuestsArray = jsonObject.getAsJsonArray("guests");
            }

            for (int i = 0; i < filteredGuestsArray.size(); i++) {
                JsonElement guest = filteredGuestsArray.get(i);
                JsonElement details = guest.getAsJsonObject().get("guestDetails");
                String voterId = guest.getAsJsonObject().getAsJsonArray("tickets").get(0).getAsJsonObject()
                        .get("number").getAsString();

                Boolean checkedIn = details.getAsJsonObject().get("checkedIn").getAsBoolean();

                if (checkedIn) {
                    String email;
                    String firstName;
                    String lastName;
                    String name;

                    try {
                        email = details.getAsJsonObject().get("email").getAsString();
                        firstName = details.getAsJsonObject().get("firstName").getAsString();
                        lastName = details.getAsJsonObject().get("lastName").getAsString();
                        name = firstName + " " + lastName;
                    } catch (Exception e) {
                        JsonObject obj = getMissingDetailsWix(voterId);
                        email = obj.get("email").getAsString();
                        name = obj.get("name").getAsString();
                    }

                    JsonObject guestDetails = new JsonObject();
                    guestDetails.addProperty("name", name);
                    guestDetails.addProperty("email", email);
                    guestDetails.addProperty("voterId", voterId);
                    if (!guestDetailsArray.contains(guestDetails)) {
                        System.out.println(name);

                        guestDetailsArray.add(guestDetails);
                    }

                }

            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return guestDetailsArray;

    }

    private static JsonObject getMissingDetailsWix(String ticketNumber) {
        JsonObject details = new JsonObject();
        try {

            URL url = new URL(
                    "https://www.wixapis.com/events/v1/events/" + eventId + "/tickets/"
                            + ticketNumber + "?fieldset=GUEST_DETAILS&fieldset=TICKET_DETAILS");

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
                BufferedReader in = new BufferedReader(
                        new InputStreamReader(connection.getInputStream()));
                String inputLine;
                StringBuilder content = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }

                in.close();

                JsonObject jsonObject = JsonParser.parseString(content.toString()).getAsJsonObject();

                JsonElement firstName = jsonObject.getAsJsonObject("ticket")
                        .getAsJsonObject("guestDetails").get("firstName");
                JsonElement lastName = jsonObject.getAsJsonObject("ticket").getAsJsonObject("guestDetails")
                        .get("lastName");
                JsonElement email = jsonObject.getAsJsonObject("ticket").getAsJsonObject("guestDetails")
                        .get("email");

                details.addProperty("name", firstName.getAsString() + " " + lastName.getAsString());
                details.addProperty("email", email.getAsString());
                details.addProperty("voterId", ticketNumber);

            } else {
                System.out.println("Request failed with error code: " + responseCode);
            }

            // Close the connection
            connection.disconnect();

        } catch (IOException e) {
            e.printStackTrace();
        }

        return details;
    }

    public static JsonArray getGuestsFromWix() {
        JsonArray filteredGuestsArray = new JsonArray();

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
                    "            \"limit\": 100\n" +
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

                // Iterate through each guest in the "guests" array
                for (int i = 0; i < 100; i++) {
                    JsonObject guest = guestsArray.get(i).getAsJsonObject();
                    System.out.println();
                    JsonArray ticketsArray = guest.getAsJsonArray("tickets");
                    JsonObject firstTicket = ticketsArray.get(0).getAsJsonObject();
                    String ticketNumber = firstTicket.get("number").getAsString();
                    System.out.println(ticketNumber);

                    System.out.println();

                    try {

                        URL url2 = new URL(
                                "https://www.wixapis.com/events/v1/events/" + eventId + "/tickets/"
                                        + ticketNumber + "?fieldset=GUEST_DETAILS&fieldset=TICKET_DETAILS");

                        HttpURLConnection connection2 = (HttpURLConnection) url2.openConnection();

                        // Set request method to GET
                        connection2.setRequestMethod("GET");

                        // Set request headers
                        connection2.setRequestProperty("Content-Type", "application/json");
                        connection2.setRequestProperty("Authorization", auth);
                        connection2.setRequestProperty("wix-account-id", wixAccountId);
                        connection2.setRequestProperty("wix-site-id", wixSiteId);

                        // Print response code
                        int responseCode2 = connection2.getResponseCode();

                        // Read and print response body
                        if (responseCode2 == HttpURLConnection.HTTP_OK) {
                            BufferedReader in2 = new BufferedReader(
                                    new InputStreamReader(connection2.getInputStream()));
                            String inputLine2;
                            StringBuilder content2 = new StringBuilder();

                            while ((inputLine2 = in2.readLine()) != null) {
                                content2.append(inputLine2);
                            }

                            in2.close();

                            JsonObject jsonObject2 = JsonParser.parseString(content2.toString()).getAsJsonObject();

                            JsonElement firstName = jsonObject2.getAsJsonObject("ticket")
                                    .getAsJsonObject("guestDetails").get("firstName");
                            JsonElement lastName = jsonObject2.getAsJsonObject("ticket").getAsJsonObject("guestDetails")
                                    .get("lastName");
                            JsonElement email = jsonObject2.getAsJsonObject("ticket").getAsJsonObject("guestDetails")
                                    .get("email");

                            JsonObject details = new JsonObject();
                            details.addProperty("name", firstName.getAsString() + " " + lastName.getAsString());
                            details.addProperty("email", email.getAsString());
                            details.addProperty("voterId", ticketNumber);

                            filteredGuestsArray.add(details);

                        } else {
                            System.out.println("Request failed with error code: " + responseCode2);
                        }

                        // Close the connection
                        connection2.disconnect();

                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                    // Check if the guest has "checkedIn" set to true
                    /*
                     * boolean checkedIn =
                     * guest.getAsJsonObject("guestDetails").get("checkedIn").getAsBoolean();
                     * 
                     * if (checkedIn) {
                     * // Create a new JSON object for the filtered guest
                     * JsonObject filteredGuest = new JsonObject();
                     * 
                     * // Extract relevant information and add it to the filtered guest object
                     * filteredGuest.addProperty("name",
                     * guest.getAsJsonObject("guestDetails").get("firstName").getAsString() +
                     * " " + guest.getAsJsonObject("guestDetails").get("lastName").getAsString());
                     * filteredGuest.addProperty("email",
                     * guest.getAsJsonObject("guestDetails").get("email").getAsString());
                     * filteredGuest.addProperty("voterId",
                     * guest.getAsJsonPrimitive("orderNumber").getAsString());
                     * 
                     * // Add the filtered guest to the new array
                     * filteredGuestsArray.add(filteredGuest);
                     * }
                     */
                }

            } else {
                System.out.println("Request failed with error code: " + responseCode);
            }

            // Close the connection
            connection.disconnect();

        } catch (IOException e) {
            e.printStackTrace();
        }
        return filteredGuestsArray;

    }

    public static void main(String[] args) {
        getDataFromWix();
    }
}
