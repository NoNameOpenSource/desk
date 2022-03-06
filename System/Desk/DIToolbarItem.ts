import { DIButton } from "./DIButton";

export class DIToolbarItem extends DIButton {
	/**
	 * @todo remove className
	 */
	constructor(text: string, icon: string, className?: string) {
		super(text, "DIToolboaItem");
		// @ts-ignore TODO: bug
		this.body.removeChild(this.ocrButton.buttonBody);
		// @ts-ignore TODO: bug
		this.buttonBody = document.createElement('img');
		this.buttonBody.className='DINavigatorIcon';
		// @ts-ignore TODO: bug
		this.setAttribute('src', icon);
	}
}
