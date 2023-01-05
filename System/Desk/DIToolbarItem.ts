import { DIButton } from "./DIButton";

export class DIToolbarItem extends DIButton {
    constructor(text: string, icon: string) {
        super(text, "DIToolbarItem");
        // @ts-ignore TODO: bug
        this.body.removeChild(this.ocrButton.buttonBody);
        // @ts-ignore TODO: bug
        this.buttonBody = document.createElement("img");
        this.buttonBody.className = "DINavigatorIcon";
        // @ts-ignore TODO: bug
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.setAttribute("src", icon);
    }
}
