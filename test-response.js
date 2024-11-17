const { validateData } = require("./src/index");
const swaggerSpec = require("./src/swagger-spec.json");

// Mock data for validation
const requestBody = {
    name: "John Doe",
    age: 30,
    address: {
        street: "123 Main St",
        city: "Sample City",
        zipCode: "12345"
    }
};

const responseBody = {
    id: 1,
    name: "John Doe",
    age: 30
};

// Validate the request body
(async () => {
    console.log("Validating request body...");
    try {
        await validateData(requestBody, swaggerSpec, "/user", "POST", "requestBody");
    } catch (error) {
        console.error("Request body validation failed:", error.message);
    }

    console.log("Validating response...");
    try {
        await validateData(responseBody, swaggerSpec, "/user", "POST", "response", "201");
    } catch (error) {
        console.error("Response validation failed:", error.message);
    }
})();