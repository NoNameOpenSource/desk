import { DIView } from "./DIView";

export class DIToolbar extends DIView {
    delegate: string;
    items: any[];

    constructor(delegate?: any, className?: string) {
        super(className);

        this.delegate = delegate;

        this.items = [];
        this.width = 0;
    }

    addItem(item: any) {
        item.x = this.width;
        this.width += item.width;
        let identifier = item.identifier;
        item.setButtonEvent(() => {
            this.itemSelected(identifier);
        });
        this.addChildView(item);
        this.items.push(item);
    }

    itemSelected(identifier: any) {
        if (!this.delegate) return;
        // @ts-ignore
        this.delegate.toolBarSelected(identifier);
    }
}
