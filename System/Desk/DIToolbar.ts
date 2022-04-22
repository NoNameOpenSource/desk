import { DIButton } from "./DIButton";
import { DIView } from "./DIView";

export class DIToolbar extends DIView {
    delegate: string;
    items: DIButton[];

    constructor(delegate?: any, className?: string) {
        super(className);

        this.delegate = delegate;

        this.items = [];
        this.width = 0;
    }

    addItem(item: DIButton) {
        item.x = this.width;
        this.width += item.width;
        // @ts-ignore
        const identifier = item.identifier;
        item.setButtonEvent(() => {
            this.itemSelected(identifier);
        });
        this.addChildView(item);
        this.items.push(item);
    }

    itemSelected(identifier: any) {
        if (!this.delegate) return;
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.delegate.toolBarSelected(identifier);
    }
}
