/**
 * Example usage of SmartInput component
 * Demonstrates integration with form libraries and performance optimizations
 */

"use client";

import React, { useState } from "react";
import { SmartInput, SmartInputMemo } from "./smart-input";

/**
 * Example environment variables for demonstration
 */
const EXAMPLE_VARIABLES = {
  API_URL: "https://api.example.com",
  DATABASE_URL: "postgresql://localhost:5432/mydb",
  // JWT_SECRET: "your-secret-key",
  PORT: "3000",
  NODE_ENV: "development",
  REDIS_URL: "redis://localhost:6379",
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "587",
  AWS_REGION: "us-east-1",
  AWS_BUCKET: "my-s3-bucket",
};

/**
 * Basic usage example
 */
export const BasicSmartInputExample: React.FC = () => {
  const [value, setValue] = useState("Connect to {{API_URL}}/users");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic SmartInput Example</h3>
      <SmartInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        variables={EXAMPLE_VARIABLES}
        placeholder="Type {{ to see environment variable suggestions"
        className="w-full"
      />
      <div className="text-sm text-muted-foreground">
        Current value: <code className="bg-muted px-1 rounded">{value}</code>
      </div>
    </div>
  );
};

/**
 * Performance optimized example with memoization
 */
export const OptimizedSmartInputExample: React.FC = () => {
  const [value, setValue] = useState("Database: {{DATABASE_URL}}");
  const [disabled, setDisabled] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Optimized SmartInput Example</h3>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="disabled"
          checked={disabled}
          onChange={(e) => setDisabled(e.target.checked)}
        />
        <label htmlFor="disabled" className="text-sm">
          Disabled
        </label>
      </div>

      <SmartInputMemo
        value={value}
        onChange={(e) => setValue(e.target.value)}
        variables={EXAMPLE_VARIABLES}
        disabled={disabled}
        placeholder="This uses the memoized version for better performance"
        className="w-full"
        variableStyle={{
          backgroundColor: "rgb(220 252 231)", // bg-green-100
          textColor: "rgb(22 101 52)", // text-green-800
          fontWeight: "bold",
          fontStyle: "italic",
        }}
        invalidVariableStyle={{
          backgroundColor: "rgb(254 242 242)", // bg-red-50
          textColor: "rgb(220 38 38)", // text-red-600
        }}
      />

      <div className="text-sm text-muted-foreground">
        Current value: <code className="bg-muted px-1 rounded">{value}</code>
      </div>
    </div>
  );
};

/**
 * Form integration example
 */
export const FormIntegrationExample: React.FC = () => {
  const [formData, setFormData] = useState({
    apiEndpoint: "{{API_URL}}/api/v1",
    databaseConnection: "{{DATABASE_URL}}",
    jwtSecret: "{{JWT_SECRET}}",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Check console for form data");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Form Integration Example</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="apiEndpoint"
            className="block text-sm font-medium mb-1"
          >
            API Endpoint
          </label>
          <SmartInput
            id="apiEndpoint"
            name="apiEndpoint"
            value={formData.apiEndpoint}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, apiEndpoint: e.target.value }))
            }
            variables={EXAMPLE_VARIABLES}
            placeholder="Enter API endpoint URL"
            required
            className="w-full"
          />
        </div>

        <div>
          <label
            htmlFor="databaseConnection"
            className="block text-sm font-medium mb-1"
          >
            Database Connection
          </label>
          <SmartInput
            id="databaseConnection"
            name="databaseConnection"
            value={formData.databaseConnection}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                databaseConnection: e.target.value,
              }))
            }
            variables={EXAMPLE_VARIABLES}
            placeholder="Enter database connection string"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="jwtSecret" className="block text-sm font-medium mb-1">
            JWT Secret
          </label>
          <SmartInput
            id="jwtSecret"
            name="jwtSecret"
            value={formData.jwtSecret}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, jwtSecret: e.target.value }))
            }
            variables={EXAMPLE_VARIABLES}
            placeholder="Enter JWT secret"
            required
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
};

/**
 * Complete example showcasing all features
 */
export const CompleteSmartInputExample: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          SmartInput Component Examples
        </h2>
        <p className="text-muted-foreground mb-6">
          Demonstrates the SmartInput component with environment variable
          suggestions, visual formatting, and form integration.
        </p>
      </div>

      <BasicSmartInputExample />
      <OptimizedSmartInputExample />
      <FormIntegrationExample />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2">Available Environment Variables:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(EXAMPLE_VARIABLES).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <code className="font-mono text-xs">{key}</code>
              <span className="text-muted-foreground truncate ml-2">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompleteSmartInputExample;
