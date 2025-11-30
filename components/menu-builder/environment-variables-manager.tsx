import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/plain-input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, XCircle } from "lucide-react"
import { useDebouncer } from "@/hooks/use-debouncer"
import type { KeyValuePair } from "@/types"

interface EnvironmentVariablesManagerProps {
	envs: Record<string, string>
	onUpdate: (envs: Record<string, string>) => void
}

interface ValidationError {
	id: string
	field: "key" | "value"
	message: string
	type: "duplicate" | "format" | "empty" | "length"
}

export const EnvironmentVariablesManager = ({
	envs,
	onUpdate,
}: EnvironmentVariablesManagerProps) => {
	// Convert envs object to KeyValuePair array for internal state management
	const [pairs, setPairs] = useState<KeyValuePair[]>(() => {
		const entries = Object.entries(envs)
		if (entries.length === 0) {
			// Start with one empty pair if no environment variables exist
			return [{ id: crypto.randomUUID(), key: "", value: "" }]
		}
		return entries.map(([key, value]) => ({
			id: crypto.randomUUID(),
			key,
			value,
		}))
	})

	const [errors, setErrors] = useState<ValidationError[]>([])

	// Debounced update function to avoid excessive calls
	const debouncedUpdate = useDebouncer(useCallback((updatedPairs: KeyValuePair[]) => {
		// Convert pairs back to envs object, filtering out empty keys
		const validPairs = updatedPairs.filter((pair) => pair.key.trim() !== "")
		const envsObject = validPairs.reduce((acc, pair) => {
			acc[pair.key] = pair.value
			return acc
		}, {} as Record<string, string>)

		onUpdate(envsObject)
	}, [onUpdate]), 500)

	// Validation function
	const validatePairs = useCallback((currentPairs: KeyValuePair[]): ValidationError[] => {
		const validationErrors: ValidationError[] = []
		const seenKeys = new Set<string>()

		currentPairs.forEach((pair) => {
			// Validate key is not empty (only for pairs that have been touched)
			if (pair.key.trim() === "" && pair.value.trim() !== "") {
				validationErrors.push({
					id: pair.id,
					field: "key",
					message: "Key cannot be empty",
					type: "empty",
				})
			}

			// Validate key length
			if (pair.key.length > 100) {
				validationErrors.push({
					id: pair.id,
					field: "key",
					message: "Key must be 100 characters or less",
					type: "length",
				})
			}

			// Validate value length
			if (pair.value.length > 1000) {
				validationErrors.push({
					id: pair.id,
					field: "value",
					message: "Value must be 1000 characters or less",
					type: "length",
				})
			}

			// Validate key format (alphanumeric and underscores only)
			if (pair.key && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pair.key)) {
				validationErrors.push({
					id: pair.id,
					field: "key",
					message:
						"Key must start with a letter or underscore and contain only letters, numbers, and underscores",
					type: "format",
				})
			}

			// Check for duplicate keys
			if (pair.key && seenKeys.has(pair.key)) {
				validationErrors.push({
					id: pair.id,
					field: "key",
					message: "Key must be unique",
					type: "duplicate",
				})
			} else if (pair.key) {
				seenKeys.add(pair.key)
			}
		})

		return validationErrors
	}, [])

	// Update validation errors when pairs change
	useEffect(() => {
		const validationErrors = validatePairs(pairs)
		setErrors(validationErrors)
	}, [pairs, validatePairs])

	// Trigger debounced update when pairs change and there are no validation errors
	useEffect(() => {
		if (errors.length === 0) {
			debouncedUpdate(pairs)
		}
	}, [pairs, errors, debouncedUpdate])

	const handleAdd = useCallback(() => {
		const newPair: KeyValuePair = {
			id: crypto.randomUUID(),
			key: "",
			value: "",
		}
		setPairs((prev) => [...prev, newPair])
	}, [])

	const handleRemove = useCallback((id: string) => {
		setPairs((prev) => {
			const filtered = prev.filter((pair) => pair.id !== id)
			// Ensure at least one pair remains
			return filtered.length === 0 ? [{ id: crypto.randomUUID(), key: "", value: "" }] : filtered
		})
		// Remove any errors for the removed pair
		setErrors((prev) => prev.filter((error) => error.id !== id))
	}, [])

	const handleUpdate = useCallback((id: string, field: "key" | "value", value: string) => {
		setPairs((prev) => prev.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair)))
		// Clear errors for this field when user starts typing
		setErrors((prev) => prev.filter((error) => !(error.id === id && error.field === field)))
	}, [])

	// Get error for a specific pair and field
	const getError = useCallback(
		(id: string, field: "key" | "value") => {
			return errors.find((error) => error.id === id && error.field === field)
		},
		[errors]
	)

	// Check if there are any validation errors
	const hasErrors = errors.length > 0
	const criticalErrors = errors.filter(
		(error) => error.type === "duplicate" || error.type === "format"
	)
	const hasCriticalErrors = criticalErrors.length > 0

	return (
		<div className="flex flex-col gap-y-4" role="form" aria-labelledby="env-vars-form-title">
			<div className="flex items-center justify-between">
				<span id="env-vars-form-title" className="font-medium text-sm">
					Environment Variables:
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAdd}
					className="h-8 px-2"
					disabled={hasCriticalErrors}
					aria-label="Add new environment variable"
					aria-describedby={hasCriticalErrors ? "add-disabled-reason" : undefined}
				>
					<Plus className="h-4 w-4 mr-1" aria-hidden="true" />
					Add
				</Button>
			</div>

			{hasCriticalErrors && (
				<div id="add-disabled-reason" className="sr-only">
					Adding new variables is disabled because there are validation errors that need to be fixed
					first.
				</div>
			)}

			{hasErrors && (
				<Alert
					variant="destructive"
					className="border-destructive/50 bg-destructive/10"
					role="alert"
					aria-live="polite"
				>
					<XCircle className="h-4 w-4" aria-hidden="true" />
					<AlertDescription>
						{hasCriticalErrors
							? "Please fix the validation errors below. Adding new variables is disabled until errors are resolved."
							: "Please review the validation warnings below."}
					</AlertDescription>
				</Alert>
			)}

			<div className="space-y-3" role="group" aria-label="Environment variable pairs">
				{pairs.map((pair, index) => {
					const keyError = getError(pair.id, "key")
					const valueError = getError(pair.id, "value")
					const keyErrorId = keyError ? `key-error-${pair.id}` : undefined
					const valueErrorId = valueError ? `value-error-${pair.id}` : undefined

					return (
						<div
							key={pair.id}
							className="space-y-2"
							role="group"
							aria-label={`Environment variable ${index + 1}`}
						>
							<div className="flex  gap-2">
								<div className="flex-1">
									<label htmlFor={`key-${pair.id}`} className="sr-only">
										Variable name for environment variable {index + 1}
									</label>
									<Input
										id={`key-${pair.id}`}
										value={pair.key}
										onChange={(e) => handleUpdate(pair.id, "key", e.target.value)}
										placeholder="Variable name (e.g., API_URL)"
										className={`focus-visible:border-0 focus-visible:ring-2 ${
											keyError
												? keyError.type === "duplicate" || keyError.type === "format"
													? "border-destructive focus-visible:ring-destructive"
													: "border-yellow-500 focus-visible:ring-yellow-500"
												: ""
										}`}
										maxLength={100}
										aria-invalid={keyError ? "true" : "false"}
										aria-describedby={keyErrorId}
									/>
									{keyError && (
										<p
											id={keyErrorId}
											className={`text-xs mt-1 ${
												keyError.type === "duplicate" || keyError.type === "format"
													? "text-destructive"
													: "text-yellow-600"
											}`}
											role="alert"
											aria-live="polite"
										>
											{keyError.message}
										</p>
									)}
								</div>
								<div className="flex-1">
									<label htmlFor={`value-${pair.id}`} className="sr-only">
										Value for environment variable {index + 1}
									</label>
									<Input
										id={`value-${pair.id}`}
										value={pair.value}
										onChange={(e) => handleUpdate(pair.id, "value", e.target.value)}
										placeholder="Value"
										className={`focus-visible:border-0 focus-visible:ring-2 ${
											valueError
												? valueError.type === "length"
													? "border-yellow-500 focus-visible:ring-yellow-500"
													: "border-destructive focus-visible:ring-destructive"
												: ""
										}`}
										maxLength={1000}
										aria-invalid={valueError ? "true" : "false"}
										aria-describedby={valueErrorId}
									/>
									{valueError && (
										<p
											id={valueErrorId}
											className={`text-xs mt-1 ${
												valueError.type === "length" ? "text-yellow-600" : "text-destructive"
											}`}
											role="alert"
											aria-live="polite"
										>
											{valueError.message}
										</p>
									)}
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => handleRemove(pair.id)}
									className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
									disabled={pairs.length === 1}
									aria-label={`Remove environment variable ${index + 1}${
										pair.key ? ` (${pair.key})` : ""
									}`}
									aria-describedby={pairs.length === 1 ? "remove-disabled-reason" : undefined}
								>
									<Trash2 className="h-4 w-4" aria-hidden="true" />
								</Button>
							</div>
						</div>
					)
				})}
			</div>

			{pairs.length === 1 && (
				<div id="remove-disabled-reason" className="sr-only">
					Cannot remove the last environment variable. At least one variable row must remain.
				</div>
			)}
		</div>
	)
}
