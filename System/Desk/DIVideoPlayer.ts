import { DIView } from "./DIView";

export class DIVideoPlayer extends DIView {
	videoBody: HTMLVideoElement;
	autoplay: boolean;
	_src: any;
	sourceBody: any;
	_ratio: any;
	_opRatio: any;

	constructor(video: any, autoplay: any, className?: string, idName?: string) {
		if(!className)
			className='DIVideoPlayer';
		super(className, idName);
		this.canHaveChild = false;
		this.videoBody = <HTMLVideoElement>document.createElement('VIDEO');
		if(video)
			this.videoSource = video;
		if(autoplay) {
			this.videoBody.setAttribute("autoplay", "");
			this.autoplay = true;
		}
		this.body.appendChild(this.videoBody);
	}
	
	play() {
		this.videoBody.play();
	}
	
	pause() {
		this.videoBody.pause();
	}
	
	get playing() {
		return !this.videoBody.paused;
	}
	
	get width() {
		return this._width;
	}
	
	set width(value) {
		super.width = value;
		this.videoBody.width = this._width;
	}
	
	get height() {
		return this._height;
	}
	
	set height(value) {
		super.height = value;
		this.videoBody.height = this._height;
	}
	
	get videoSource() {
		return this._src;
	}
	
	set videoSource(value) {
		this._src = value;
		if(!this.sourceBody) {
			// this currently suporting mp4 only
			this.sourceBody = document.createElement('SOURCE');
			this.sourceBody.setAttribute("type", "video/mp4");
			this.videoBody.appendChild(this.sourceBody);
		}
		this.sourceBody.setAttribute("src", value);
		this._ratio = null;
		this._opRatio = null;
	}
	
	get ratio() {
		if(!this._ratio)
			this._ratio = this.videoBody.videoWidth / this.videoBody.videoHeight;
		return this._ratio;
	}
	
	get opRatio() {
		if(!this._opRatio)
			this._opRatio = this.videoBody.videoHeight / this.videoBody.videoWidth;
		return this._opRatio;
	}
}