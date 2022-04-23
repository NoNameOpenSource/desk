export class DeskClipboard {
    dataTypes: string[];
    data: string[];
    constructor(dataType: string, data: string) {
        this.dataTypes = [];
        this.data = [];

        this.dataTypes.push(dataType);
        this.data.push(data);
    }

    addData(dataType: string, data: string) {
        this.dataTypes.push(dataType);
        this.data.push(data);
    }

    getData(dataType: string) {
        const index = this.dataTypes.indexOf(dataType);
        if (index === -1) return false;
        return this.data[index];
    }

    delete() {
        this.dataTypes = null;
        this.data = null;
    }
}
