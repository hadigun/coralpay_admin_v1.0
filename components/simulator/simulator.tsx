import { cn } from "@/lib/utils"
import type { SimulatorConfig } from "@/types"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { MobileKeyboard } from "@/components/simulator/mobile-keyboard"
import IphoneFrame from "@/assets/images/iphone-frame.png"
import axios from "axios"
import Image from "next/image"

export function StatusBar() {
	return (
		<div className="bg-black text-white text-xs flex justify-between items-center px-6 py-2 rounded-t-[2.5rem]">
			<span>9:41</span>
			<div className="flex items-center space-x-1">
				<div className="w-4 h-2 border border-white rounded-sm">
					<div className="bg-white h-full w-3/4 rounded-sm"></div>
				</div>
			</div>
		</div>
	)
}

export function TextRenderer(
	{ text, variant = "default" }: { text: string; variant?: "mini" | "default" } = {
		text: "",
		variant: "default",
	}
) {
	return (
		<div
			className={cn(
				"text-center",
				variant === "mini" ? "text-xs text-[#222222] text-left" : "text-lg p-3"
			)}
		>
			{text.split("\n").map((line, index) => (
				<div key={index} className={cn(variant === "mini" ? "min-h-4" : "min-h-6")}>
					{line}
				</div>
			))}
		</div>
	)
}

interface SimulatorProps {
	config: SimulatorConfig
}

interface InteractResponse {
	content: string
	command: string
	msisdn: string
	serviceCode: string
	src: string
}

async function interact(input: string, start: boolean = false) {
	try {
		const result = await axios.post<InteractResponse>(
			"http://localhost:3000/api/v1/menu-interaction/demo",
			{
				command: start === true ? "Begin" : "Continue",
				content: input,
				msisdn: "908080800000900",
				src: "mtn",
				serviceCode: "string",
			}
		)
		return result.data
	} catch (error) {
		throw error
	}
}

export function Simulator({ config }: SimulatorProps) {

	const screenText = `\
	Select a menu option

	1) Balances
	2) Buy
	3) Buy Data
	4) Insurance
	5) Just 4 You
	6) Play/Shake Every Day
	7) Promotions
	8) Airtime Transfer
	9) Services
	10) Fun and Rewards
	`
	const [isLoading, setIsLoading] = useState(false)

	const [displayContent, setDisplayContent] = useState<string | null>(null)

	async function handleInteract(input: string, start: boolean = false) {
		setIsLoading(true)
		const result = await interact(input, start)
		setIsLoading(false)
		setDisplayContent(result.content)
	}

	// useEffect(() => {
	// 	handleInteract("*302#", true)
	// }, [])

	return (
		<div className="flex items-center justify-center h-full max-w-full p-4 relative flex-1">
			<div className="relative aspect-[73/150] flex-1 p-0.5">
				<Image
					src={IphoneFrame}
					alt="iPhone Frame"
					layout="fill"
					objectFit="contain"
					className="absolute top-0 left-0 w-full h-full pointer-events-none"
				/>
				<div className="bg-[rgb(89,89,89)] h-full flex flex-col rounded-[15%] shadow-3xl p-3">
					<div className="flex-1 grid place-items-center text-white">
						{/* {isLoading || !displayContent ? (
							<Loader2 className="animate-spin h-8 w-8 text-muted/80" />
						) : (
							<TextRenderer text={displayContent} />
						)} */}
						<TextRenderer text={screenText} />
					</div>
					{!isLoading && (
						<div className="simple-keyboard">
							<MobileKeyboard
								onSubmit={async (v) => {
									await handleInteract(v)
								}}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
