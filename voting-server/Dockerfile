# Use a base image with Java pre-installed
FROM --platform=linux/amd64 openjdk:17

# Set the working directory inside the container
WORKDIR /app

# Copy the application JAR file into the container
COPY build/libs/vote-all.jar /app/vote-all.jar

# Expose the port on which your Java application listens
EXPOSE 8080

# Set the entrypoint command to run your Java application
CMD ["java", "-jar", "vote-all.jar"]
