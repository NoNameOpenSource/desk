export class DITableColumn {
    name: any;
    width: any;
    minWidth: any;
    isEditable: any;

    constructor(name: string, width: number, minWidth: number, isEditable: boolean) {
        this.name = name;
        this.width = width;
        this.minWidth = minWidth;
        this.isEditable = isEditable;
    }
}
