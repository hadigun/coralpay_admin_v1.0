import { useCallback, useRef, useState } from "react"
import Keyboard, { type SimpleKeyboard } from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"

interface MobileKeyboardProps {
	onSubmit(value: string): void
}

export function MobileKeyboard({ onSubmit }: MobileKeyboardProps) {
	const keyboardRef = useRef<SimpleKeyboard>(null)

	const [input, setInput] = useState("")

	const keyboardProps = {
		theme: "hg-theme-default hg-theme-ios",
		layout: {
			default: [
				"q w e r t y u i o p {bksp}",
				"a s d f g h j k l {enter}",
				"{shift} z x c v b n m , . {shift}",
				"{alt} {smileys} {space} {downkeyboard}",
			],
			shift: [
				"Q W E R T Y U I O P {bksp}",
				"A S D F G H J K L {enter}",
				"{shiftactivated} Z X C V B N M , . {shiftactivated}",
				"{alt} {smileys} {space} {downkeyboard}",
			],
			alt: [
				"1 2 3 4 5 6 7 8 9 0 {bksp}",
				`@ # $ & * ( ) ' " {enter}`,
				"{shift} % - + = / ; : ! ? {shift}",
				"{default} {smileys} {space} {back} {downkeyboard}",
			],
			smileys: [
				"😀 😊 😅 😂 🙂 😉 😍 😛 😠 😎 {bksp}",
				`😏 😬 😭 😓 😱 😪 😬 😴 😯 {enter}`,
				"😐 😇 🤣 😘 😚 😆 😡 😥 😓 🙄 {shift}",
				"{default} {smileys} {space} {downkeyboard}",
			],
		},
		display: {
			"{alt}": "123",
			"{smileys}": "\uD83D\uDE03",
			"{shift}": "⇧",
			"{shiftactivated}": "⇧",
			"{enter}": "return",
			"{bksp}": "⌫",
			"{downkeyboard}": "🞃",
			"{space}": " ",
			"{default}": "ABC",
			"{back}": "⇦",
		},
	}

	const onValueChange = useCallback(
		(input: string) => {
			setInput(input)
		},
		[setInput]
	)

	const handleLayoutChange = useCallback(
		(button: string) => {
			if (!keyboardRef.current) return

			const currentLayout = keyboardRef.current.options.layoutName
			let layoutName

			switch (button) {
				case "{shift}":
				case "{shiftactivated}":
				case "{default}":
					layoutName = currentLayout === "default" ? "shift" : "default"
					break

				case "{alt}":
				case "{altright}":
					layoutName = currentLayout === "alt" ? "default" : "alt"
					break

				case "{smileys}":
					layoutName = currentLayout === "smileys" ? "default" : "smileys"
					break

				default:
					break
			}

			if (layoutName) {
				keyboardRef.current.setOptions({
					layoutName: layoutName,
				})
			}
		},
		[keyboardRef]
	)

	const onKeyPress = useCallback(
		(button: string) => {
			if (button.includes("{") && button.includes("}")) {
				handleLayoutChange(button)
			}

			if (button === "{enter}") {
				onSubmit(input)
			}
		},
		[handleLayoutChange, input, onSubmit]
	)

	return (
		<div>
			<div className="text-white border-2 border-white/50 rounded-lg mb-1.5 h-11 mx-1 flex px-2 items-center">
				{input}
			</div>
			<div className="simple-keyboard">
				<Keyboard
					onChange={onValueChange}
					layoutName="alt"
					onKeyPress={onKeyPress}
					keyboardRef={(ref) => {
						keyboardRef.current = ref
					}}
					{...keyboardProps}
				/>
			</div>
		</div>
	)
}
