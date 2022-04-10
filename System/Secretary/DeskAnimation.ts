/*
** Class	: DeskAnimation
** 
** Object that handles css animations
** 
** properties
** 	-app			: app that the event got attached
**	-target			: target element
**	-method			: name of the event
**	-evtFunc		: the function that need to be called
**
*/

class DeskAnimation {
	constructor(target, animation, type, func) {
		this.target = target;
		this.animation = animation;
		this.type = type;
		this.stopped = false;
		
		// init animation
		this.target.classList.add(animation);
		if(type == 0) {
			this.func = function() {
				this.delete();
			}.bind(this);
			this.target.addEventListener("animationend", this.func);
		}
	}
	
	delete() {
		if(this.type == 0) {
			this.target.removeEventListener("animationend", this.func);
		}
		this.target=null;
		this.animation=null;
		this.func=null;
	}
}