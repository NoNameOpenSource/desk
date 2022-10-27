import { DrawerListViewCell } from "./DrawerListViewCell";
import { DrawerProgressPie } from "./DrawerProgressPie";
export class DrawerUploadViewCell extends DrawerListViewCell {
    progressPie: DrawerProgressPie;
    constructor () {
        super();
        this.body.removeChild(this.name.body);
        this.progressPie = new DrawerProgressPie();
        this.addChildView(this.progressPie);
        this.body.append(this.name.body);
        this.icon.hidden = true;
    }
}
