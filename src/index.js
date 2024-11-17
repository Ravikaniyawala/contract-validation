const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const addMergePatch = require("ajv-merge-patch");

/**
 * Validates data (response or request body) against a Swagger spec definition.
 *
 * @param {Object} data - The data (response or request body) to validate.
 * @param {Object} swaggerSpec - The parsed Swagger spec.
 * @param {String} endpoint - The endpoint being validated.
 * @param {String} method - The HTTP method (e.g., GET, POST).
 * @param {String} type - The type of data to validate ('response' or 'requestBody').
 * @param {String} [statusCode] - The expected HTTP status code. Required for response validation.
 */
async function validateData(data, swaggerSpec, endpoint, method, type, statusCode = null) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    addMergePatch(ajv);

    // Add the entire Swagger spec to Ajv
    ajv.addSchema(swaggerSpec, 'swaggerSpec');

    // Locate the operation for the given endpoint and method
    const operation = swaggerSpec.paths[endpoint]?.[method.toLowerCase()];
    if (!operation) {
        throw new Error(`No operation found for ${method} ${endpoint}`);
    }

    let schema;
    if (type === "response") {
        // Locate the response schema
        schema = operation.responses[statusCode]?.content?.["application/json"]?.schema;
        if (!schema) {
            throw new Error(`No response schema found for status code ${statusCode} at ${method} ${endpoint}`);
        }
    } else if (type === "requestBody") {
        // Locate the request body schema
        schema = operation.requestBody?.content?.["application/json"]?.schema;
        if (!schema) {
            throw new Error(`No requestBody schema found for ${method} ${endpoint}`);
        }
    } else {
        throw new Error("Invalid type. Must be 'response' or 'requestBody'.");
    }

    // Compile and validate with Ajv
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
        console.error("Validation errors:", validate.errors);
        throw new Error(`${type} does not match the Swagger spec.`);
    }

    console.log(`${type} is valid!`);
}

module.exports = { validateData };
console.log(module.exports);