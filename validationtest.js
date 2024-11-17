/**
 * Validates that all fields in the response match the Swagger spec definition.
 * @param {Object} response - The actual response object to validate.
 * @param {Object} swaggerResponseSpec - The expected response schema from Swagger spec.
 * @throws {Error} If any field in the response is not defined in the Swagger spec.
 */
function validateResponseFields(response, swaggerResponseSpec) {
  // Helper function to recursively validate fields
  function validateFields(responseObj, swaggerObj, path = '') {
    // Check each field in the response object
    for (const key in responseObj) {
      const fullPath = path ? `${path}.${key}` : key;

      // Check if the field is in the Swagger spec
      if (!swaggerObj[key]) {
        throw new Error(`Unexpected field '${fullPath}' found in response but not in Swagger spec.`);
      }

      // Check if it's an object, validate recursively
      if (typeof responseObj[key] === 'object' && !Array.isArray(responseObj[key]) && responseObj[key] !== null) {
        if (swaggerObj[key].type !== 'object') {
          throw new Error(`Field '${fullPath}' is expected to be of type 'object' in Swagger spec but found ${typeof responseObj[key]} in response.`);
        }
        validateFields(responseObj[key], swaggerObj[key].properties, fullPath);
      }

      // If it's an array, validate each item in the array
      else if (Array.isArray(responseObj[key])) {
        if (swaggerObj[key].type !== 'array') {
          throw new Error(`Field '${fullPath}' is expected to be of type 'array' in Swagger spec but found array in response.`);
        }
        responseObj[key].forEach((item, index) => {
          validateFields(item, swaggerObj[key].items, `${fullPath}[${index}]`);
        });
      }

      // Otherwise, check if the types match
      else {
        const expectedType = swaggerObj[key].type;
        const actualType = typeof responseObj[key];

        // Swagger "integer" maps to JavaScript "number"
        if (expectedType === 'integer' && actualType === 'number') continue;

        if (actualType !== expectedType) {
          throw new Error(`Field '${fullPath}' is expected to be of type '${expectedType}' in Swagger spec but found '${actualType}' in response.`);
        }
      }
    }
  }

  // Start validation
  validateFields(response, swaggerResponseSpec.properties);
  console.log("Response fields match the Swagger spec.");
}

// Example usage

// Example Swagger response spec definition
const swaggerResponseSpec = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        zipCode: { type: "string" }
      }
    },
    friends: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" }
        }
      }
    }
  }
};

// Example response object to validate
const response = {
  name: "John Doe",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Anytown",
    zipCode: "12345"
  },
  friends: [
    { name: "Jane Doe", age: 28 },
    { name: "Mike Smith", age: 35 }
  ]
};

// Run validation
try {
  validateResponseFields(response, swaggerResponseSpec);
} catch (error) {
  console.error(error.message);
}