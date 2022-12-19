/**
 * Manages event handlers for an event aware class
 */
import { DeskEvent } from "./DeskEvent";

interface DeskEventItem {
    id: string;
    deskEvent: DeskEvent;
}

class DeskEventInfo {
    id: string;
    constructor(id: string) {
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
        const newId = `${++this.lastIndex}`;
        const newItem: DeskEventItem = { id: newId, deskEvent: new DeskEvent(target, method, evtFunc, true) };
        this.deskEventItems.push(newItem);
        return new DeskEventInfo(newId);
    }

    stop(id: string) {
        this.deskEventItems.find((x) => x.id === id)?.deskEvent.stop();
    }

    resume(id: string) {
        this.deskEventItems.find((x) => x.id === id)?.deskEvent.resume();
    }

    delete(id: string) {
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
