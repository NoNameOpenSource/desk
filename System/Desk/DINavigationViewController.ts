import { Application } from "../Secretary";
import { DeskEventManager } from "../Secretary/DeskEventManager";
import { DILabel } from "./DILabel";
import { DIView } from "./DIView";
import { DIViewController } from "./DIViewController";

export class DINavigationViewController extends DIViewController {
    navigationView: DIView;
    _currentView: DIView;
    backwardButton: DIView;
    titleField: DILabel;
    delegate: Application;
    oldView: DIView;
    eventManager: DeskEventManager;

    /**
     * @todo remove idName
     */
    constructor(className?: string, idName?: string, delegate?: any) {
        if (!className) className = "DINavigationViewController";
        super(new DIView());
        // Setting up navigation bar(view)
        this.navigationView = new DIView();
        this.view.addChildView(this.navigationView);
        this._currentView;
        this.backwardButton = new DIView();
        this.titleField = new DILabel();
        this.navigationView.addChildView(this.backwardButton);
        this.backwardButton.eventManager.add(this.backwardButton.body, "onclick", this.backButtonTriggered);
        this.navigationView.addChildView(this.titleField);
        this.eventManager = new DeskEventManager();
        if (delegate) this.delegate = delegate;
    }

    backButtonTriggered() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (this.delegate) this.delegate.backButtonTriggered();
    }

    /**
     * @todo remove parameters or use them
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCurrentView(view: any, titleString: string, saveOld?: boolean) {
        if (this._currentView) {
            this.removeCurrentView();
        }
        this._currentView = view;
    }

    removeCurrentView() {
        // Remove the current view from children list of navigation view
        this.navigationView.removeChildView(this._currentView);
    }

    setTitle(stringValue: string) {
        this.titleField.stringValue = stringValue;
    }

    pushToView(view: DIView, titleString: string, backwardString: string) {
        if (!this._currentView) return false;
        if (!backwardString) backwardString = "Back";
        const newTitleField = new DILabel();
        this.navigationView.addChildView(view);
        this.animatePushIn(this._currentView, view, this.titleField, newTitleField, () => {
            this.setCurrentView(view, titleString);
        });
    }

    animatePushIn(oldView: DIView, newView: DIView, oldTitle: DILabel, newTitle: DILabel, func: () => void) {
        this.oldView.putInSleep();
        const originalName = newView.body.className;
        newView.body.className = originalName.concat("PushIn");
        newTitle.body.className = "NavTitlePushIn";
        if (this.backwardButton.hidden) {
            // @ts-ignore
            this.backwardButton.children[1].stringValue = oldTitle.stringValue;
            oldTitle.delete();
            this.backwardButton.children[1].body.className = "NavBackPushIn";
            this.backwardButton.hidden = false;
        }
        oldTitle.body.className = "NavBackPushIn";
        // this.newView.putInSleep();
        const tmp = this.eventManager.add(newView.body, "animationend", () => {
            this.eventManager.delete(tmp.id);
            newView.body.className = originalName;
            newView.wakeUp();
            func();
        });
    }
}
