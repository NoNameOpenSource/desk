class DICanvas extends DIView{
	constructor(className, idName, context) {
		if(!className)
			className='DICanvas';
		super(className, idName);
		//this.canHaveChild = false;
		this.canvas = document.createElement('CANVAS');
		this.body.appendChild(this.canvas);
		if(context)
			this.ctx = this.canvas.getContext(context);
		else
			this.ctx = this.canvas.getContext('2d');
	}

	delete() {
		this.ctx = null;
		this.canvas.remove();
		super.delete();
	}
}