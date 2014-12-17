var BinaryHeap = require('binaryheap');
var heap = new BinaryHeap();

var tweetProcessor = {
	tweets : {},
	topTen: {},
	minimalCount: Number.MAX_VALUE,
	processTweet: processTweet,
	reset: function(timeWindow){
		var outputArray = new Array();
		for(var i in this.topTen) {
			var record = this.topTen[i];
			heap.insert(record, record.rt_count);
		}

		while (heap.length > 0) {
			var element = heap.pop();
			var tweet = {
				text: element.text,
				rt_count: element.rt_count,
				timestamps: element.timestamps
			}; 
			outputArray.push(tweet);
		}

		this.topTweets = new Array();
		resetTweets(this.tweets, timeWindow);
		heap = new BinaryHeap();

		return outputArray;
	}
};

function processTweet(tweet, timeWindow, retweet, retweetTime){
	var timestamp = new Date(tweet.created_at);

	if(!this.tweets[tweet.id_str]) {
		this.tweets[tweet.id_str] = {
			id : tweet.id,
			text: tweet.text,
			timestamps: new Array(),
			futureTimestamps: new Array(),
			rt_count: 0
		};
	} 

	if(retweet == true) {
		var retweetTime = new Date(retweetTime);
		if(retweetTime >= timeWindow.start) {
			if(retweetTime <= timeWindow.end) {
				this.tweets[tweet.id_str]["timestamps"].push(retweetTime.getTime());
				this.tweets[tweet.id_str]["rt_count"] = this.tweets[tweet.id_str]["timestamps"].length;
			} else {
				this.tweets[tweet.id_str]["futureTimestamps"].push(retweetTime.getTime());
			}
		}
	}

	var reference = this.tweets[tweet.id_str];
	addToTopTen(reference);
};

function resetTweets(tweets, timeWindow){
	for(var i in tweets) {
		var tweet = tweets[i];
		var timestamps = tweet.timestamps;

		for(var j = 0; j < timestamps.length; j++) {
			var storedTimestamp= timestamps[j];
			if(storedTimestamp < timeWindow.start.getTime()) {
				timestamps.splice(j, 1);
				j--;
			}
		}

		var futureTs = tweet.futureTimestamps;

		for(var k = 0; k < futureTs.length; k++) {
			var storedTimestamp= futureTs[k];
			if(storedTimestamp < timeWindow.end.getTime()) {
				var storedStamp = futureTs.splice(k, 1);
				tweet.timestamps.push(storedStamp);
				k--;
			}
		}

		tweet.rt_count = tweet.timestamps.length;
		tweets[i] = tweet;
		addToTopTen(tweet);
	}
	
};

function addToTopTen(record){
	//Added line to deal with bug, probably related to asynchronous behavior
	record.rt_count = record.timestamps.length;

	if(record.rt_count < 1)
		return;

	var topTweets = tweetProcessor.topTen;

	if(Object.keys(topTweets).length < 10) {
		topTweets[record.id] = record;

		for(var i in topTweets) {
			tweetProcessor.minimalCount = Math.min(tweetProcessor.minimalCount, record.rt_count);
		}

	} else if(record.rt_count > tweetProcessor.minimalCount){
		if(topTweets[record.id]) {
			topTweets[record.id].rt_count++;
		} else { //look for tweet with minimal rt_count and erase it
			var stored_minimum;

			for(var i in topTweets) {
				if(!stored_minimum) {
					stored_minimum = i;
				} else {
					if(topTweets[i].rt_count < topTweets[stored_minimum].rt_count) {
						stored_minimum = i;
					}
				}
			}

			delete topTweets[stored_minimum]

			topTweets[record.id] = record;
			for(var i in topTweets) {
				tweetProcessor.minimalCount = Math.min(tweetProcessor.minimalCount, record.rt_count);
			}
		}
	}

};

module.exports = tweetProcessor;