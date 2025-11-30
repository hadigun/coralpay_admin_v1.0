/**
 * Simple test component to verify SmartInput functionality
 */

"use client"

import React, { useState } from "react"
import { SmartInput, SmartInputEnhanced, SmartTextarea } from "./index"

const testVariables = {
	API_KEY: "your-api-key-here",
	DATABASE_URL: "postgresql://localhost:5432/mydb",
	PORT: "3000",
	NODE_ENV: "development",
}

export const SmartInputTest: React.FC = () => {
	const [value1, setValue1] = useState("Hello {{API_KEY}} world!")
	const [value2, setValue2] = useState("Connect to {{DATABASE_URL}} on port {{PORT}}")
	const [textareaValue, setTextareaValue] = useState(
		"Multi-line text with {{API_KEY}}\nSecond line with {{DATABASE_URL}}\nThird line with {{PORT}}"
	)

	return (
		<div className="p-6 space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-2">Original SmartInput</h3>
				<SmartInput
					value={value1}
					onChange={(e) => setValue1(e.target.value)}
					variables={testVariables}
					placeholder="Type {{ to see suggestions..."
					className="w-full p-2 border rounded"
				/>
				<p className="text-sm text-gray-600 mt-1">Value: {value1}</p>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-2">
					Test Cursor Positioning (Fixed Overlay Alignment)
				</h3>
				<SmartInput
					value="{{API_KEY}} test {{DATABASE_URL}} more text {{PORT}} end"
					onChange={() => {}}
					variables={testVariables}
					placeholder="Test cursor positioning..."
					className="w-full border rounded"
				/>
				<p className="text-sm text-gray-600 mt-1">
					Try clicking at the very end after "end" or using arrow keys to move the cursor.
				</p>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-2">Enhanced SmartInput with Error Handling</h3>
				<SmartInputEnhanced
					value={value2}
					onChange={(e) => setValue2(e.target.value)}
					variables={testVariables}
					placeholder="Type {{ to see suggestions..."
					className="w-full p-2 border rounded"
					errorConfig={{
						enableLogging: true,
						enableRecovery: true,
						maxRecoveryAttempts: 3,
						fallbackValue: "",
					}}
				/>
				<p className="text-sm text-gray-600 mt-1">Value: {value2}</p>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-2">Test Cursor Positioning (Fixed Styling)</h3>
				<SmartInput
					value="{{API_KEY}} test {{DATABASE_URL}} more text {{PORT}}"
					onChange={() => {}}
					variables={testVariables}
					placeholder="Test cursor positioning with variables..."
					className="w-full p-2 border rounded"
				/>
				<p className="text-sm text-gray-600 mt-1">
					This input tests cursor positioning with variables styled using only colors (no
					bold/italic/padding).
				</p>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-2">SmartTextarea Test</h3>
				<SmartTextarea
					value={textareaValue}
					onChange={(e) => setTextareaValue(e.target.value)}
					variables={testVariables}
					placeholder="Type {{ to see suggestions in textarea..."
					rows={4}
					className="w-full p-2 border rounded"
				/>
				<p className="text-sm text-gray-600 mt-1">Value: {textareaValue}</p>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-2">Test Error Scenarios</h3>
				<SmartInputEnhanced
					value="{{INVALID_VAR}} and {{NESTED{{BRACES}}}}"
					onChange={() => {}}
					variables={testVariables}
					placeholder="This shows error handling..."
					className="w-full p-2 border rounded"
					errorConfig={{
						enableLogging: true,
						enableRecovery: true,
						maxRecoveryAttempts: 3,
						fallbackValue: "",
					}}
				/>
				<p className="text-sm text-gray-600 mt-1">
					This input contains invalid variables and nested braces to test error handling.
				</p>
			</div>
		</div>
	)
}

export default SmartInputTest
