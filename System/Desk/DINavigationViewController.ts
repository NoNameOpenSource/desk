import { Application } from "../Secretary";
import { DeskEvent } from "../Secretary/DeskEvent";
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
        this.backwardButton.events.push(new DeskEvent(this.backwardButton.body, "onclick", () => this.backButtonTriggered()));
        this.navigationView.addChildView(this.titleField);
        if (delegate) this.delegate = delegate;
    }

    backButtonTriggered() {
        if (this.delegate) {
            this.delegate.backButtonTriggered();
        }
    }

    /**
     * @todo remove parameters or use them
     */
    setCurrentView(view: any, _titleString: string, _saveOld?: boolean) {
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
        const tmp = new DeskEvent(
            newView.body,
            "animationend",
            () => {
                tmp.delete();
                newView.body.className = originalName;
                newView.wakeUp();
                func();
            }
        );
    }
}
