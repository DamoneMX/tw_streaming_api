var timeWindow = {
	start: new Date(),
	end  : new Date(),
	init : function(windowLength, currentTime, round_mode){
		
		this.end = currentTime;
		if(round_mode === true) { //set window end to curent time at 59 seconds
			this.end.setMilliseconds(59);
			this.end.setSeconds(59);
		}

		this.start = new Date(this.end - (windowLength * 60000));

		if(round_mode === true) {
			this.start.setMilliseconds(0);
			this.start.setSeconds(0);
		}
	}, 
	addMinute: function(){
		this.start.setTime( this.start.getTime() + 60000 );
		this.end.setTime( this.end.getTime() + 60000 );
	}, 
	toString: function(){
		var buffer = "Window start time: " + this.start.toString() + " \n";
		buffer += "Window end time: " + this.end.toString();
		return buffer;
	}
};

module.exports = timeWindow;