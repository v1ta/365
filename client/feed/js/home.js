Meteor.subscribe("users");
Meteor.subscribe("avatars");
Meteor.subscribe("outgoingFriendRequests");
Meteor.subscribe('ignoredFriendRequests');
var thoughtsList = [];

window.onload = function(event){ // Website has loaded
    $(document).mouseup(function (event){ //close dropdowns on outside click
        var container = $(".dropdown-menu");
        // if the target of the click isn't the container... nor a descendant of the container
        if (!container.is(event.target) && container.has(event.target).length === 0){
            container.hide();
            $("#changePasswordForm").hide();
            $(".dropButton").show();
        }
        container = $("#main-menu");
        if (!container.is(event.target) && container.has(event.target).length === 0){
            hideMainMenu();
        }
    });
    var configuration = {"location": null};
    if (!configuration){
        getLocation()
    }
    setTime(); // Set countdown timer
    Meteor.setInterval(setTime, 1000);
}

Template.friendFeed.helpers({
    friendPosts: function() {
        var start = new Date();
        var friends = getFriends();// TODO: Make this a session variable
        var thought = [], thoughts = [];
        start.setHours(0,0,0,0);// Only find posts made after 00:00 of today
        /* return: thoughts shared by friends - thoughts you've already collected from them. */
        for (var i = 0; i < friends.length; i++) {
            thought = Thoughts.find({
                $and: [
                    {userId: friends[i].friendId,privacy: "friends"},
                    {userId:
                        {$ne: Meteor.userId()}
                    }
                ]
            }).fetch();
            for(var j = 0; j < thought.length; j += 1) {
                if (thought[j] && thought[j].collectedBy.indexOf(Meteor.userId()) === -1) {
                    thoughts.push(thought[j]);
                }
            }
        }
        return thoughts;
    },
    sharedPosts: function() {
         /* get thoughts you've shared to friends */
        var sharedThoughts = Thoughts.find({
            $and: [
                {userId: Meteor.userId()},
                {privacy: "friends"}
            ]
        }, {sort: {createdAt: -1} });
        return sharedThoughts;
    }
});

Template.myFeed.helpers({
    thoughts: function () {
        // Only find posts made after 00:00 of today
        var start = new Date();
        start.setHours(0,0,0,0);
        var thoughts = Thoughts.find({
            $or: [
                {$and: [
                    {userId: Meteor.userId()},
                    {privacy: "private"}
                ]},
                {collectedBy: Meteor.userId()}
            ]
        });
        return thoughts;
    }
});

Template.worldFeed.helpers({
    worldPosts: function () {
        // Only find posts made after 00:00 of today
        var start = new Date();
        var thought, thoughts = [];
        var friendIds = getFriends();
        start.setHours(0,0,0,0);
        if (Meteor.user().profile.lastShared.date >= start) {// Get user's last shared thought from today, if it exists
            thought = Thoughts.findOne(Meteor.user().profile.lastShared.thoughtId);
            if (thought && thought.privacy === 'public') {
                thoughts.push(thought);
            }
        }
        thoughts = thoughts.concat(Thoughts.find({
                $and: [
                    {createdAt: {$gte:start}},
                    {privacy: 'public'},
                    {$nor: [
                        {userId: Meteor.userId()},
                        {userId: {$in: friendIds}},
                        {collectedBy: Meteor.userId()}
                    ]}
                ]},
            { sort: {createdAt: -1} }).fetch());
        return thoughts;
    },
    sharedPosts: function() {
        /* get thoughts you've shared to friends */
        var sharedThoughts = Thoughts.find({
            $and: [
                {userId: Meteor.userId()},
                {privacy: "public"}
            ]
        }, {sort: {createdAt: -1} });

        return sharedThoughts;
    }
});

Template.worldFeed.events({
    "click .addToCollection": function(){
        Meteor.call("addToMyCollection", this._id);
    }
});


//put in username
Template.home.helpers({
    username: function(event){
        if (Meteor.user()) {
            var username = Meteor.user().username;
            return username.split(" ")[0];
        }
    },
    posts: function(event){
        var thoughts = Thoughts.find({}, {sort: {createdAt: -1}});
        return thoughts
    },
    showFriendFeed: function() {
        return Session.get('showFriendFeed');
    }
});

Template.home.onRendered(function(){
    Session.setDefault('showFriendFeed', true);
    Session.setDefault('centerfeed', thoughtsList)
    Session.set('showFriendFeed', true);

    $("#newThoughtBox").keypress(function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13){
            $('.new-thought').submit();
            return false;  // stop propagation of the keypress
        }
        return true;
    });
})

//request facebook data
Template.home.events({
    "submit .new-thought": function (event) {
        event.preventDefault();
        // This function is called when the new thought form is submitted
        var text = $("#newThoughtBox").val();

        var thoughtId = Meteor.call("addThought", text, null,
            function(err, data) {
                if (err){
                    console.log(err);
                }
                var thought = Thoughts.findOne({_id:data});
                thoughtsList.push(thought);
            });

        // Clear form
        $("#newThoughtBox").val("");
        return false;
    },
    'click #btn-user-data': function(event) {
        Meteor.call('getFBUserData', function(err, data) {
            console.log(JSON.stringify(data, undefined, 4));
        });
        Meteor.call('getFBPostData', function(err, data) {
            console.log(JSON.stringify(data, undefined, 4));
            console.log(data["data"]);
            //check whose post it is using
            //data[(post number)][from][name]
            //only want the one's from the user
        });
    },
    'click #btn-import-facebook': function(event){
        Meteor.call('getFBPostData', function(err, data) {
            if (err){
                console.log(err);
            }
            else{
                var posts = data["data"];
                return false;
            }
        });
    },
    'click .feed-search-icon': function(event) {
        $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
    },
    'click .friend-search-icon': function(event) {
        $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
    },
    'click .feed-user-icon, click .badge.success': function(e) {
        // $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
        e.stopPropagation();
        // $("#friendRequests").show();
        Session.set("showFriendPage", true);
    },
    'click .fa-caret-down, click .fa-caret-up': function(event) {
        $("#worldButtons").slideToggle('fast');
        $(event.target).toggleClass("fa-caret-down fa-caret-up");
    },
    'focus #newThoughtBox': function(event) {
        $(event.currentTarget).attr('rows', '4');
        $('#time-container').css('height', '109px');
    },
    'blur #newThoughtBox': function(event) {
        $(event.currentTarget).attr('rows', '1');
        $('#time-container').css('height', '65px');
    },
    'click .toggleFriendFeed': function() {
        Session.set('showFriendFeed', true);
    },
    'click .toggleWorldFeed': function() {
        Session.set('showFriendFeed', false);
    }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
    requestPermissions: {
        facebook: ['email', 'user_friends', 'user_location', 'user_status',
            'user_posts']
    }
});

function getLocation(event) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            configuration.location = position
        },showLocationError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            break;
    }
}

function setTime(){ //set time in header
    var actualTime = new Date(Date.now());
    var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);
    var totalSec = Math.floor((endOfDay.getTime() - actualTime.getTime())/1000);
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    $("#time").text(result);
}

/* from old renderFeed source file */
resetAllFeeds = function () {
    // Reset Session variables for feeds
    delete Session.keys['leftfeed'];
    delete Session.keys['centerfeed'];
    delete Session.keys['rightfeed'];
    delete Session.keys['leftqueue'];
    delete Session.keys['centerqueue'];
    delete Session.keys['rightqueue'];
}

getFriends = function() {
    return Meteor.friends.find({userId:Meteor.userId()}).fetch();
}