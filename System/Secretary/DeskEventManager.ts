/**
 * Manages event handlers for an event aware class
 */
import { DeskEvent } from "./DeskEvent";

class DeskEventItem {
    id: number;
    deskEvent: DeskEvent;
    constructor(id: number, deskEvent: DeskEvent) {
        this.id = id;
        this.deskEvent = deskEvent;
    }
}

class DeskEventInfo {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class DeskEventManager {
    /**
     * DeskEvent array
     */
    private deskEventItems: DeskEventItem[] = [];
    private lastIndex: -1;

    add(target: Element | Document | Window, method: string, evtFunc: (this: Element, ev: any) => any): DeskEventInfo {
        const deskEvent = this.deskEventItems.find(
            (x) => x.deskEvent.target === target && x.deskEvent.method === method && x.deskEvent.evtFunc === evtFunc
        );
        if (deskEvent) {
            return new DeskEventInfo(deskEvent.id);
        }
        this.deskEventItems.push(new DeskEventItem(++this.lastIndex, new DeskEvent(target, method, evtFunc, true)));
        return new DeskEventInfo(this.lastIndex);
    }

    stop(id: number) {
        this.deskEventItems.find((x) => x.id === id)?.deskEvent.stop();
    }

    resume(id: number) {
        this.deskEventItems.find((x) => x.id === id)?.deskEvent.resume();
    }

    delete(id: number) {
        const index = this.deskEventItems.findIndex((x) => x.id === id);
        if (0 <= index) {
            this.deskEventItems[index].deskEvent.delete();
            this.deskEventItems.splice(index, 1);
        }
    }

    deleteAll() {
        for (const item of this.deskEventItems) {
            item.deskEvent.delete();
        }
        this.deskEventItems.length = 0;
        this.lastIndex = -1;
    }
}
