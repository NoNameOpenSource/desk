/*
** Class	: DeskEvent
** 
** Object that handles event
** 
** properties
** 	-app			: app that the event got attached
**	-target			: target element
**	-method			: name of the event
**	-evtFunc		: the function that need to be called
**
*/

class DeskEvent {
	constructor(target, method, evtFunc, init=true) {
		this.target = target;
		this.method = method;
		this.evtFunc = evtFunc;
		if(init)
			target.addEventListener(method, evtFunc, true);
		this.stopped = false;
	}
	
	stop() {
		if(!this.stopped) {
			this.target.removeEventListener(this.method, this.evtFunc, true);
			this.stopped = true;
		}
	}
	
	resume() {
		if(this.stopped) {
			this.target.addEventListener(this.method, this.evtFunc, true);
			this.stopped = false;
		}
	}
	
	delete() {
		this.stop();
		this.target=null;
		this.method=null;
		this.evtFunc=null;
	}
}