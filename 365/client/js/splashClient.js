Accounts.onLogin(function(){
	Router.go("mainPage");
});

Template.signupPage.events({
	'click .backButton': function(){
		$("#firstSignPage").show();
		$("#nextLoginButton").show();
		$("#secondSignPage").hide();
		$(".backButton").hide();
		$("#splashTitle").css("margin-right", "0px");
	}
});

Template.splashBanner.events({
	'click #loginLink': function(){
		Router.go("loginPage");
	},
	'click #aboutLink': function() { Router.go('about'); },
  	'click #teamLink': function() { Router.go('team'); },
  	'click #splashBannerLogo': function(){ Router.go('splash');},
  	'click #betaLink': function(){
  		betaSignup();
  	},
  	"submit form": function(){
  		event.preventDefault();
  		betaSignup();
  	}
});

Template.loginPage.events({
	'click #facebookButton': function(){
	  	Meteor.loginWithFacebook(
	  		{requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
				'user_posts']}, 
			function(err){
			    if (!err){
			      Session.set("isFB", true);
			      // $("#changePassword").hide();
			    }
			    else{
			      console.log(err);
			    }
			}
		)
	},
	'submit form': function(){
		event.preventDefault();
		var emailVar = event.target.email.value;
		var passwordVar = event.target.password.value;
		Meteor.loginWithPassword(emailVar, passwordVar, function(err){
			if (!err){
				Session.set("isFB", false);
			}
			else{
				alert(err);
			}
		});
	}
});

//custom login/register functionas
Template.signupPage.events({
	//login with facebook
	'click #login-buttons-facebook': function(){
	  	Meteor.loginWithFacebook(
	  		{requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
				'user_posts']}, 
			function(err){
			    if (!err){
			      Session.set("isFB", true);
			      // $("#changePassword").hide();
			    }
			    else{
			      console.log(err);
			    }
			}
		)},
	'submit form': function(event) {
		event.preventDefault();
		console.log("submit");
		var userName = event.target.userName.value;
		var userEmail = event.target.userEmail.value;
		var DOB = event.target.dateOfBirth.value;
		var passwordVar = event.target.userPassword.value;
		var repeat = event.target.userPasswordAgain.value;

		var emailValidate = validateEmail(userEmail);
		var validate = true;
		if (passwordVar != repeat){
			//passwords don't match
			alert("Passwords don't match!");
			validate = false;
		}
		else if (!emailValidate){
			alert("Please enter a valid email.");
			validate = false;
		}
		else{
			Accounts.createUser(
				{
					username: userName,
					email: userEmail,
					password: passwordVar,
					profile: {
						dateOfBirth: DOB
					}
				}, 
				function(err){
					if (err){
						alert(err);
					}
					else{
					}
				}
			);
		}   
	},
	'click #nextLoginButton': function(){
		var checkDate = isValidDate($("#dateOfBirth").val());
		var name = $("#username").val();
		if (!name && checkDate){
			alert("Please enter your name!");
		}
		else if (checkDate && name){
			$("#firstSignPage").hide();
			$("#nextLoginButton").hide();
			$("#secondSignPage").show();
			$(".backButton").show();
			$("#splashTitle").css("margin-right", "76px");
		}
	},
	
});

Template.carousel.onRendered(function() {
	$('#carousel').on('slide.bs.carousel', function (event) {
  		if (event.relatedTarget.id == "loginSlide"){
  			$(".right.carousel-control").hide();
  		}
  		else{
  			$(".right.carousel-control").show();
  		}
	})
  	if (Session.get('c_login')) {
    	$('#carousel').carousel(3);
    	$('#carousel').carousel('pause');
  	}
	else
    	$('#carousel').carousel(0);
});

// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
function isValidDate(dateString)
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)){
    	alert("Please enter a valid date of birth");
        return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    var now = new Date();
    var entered = new Date(year, month - 1, day);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12){
    	alert("Please enter a valid date of birth");
        return false;
    }
    // Check the range of the day
    else if(!(day > 0 && day <= monthLength[month - 1])) {
    	alert("Please enter a valid date of birth");
        return false;
    }
    //check if the day has already happened
    else if (entered > now){
    	alert("Please enter a valid date of birth");
    	return false;
    }
    else{
    	return true;
    }
};

show_signup_fields = function() {
  if ($("#passwordAgain").is(":visible"))
  {
    $("#passwordAgain").hide();
    $("#createAccount").text("Create Account");
    $("#signIn").val("Sign In");
  }
  else{
    $("#passwordAgain").show();
    $("#createAccount").text("Cancel");
    $("#signIn").val("Create");
  }
}

//check if an email seems legit
function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function betaSignup(){
	var email = $("#betaEmail").val();
	var valid = validateEmail(email);
	if (!valid){
		alert("Please enter a valid email address");
	}
	else{
		Meteor.call("addBetaEmail", email);
		
	}
}
