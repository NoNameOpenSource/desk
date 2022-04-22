import { DIView } from "./DIView";

export class DIClassicDropDownView extends DIView {
    selectBody: HTMLSelectElement;

    constructor(className?: string, idName?: string) {
        if (!className) className = "DIClassicDropDownView";
        super(className, idName);
        this.canHaveChild = false;
        // @ts-ignore TODO: bug
        this.selectBody = document.createElement("SELECT");
        this.body.appendChild(this.selectBody);
    }

    addItem(item: string) {
        const z = document.createElement("option");
        z.setAttribute("value", item);
        const t = document.createTextNode(item);
        z.appendChild(t);
        this.selectBody.appendChild(z);
    }

    addItems() {
        // eslint-disable-next-line prefer-rest-params
        for (const argument of arguments) {
            this.addItem(<string>argument);
        }
    }

    get selectedIndex() {
        return this.selectBody.selectedIndex;
    }

    set selectedIndex(value) {
        this.selectBody.selectedIndex = value;
    }

    get stringValue() {
        return this.selectBody.value;
    }

    set stringValue(value) {
        this.selectBody.value = value;
    }
}
