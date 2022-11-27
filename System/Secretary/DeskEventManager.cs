/**
 * Manages event handlers for an event aware class
 */
import { DeskEvent } from ".";

export class DeskEventManager {
    /**
     * DeskEvent array
     */
      private DeskEventItem[] deskEventItems;
      private int lastIndex = -1;

    constructor() {
        this.deskEventItems = new DeskEventItem[];
    }

    add(target: Element | Document | Window, method: string, evtFunc: (this: Element, ev: any) => any) => number {
        let deskEvent = this.deskEventItems.find(x =>
            x.deskEvent.target === target &&
            x.deskEvent.method === method &&
            x.deskEvent.evtFunc === evtFunc);
        if (deskEvent) {
            return deskEvent.id;
        }
        this.deskEventItems.push(new DeskEventItem(++lastIndex, new DeskEvent(target, method, evtFunc, true)))
        return lastIndex;
    }

    stop(id: number){
        this.deskEventItems.find(x => x.id === id)?deskEvent.stop();
    }

    resume(id: number){
        this.deskEventItems.find(x => x.id === id)?deskEvent.resume();
    }

    delete(id: number) {
        let index = this.deskEventItems.findIndex(x => x.id === id);
        if (0 <= index) {
            this.deskEventItems[index].delete();
            this.deskEventItems.splice(index, 1);
        }
    }

    deleteAll() {
        foreach(let item in this.deskEventItems)
        {
            item.deskEvent.delete();
            delete item;
        }
        this.deskEventItems.length = 0;
        lastIndex = -1;
    }
}

private class DeskEventItem {
    id: number;
    deskEvent: DeskEvent;
}
  