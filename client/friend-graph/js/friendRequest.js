Template.header.onRendered(function(event) {
    Session.set('showFriendPage', false);
    $(document).mouseup(function (e){
        if (!$("#friendRequests").is(e.target) // if the target of the click isn't the container...
            && $("#friendRequests").has(e.target).length === 0) // ... nor a descendant of the container
        {
            // $("#friendRequests").hide();
            Session.set("showFriendPage", false);
        }
    });
});

Template.header.helpers({
    showFriendPage: function(){
        return Session.get("showFriendPage");
    },
});

Template.friendRequestPage.events({
    'click [data-action=accept]': function() {
        this.accept();
    },
    'click [data-action=deny]': function() {
        var result = confirm("Are you sure you don't want to be friends?");
        if (result) {
            this.deny();
        }
    },
    'click [data-action=unfriend]': function() { // user object methods

        var result = confirm("Are you sure you want to end your friendship?"); //assumes context is a instance of a user
        if (result){
            this.unfriend();
        }
    },
})

Template.friendRequestPage.helpers({
    friendRequests: function() {
        var results =  Meteor.requests.find({
            $or: [
                {userId:Meteor.userId()},
                {requesterId:Meteor.userId()}
            ]
        });
        return results;
    },
    isOutgoing: function(requesterId){
        var userId = Meteor.userId();
        if (requesterId == userId){
            return true;
        } else {
            return false;
        }
    }
});
