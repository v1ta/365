//calendar loading
Template.calendar.rendered = function() {
	if(!this._rendered) {
	    this._rendered = true;
	    var date = new Date();
	    loadCalendar(date, true);
	    var otherDate = getDate(date.getDate() - 1, 1);
	    getCalFeed(otherDate);
	    var today = new Date();
	    $("#calFeedHead").text("Day " + today.getDOY());
	}
};
// Template.calendar.onRendered(function(){
// 	renderFeed('#calFeed', 'calFeed-container', {owner:Meteor.userId()});
// });
Template.calendar.helpers({

});
Template.calendar.events({
	'click .datepicker-td': function(e){
    	//console.log(e.currentTarget.innerHTML);
	var element = e.currentTarget.childNodes[0];
	var day = element.innerHTML;
	var date = getDate(day - 1, 1);
	setCalText(date, false, true);
	getCalFeed(date);
 	 },
	'click #monthPrev': function(e){
      var date = getDate(-7, 1);
      loadCalendar(date, false);
  	},
	'click #monthNext': function(e){
      var date = getDate(7, 28);
      loadCalendar(date, false);
  	},
  	'click #yearPrev': function(e){
      var date = getDate(-100);
      loadCalendar(date, false);
  	},
	'click #yearNext': function(e){
      var date = getDate(100);
      loadCalendar(date, false);
  	}
});

//load the calendar
function loadCalendar(date, shouldSelect){
    var tbody = $(".datepicker-body");
    tbody.empty();
    var day = 01;
    //if this is true, want to highlight the current date
    if (shouldSelect){
    	day = date.getDate();
    }
    var month=date.getMonth(); // read the current month
    var year=date.getFullYear(); // read the current year 
    var dt=new Date(year, month, 01);//Year , month,date format

    var first_day=dt.getDay(); //, first day of present month

    dt.setMonth(month+1,0); // Set to next month and one day backward. 
    var last_date=dt.getDate(); // Last date of present month

    var dy=1; // day variable for adjustment of starting date. 
    var string = "";
    var numAdded = 0; //count actual days added. 
    for(i=0;i<=41;i++){
	    if((i%7)==0){string = string.concat("</tr><tr>");} // if week is over then start a new line 
	    if((i>= first_day) && (dy<= last_date)){
			numAdded += 1;
			var classString = "";
			if (numAdded == day && shouldSelect){
				string = string.concat("<td class=today><a href=''>"+ dy +"</a></td>");
			}
			else{
				string = string.concat("<td class=datepicker-td><a href=''>"+ dy +"</a></td>");
			}
			dy=dy+1;
	    }
	    else {
	    	string = string.concat("<td class=empty> </td>");
		} // Blank dates. 
    } // end of for loop

    string.concat("</tr>")
    tbody.append(string);
    $(".today").addClass("datepicker-td");
    dt.setDate(day);
    setCalText(dt, true, shouldSelect);
}
//show posts for a given day
function getCalFeed(date){
  
	var startDate = new Date(date); 
	startDate.setSeconds(0);
	startDate.setHours(0);
	startDate.setMinutes(0);
	var dateMidnight = new Date(startDate);
	dateMidnight.setHours(23);
	dateMidnight.setMinutes(59);
	dateMidnight.setSeconds(59);

	renderFeed('#calFeed', 'calFeed-container', {owner:Meteor.userId(), "createdAt": {
		$gt:startDate,
		$lt:dateMidnight
	}});

}
//set calendar feed header + calendar month/year
function setCalText(date, setCal, setHead){
    var monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
    var year = date.getFullYear().toString();
    var month = monthNames[date.getMonth()];
    var day = date.getDate();
    if (setCal){
    	$("#monthTitle").text(month);
    	$("#yearTitle").text(year);
  	}
    if (setHead)
    	$("#calFeedHead").text("Day " + (date.getDOY()));
}
//get date for previous or next month
//val is number of days to change by
//dateToSet is day to set to (1 for previous, 28 for next)
function getDate(val, string){
	var calendarDate = localStorage.getItem("selectedDate");
	calendarDate = new Date(calendarDate);
	if (string){
		calendarDate.setDate(string);
	}
	var newDate = new Date(1970,0,1);
	newDate.setSeconds(calendarDate / 1000);
	if (val){
		//this means set year
		if (Math.abs(val) == 100){
			newDate.setYear(newDate.getYear() + val/100 + 1900);
		}
		else{
			newDate.setDate(newDate.getDate() + val);
		}
	}
	else{
		newDate.setDate(newDate.getDate());
	}

	localStorage.setItem("selectedDate", $.format.date(newDate, "M d yyyy"))
	return newDate;
}