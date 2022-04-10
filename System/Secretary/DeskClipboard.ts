export class DeskClipboard {
    dataTypes: string[];
    data: any[];
    constructor(dataType: string, data: any) {
        this.dataTypes = new Array();
        this.data = new Array();

        this.dataTypes.push(dataType);
        this.data.push(data);
    }

    addData(dataType: string, data: any) {
        this.dataTypes.push(dataType);
        this.data.push(data);
    }

    getData(dataType: string) {
        var index = this.dataTypes.indexOf(dataType);
        if (index == -1) return false;
        return this.data[index];
    }

    delete() {
        this.dataTypes = null;
        this.data = null;
    }
}
