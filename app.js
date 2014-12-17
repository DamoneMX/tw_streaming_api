var Twitter    = require('twat');
var prompt 	   = require('prompt');
var timeWindow = require('./window');
var tweetProcessor = require('./tweetProcessor');

var client = new Twitter({
	consumer_key: '8AqQCy7umStCyNN356v7fw',
	consumer_secret: 'vOvKV1QwuS1AeKPMIvJqErBxW7i1N12OL4UY2tNMs0c',
	access_token: '29463499-9Og6hxW4HqFxcQyIrAdmLpbAnrwIk290ghOE0ez5f',
	access_token_secret: 'elXVYeeJRFmFFit3PiVTmI9eU0IvHqqD7H4yeEmClJ8c'
});

var window_length;
var round_mode = false;

prompt.start();

prompt.get(['Window Length'], function (err, result) {
	if (err) { 
		console.log(err);
    	return true;
	}
    
    window_length = result["Window Length"];
    console.log("Setting Window Length to: " + window_length);
    
    timeWindow.init(window_length, new Date(), round_mode);
	console.log(timeWindow.toString());

	client.stream('statuses/sample', function(stream) {

		stream.on('tweet', function(tweet) {
			tweetProcessor.processTweet(tweet, timeWindow);

		    if(tweet.retweeted_status) {
		    	var retweet = tweet.retweeted_status;
		    	tweetProcessor.processTweet(retweet, timeWindow, true, tweet.created_at);
		    }
		});

		stream.on('error', function(type, info) {
			console.log("Error on API call");
			console.log(type + " " + info);
			process.exit();
		});

		stream.on('destroy', function(response) {
		});

		var diff;
		if(round_mode === true) {
			var currDate = new Date();
			var endDate  = new Date(currDate);
			endDate.setSeconds(60);
			endDate.setMilliseconds(999);
			var diff = Math.abs(endDate - currDate);
		} else {
			diff = 1000;
		}

		console.log((diff / 1000) + " seconds until first result set.\n");

		setTimeout(function(){	
			resetResults();
			setInterval(resetResults, 60000);
		}, diff);

	});

	var resetResults = function(){
		timeWindow.addMinute();
		var outputArray = tweetProcessor.reset(timeWindow);
		console.log("Top Tweets:  ");
		for(var i = 0; i < outputArray.length; i++) {
			console.log("\nNumber of Retweets: " + outputArray[i].timestamps.length);
			console.log("Tweet: " + outputArray[i].text);
		}

		console.log("\nNew Time Window Range:");
		console.log(timeWindow.toString());
	}

});