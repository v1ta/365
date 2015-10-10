Meteor.subscribe("users");
Meteor.subscribe("avatars");
Meteor.subscribe("outgoingFriendRequests");
Meteor.subscribe('ignoredFriendRequests');

// Website has loaded
window.onload = function(event){
    //close dropdowns on outside click
    $(document).mouseup(function (event){
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
    
    // Set countdown timer
    Meteor.setInterval(setTime, 1000);
}

Template.myFeed.helpers({
    thoughts: function () {
        // Show all thoughts
        var thoughts = Thoughts.find({userId:Meteor.userId()}, {sort: {createdAt: -1}});
        // console.log(thoughts.fetch());
        // console.log(Meteor.user().username);
        return thoughts
    }
});

Template.worldFeed.helpers({
    worldPosts: function () {
        // Show all thoughts
        var thoughts = Thoughts.find({userId:{$ne: Meteor.userId()}}, {sort: {createdAt: -1}});
        // var thoughts = Thoughts.find({userId:Meteor.userId()}, {sort: {createdAt: -1}});
        console.log(thoughts.fetch());
        // console.log(Meteor.user().username);
        return thoughts
    }
});

Template.worldFeed.events({
    "click .addToCollection": function(){
        Meteor.call("addToMyCollection", this._id);
    }
});

Template.thought.events({
    "click .delete": function (event) {
        Meteor.call("deleteThought", this._id);
    },
    "click .toggle-private": function (event) {
        Meteor.call("setPrivate", this._id, ! this.private);
    },
});

Template.thought.helpers({
    isuserId: function (event) {
        return this.userId === Meteor.userId();
    }
});

//put in username
Template.mainPage.helpers({
    username: function(event){
        if (Meteor.user()) {
            var username = Meteor.user().username;
            return username.split(" ")[0];
        }
    },
    posts: function(event){
        var thoughts = Thoughts.find({}, {sort: {createdAt: -1}});
        console.log(thoughts.fetch());
        console.log(Meteor.user().username);
        console.log("zooddady");
        return thoughts
    }
    
});

Template.mainPage.onRendered(function(){
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
Template.mainPage.events({
    "submit .new-thought": function (event) {
        console.log("here");
        event.preventDefault();
        // This function is called when the new thought form is submitted
        var text = $("#newThoughtBox").val();
        console.log(text);

        var thoughtId = Meteor.call("addThought", text, null,
        function(err, data) {
            if (err){
                console.log(err);
            } 
            console.log(data)
            var thought = Thoughts.findOne({_id:data});
            console.log(thought);
            // Add a new bubble
            var thoughtsList = Session.get('centerfeed');
            thoughtsList.push(thought);
            Session.set('centerfeed', thoughtsList);
            addThoughtsToStage([thought], 'center');
        });

        // Clear form
        $("#newThoughtBox").val("");

        // Prevent default form submit

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
                console.log(data);



                // var thoughtId = Meteor.call("addPost", posts[0],function(err, data) {
                //     if (err){
                //         console.log(err);
                //     }
                //     console.log(data)
                // });
                // getLocationThought(thoughtId)
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
    }

});

// Accounts
//
Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
    requestPermissions: {
        facebook: ['email', 'user_friends', 'user_location', 'user_status',
            'user_posts']
    }
});

// Helper Functions
//
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


//set time in header
function setTime(){
    var actualTime = new Date(Date.now());
    var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);
    var totalSec = Math.floor((endOfDay.getTime() - actualTime.getTime())/1000);
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    $("#time").text(result);
}



