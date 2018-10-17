//minified calendar API from wiki:
(function(){Date.prototype.deltaDays=function(c){return new Date(this.getFullYear(),this.getMonth(),this.getDate()+c)};Date.prototype.getSunday=function(){return this.deltaDays(-1*this.getDay())}})();
function Week(c){this.sunday=c.getSunday();this.nextWeek=function(){return new Week(this.sunday.deltaDays(7))};this.prevWeek=function(){return new Week(this.sunday.deltaDays(-7))};this.contains=function(b){return this.sunday.valueOf()===b.getSunday().valueOf()};this.getDates=function(){for(var b=[],a=0;7>a;a++)b.push(this.sunday.deltaDays(a));return b}}
function Month(c,b){this.year=c;this.month=b;this.nextMonth=function(){return new Month(c+Math.floor((b+1)/12),(b+1)%12)};this.prevMonth=function(){return new Month(c+Math.floor((b-1)/12),(b+11)%12)};this.getDateObject=function(a){return new Date(this.year,this.month,a)};this.getWeeks=function(){var a=this.getDateObject(1),b=this.nextMonth().getDateObject(0),c=[],a=new Week(a);for(c.push(a);!a.contains(b);)a=a.nextWeek(),c.push(a);return c}};

//initialize current month as october 2018
let currentMonth = new Month(2018, 9);
let monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
let loggedIn = false;
let token = null;

//array of day IDs for current month. Will be cleared and repopulated with each change in month
//userIdArray is array of 1-indexed day ids to be displayed to user
let idArray = [];
let userIdArray = [];

//have to check if html content is loaded before doing anything to avoid null errors
//EVERYTHING ELSE MUST GO WITHIN THIS FUNCTION
$(document).ready(function(){

    //update the calendar when the page loads to the current month
    updateCalendar();

//EVENT LISTENERS----------------------------------------------------------------------------------------------------------------

    //listener for clicking next month button
    document.getElementById("next").addEventListener("click", function(event){
        currentMonth = currentMonth.nextMonth();
        idArray = [];
        userIdArray = [];
        updateCalendar();
    }, false);

    //listener for clicking previous month button
    document.getElementById("previous").addEventListener("click", function(event){
        currentMonth = currentMonth.prevMonth();
        idArray = [];
        userIdArray = [];
        updateCalendar();
    }, false);

    //listener for clicking login button
    document.getElementById("login").addEventListener("click", function(){
        $("#loginDialog").dialog({
            height: 400,
            width: 500
        });
    }, false);

    //listener for clicking register button within login dialog
    document.getElementById("newAcc").addEventListener("click", function(){
        $("#registerDialog").dialog({
            height: 400,
            width: 500
        });
    }, false);

    //listener for submitting login form after inputting username/password
    document.getElementById("login_btn").addEventListener("click", loginAjax, false);

    //listener for submitting register form after inputting username/password
    document.getElementById("reg_btn").addEventListener("click", registerAjax, false);

    //logout button listener
    document.getElementById("logout").addEventListener("click", logoutAjax, false);

    //listener for add new event button
    document.getElementById("addEvent").addEventListener("click", function(){
        $("#eventDialog").dialog({
            height: 400,
            width: 500
        });
    }, false);

    //listener for submitting event form
    document.getElementById("event_btn").addEventListener("click", eventAjax, false);


//----------------------------------------------------------------------------------------------------------------


//FUNCTIONS----------------------------------------------------------------------------------------------------------------

    //populates calendar with proper dates for any month
    function updateCalendar(){
        let weeks = currentMonth.getWeeks();
        let month = currentMonth.month;
        let year = currentMonth.year;
        
        $("#monthLabel").html(monthsArr[month]+" "+year);

        //clear 6th row if the month only spans 5 week rows
        if(weeks.length != 6){
            $("#w5").html("");
        }

        for(let w in weeks){
            let days = weeks[w].getDates();
            let weekClass = "#w"+w;
            let weekHtml;

            for(let d in days){
                //console.log(days[d].toISOString());
                let dayMonth = days[d].getMonth();
                let dayDate = days[d].getDate();
                let dayID = dayMonth+"-"+dayDate+"-"+year;

                //day ID with 1-indexed month to be displayed to user
                let userDayMonth = dayMonth + 1;
                let userDayId = userDayMonth+"-"+dayDate+"-"+year;
                
                if(dayMonth != month){
                    weekHtml += "<td class=\"otherMonth\">"+dayDate+"</td>";
                }else{
                   weekHtml += "<td id=\""+dayID+"\">"+dayDate+"</td>";
                   //add ID for each day in current month to list of IDs
                   idArray.push(dayID);
                   userIdArray.push(userDayId);
                   //console.log(dayID);
                }
            }

            $(weekClass).html(weekHtml);
        }

        for(let i in idArray){
            //add click listener to each date on current calendar. clicking will display events for that day
            document.getElementById(idArray[i]).addEventListener("click", function(){
                //clicking a day brings up a dialog of the day's events
                //alert("day is "+idArray[i]);
                $("#dayEvents").dialog({
                    title: "Here are your events for "+userIdArray[i],
                    height: 400,
                    width: 500
                });

            }, false);
        }
    }

    function loginAjax(event){
        const username = document.getElementById("user").value;
        const password = document.getElementById("pass").value;

        const data = {'user': username, 'pass': password};

        fetch("cLogin.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.success ? "Login successful!" : `You were not logged in ${data.message}`);
            if(data.success){
                $("#loginDialog").dialog("close");
                $("#login").addClass("off");
                $("#logout").removeClass("off");
                $("#addEvent").removeClass("off");
            }
        })
        .then(t => tokenAjax());
    }

    function registerAjax(event){
        const username = document.getElementById("newUser").value;
        const password = document.getElementById("newPass").value;

        const data = {'user': username, 'pass': password};

        fetch("cRegister.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.success ? "Register successful!" : `You were not registered in ${data.message}`);
            if(data.success){
                $("#registerDialog").dialog("close");
                $("#success").removeClass("off");
            }
        });
    }

    function logoutAjax(event){
        fetch("cLogout.php", {
            method: 'POST',
            headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.success ? "Logout successful!" : `You were not logged out, something went terribly wrong`);
            if(data.success){
                $("#logout").addClass("off");
                $("#login").removeClass("off");
                $("#addEvent").addClass("off");
                token = null;
            }
        });
    }

    function eventAjax(event){
        const title = document.getElementById("eventTitle").value;
        const date = document.getElementById("eventDate").value;
        const time = document.getElementById("eventTime").value;

        const data = {'title': title, 'date': date, 'time': time, 'token': token};

        fetch("cEvent.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.success ? "Event added successfully!" : `Your event was not added in ${data.message}`);
            if(data.success){
                $("#eventDialog").dialog("close");
                $("#success").removeClass("off");

                //need to add event to calendar here. Probably using updateCalendar() but idk yet
                
            }
        });
    }

    function tokenAjax(){
        fetch("ajaxToken.php", {
            method: 'POST',
            headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(res => {
            console.log(res.success ? `token: ${res.token}` : `fail: ${res.message}`);
            tokenCallback(res.token);
        });
    }

    function tokenCallback(response){
        token = response;
    }

});