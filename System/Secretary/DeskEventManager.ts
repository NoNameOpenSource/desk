/**
 * Manages event handlers for an event aware class
 */
import { DeskEvent } from "./DeskEvent";

interface DeskEventItem {
    id: string;
    deskEvent: DeskEvent;
}

export interface DeskEventInfo {
    id: string;
}

export class DeskEventManager {
    /**
     * DeskEvent array
     */
    private deskEventItems: DeskEventItem[] = [];
    private lastIndex: -1;
    private readonly notFound: "Not found";

    add(target: Element | Document | Window, method: string, evtFunc: (this: Element, ev: any) => any): DeskEventInfo {
        const newId = `${++this.lastIndex}`;
        const newItem: DeskEventItem = { id: newId, deskEvent: new DeskEvent(target, method, evtFunc, true) };
        this.deskEventItems.push(newItem);
        const info: DeskEventInfo = { id: newId };
        return info;
    }

    upsert(target: Element | Document | Window, method: string, evtFunc: (this: Element, ev: any) => any): DeskEventInfo {
        const info = this.findId(target, method, evtFunc);
        return info.id === this.notFound ? this.add(target, method, evtFunc) : info;
    }

    findIdByDeskEvent(event: DeskEvent): DeskEventInfo {
        return this.findId(event.target, event.method, event.evtFunc);
    }

    findId(target: Element | Document | Window, method: string, evtFunc: (this: Element, ev: any) => any): DeskEventInfo {
        const deskEventItem = this.deskEventItems.find(
            (x) => x.deskEvent.target === target && x.deskEvent.method === method && x.deskEvent.evtFunc === evtFunc
        );
        if (deskEventItem) {
            const info: DeskEventInfo = { id: deskEventItem.id };
            return info;
        }
        const infoNotFound: DeskEventInfo = { id: this.notFound };
        return infoNotFound;
    }

    stop(id: string) {
        this.deskEventItems.find((x) => x.id === id)?.deskEvent.stop();
    }

    stopAll() {
        for (const eventItem of this.deskEventItems) {
            eventItem.deskEvent.stop();
        }
    }

    resume(id: string) {
        this.deskEventItems.find((x) => x.id === id)?.deskEvent.resume();
    }

    resumeAll() {
        for (const eventItem of this.deskEventItems) {
            eventItem.deskEvent.resume();
        }
    }

    //fireEvent(id: string, element: Element, ev: any) {
    //this.deskEventItems.find((x) => x.id === id)?.deskEvent.evtFunc(ev);
    //}

    //    fireEvent(id: string, element: Element, ev: any) {
    //        let de = this.deskEventItems.find((x) => x.id === id);
    //        de?.deskEvent.target.bind(de?.deskEvent.evtFunc), ev);
    //    }

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
    }
}
