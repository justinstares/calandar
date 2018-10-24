//minified calendar API from wiki:
(function(){Date.prototype.deltaDays=function(c){return new Date(this.getFullYear(),this.getMonth(),this.getDate()+c)};Date.prototype.getSunday=function(){return this.deltaDays(-1*this.getDay())}})();
function Week(c){this.sunday=c.getSunday();this.nextWeek=function(){return new Week(this.sunday.deltaDays(7))};this.prevWeek=function(){return new Week(this.sunday.deltaDays(-7))};this.contains=function(b){return this.sunday.valueOf()===b.getSunday().valueOf()};this.getDates=function(){for(var b=[],a=0;7>a;a++)b.push(this.sunday.deltaDays(a));return b}}
function Month(c,b){this.year=c;this.month=b;this.nextMonth=function(){return new Month(c+Math.floor((b+1)/12),(b+1)%12)};this.prevMonth=function(){return new Month(c+Math.floor((b-1)/12),(b+11)%12)};this.getDateObject=function(a){return new Date(this.year,this.month,a)};this.getWeeks=function(){var a=this.getDateObject(1),b=this.nextMonth().getDateObject(0),c=[],a=new Week(a);for(c.push(a);!a.contains(b);)a=a.nextWeek(),c.push(a);return c}};

//initialize current month as october 2018
let currentMonth = new Month(2018, 9);
let monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let loggedIn = false;
let token = null;
let currID = null;
let date2 = null;

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

    //listener for changing month/year
    document.getElementById("date_btn").addEventListener("click", function(event){
        date2 = document.getElementById("alt-date2").value;
        let year = date2.substr(date2.length - 4);
        let month = date2.substring(0,2);
        let yearN = parseInt(year, 10);
        let monthN = parseInt(month, 10);
        currentMonth = new Month(yearN, (monthN-1));
        idArray = [];
        userIdArray = [];
        updateCalendar();
        getEventAjax();
        $("#"+date2).addClass("highlight");



    }, false);

    //listener for clicking next month button
    document.getElementById("next").addEventListener("click", function(event){
        currentMonth = currentMonth.nextMonth();
        idArray = [];
        userIdArray = [];
        updateCalendar();
        getEventAjax();
        $("#"+date2).removeClass("highlight");

    }, false);

    //listener for clicking previous month button
    document.getElementById("previous").addEventListener("click", function(event){
        currentMonth = currentMonth.prevMonth();
        idArray = [];
        userIdArray = [];
        updateCalendar();
        getEventAjax();
        $("#"+date2).removeClass("highlight");

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

    document.getElementById("newEvent_btn").addEventListener("click", function(){editCallback(currID);}, false);

    document.getElementById("validate_btn").addEventListener("click", function(){userExists(currID);}, false);
    //document.getElementById("share_btn").addEventListener("click", function(){shareCallback(currID);}, false);

    document.getElementById("allEvents").addEventListener("click", eventListAjax, false);



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
                var n;
                let dayID = ""
                let userDayId = "";
                let userDayMonth = dayMonth + 1;


                if(userDayMonth < 10 && dayDate < 10){
                  n = dayDate.toString();
                  n = "0" + n;
                  m = userDayMonth.toString();
                  m = "0" + m;
                  userDayId = m+"-"+n+"-"+year;
                }
                // else {
                //   userDayId = userDayMonth+"-"+dayDate+"-"+year;
                // }
                else if(userDayMonth >= 10 && dayDate >= 10){
                  n = userDayMonth.toString();
                  n = "0" + n;
                  userDayId = userDayMonth+"-"+dayDate+"-"+year;
                }

                else if(userDayMonth >= 10 && dayDate < 10){
                  n = dayDate.toString();
                  n = "0" + n;
                  userDayId = userDayMonth+"-"+n+"-"+year;
                }
                else if(userDayMonth < 10 && dayDate >= 10){
                  n = userDayMonth.toString();
                  n = "0" + n;
                  userDayId = n+"-"+dayDate+"-"+year;
                }
                else{
                  //do nothing
                }


                //day ID with 1-indexed month to be displayed to user

                if(dayMonth != month){
                    weekHtml += "<td class=\"otherMonth\">"+dayDate+"</td>";
                }else{
                  //check this!!!!!!!
                   weekHtml += "<td id=\""+userDayId+"\">"+dayDate+"</td>";
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
            document.getElementById(userIdArray[i]).addEventListener("click", function(){
                //clicking a day brings up a dialog of the day's events
                //alert("day is "+idArray[i]);
                $("#userEvents").empty();
                $("#dayEvents").dialog({
                    title: "Here are your events for "+userIdArray[i],
                    height: 400,
                    width: 500
                });


                dayEventAjax(userIdArray[i]);

            },false);
        }

        getEventAjax();
    }

    function dayEventAjax(eventDay){

      const data = {'date': eventDay, 'token': token};

      fetch("getDayEvents.php", {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {'content-type': 'application/json'}
      })
      .then(response => response.json())
      .then(data => {
          console.log(data.success ? "Success!" : `Error: ${data.message}`);
          if(data.success){
              $("#userEvents").empty();
              if(data.events.length > 0){
                $("#noEvents").addClass("off");

                for(let i in data.events){

                  let title = data.events[i].title;
                  let time = data.events[i].time;
                  let id = data.events[i].eventID;

                  let delID = "del"+id;
                  let edID = "ed"+id;
                  let tiID = "ti"+id;
                  let tmID = "tm"+id;

                  let shID = "sh"+id;

                  $("<p id=\""+tiID+"\"><b>"+title+"</b></p>").appendTo("#userEvents");
                  $("<ul id=\""+tmID+"\"><li>"+time+"</li></ul>").appendTo("#userEvents");
                  $("<button id=\""+delID+"\" class=\"buttonRed\">Delete</button>").appendTo("#userEvents");
                  $("<button id=\""+edID+"\" class=\"buttonBlue\">Edit</button>").appendTo("#userEvents");
                  $("<button id=\""+shID+"\" class=\"buttonPurple\">Share</button>").appendTo("#userEvents");


                  deleteCallback(id);

                  document.getElementById(edID).addEventListener("click", function(){
                      //alert("edit");
                    $("#editEventDialog").dialog({
                        height: 400,
                        width: 500
                    });

                    currID = id;
                  }, false);

                  document.getElementById(shID).addEventListener("click", function(){
                    $("#shareEventDialog").dialog({
                        height: 400,
                        width: 500
                    });

                    currID = id;
                  }, false);

                }

              }else if(data.events.length == 0){
                if($("#noEvents").hasClass("off")){
                  $("#noEvents").removeClass("off");
                }
              }
            }
      });
    }

    function eventListAjax(){
        $("#allUserEvents").empty();
        $("#allDayEvents").dialog({
            height: 400,
            width: 500
        });
        const data = {'token': token};

        fetch("allEvents.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.success ? "Success!" : `Error: ${data.message}`);
            if(data.success){
                $("#allUserEvents").empty();
                if(data.events.length > 0){
                    $("#noEventsAll").addClass("off");

                    for(let i in data.events){

                        let title = data.events[i].title;
                        let time = data.events[i].time;
                        let date = data.events[i].date;
                        let id = data.events[i].eventID;

                        let delID = "del"+id;
                        let edID = "eda"+id;
                        let tiID = "ti"+id;
                        let tmID = "tm"+id;
                        let dayID = "day"+id;

                        let shID = "sha"+id;

                        $("<p id=\""+tiID+"\"><b>"+title+"</b></p>").appendTo("#allUserEvents");
                        $("<ul id=\""+tmID+"\"><li>"+date+"</li><li>"+time+"</li></ul>").appendTo("#allUserEvents");
                        $("<button id=\""+delID+"\" class=\"buttonRed\">Delete</button>").appendTo("#allUserEvents");
                        $("<button id=\""+edID+"\" class=\"buttonBlue\">Edit</button>").appendTo("#allUserEvents");
                        $("<button id=\""+shID+"\" class=\"buttonPurple\">Share</button>").appendTo("#allUserEvents");


                        deleteCallback(id);

                        document.getElementById(edID).addEventListener("click", function(){
                            //alert("edit");
                            $("#editEventDialog").dialog({
                                height: 400,
                                width: 500
                            });

                            currID = id;
                          }, false);

                          document.getElementById(shID).addEventListener("click", function(){
                            $("#shareEventDialog").dialog({
                                height: 400,
                                width: 500
                            });

                            currID = id;
                          }, false);

                    }
                }else if(data.events.length == 0){
                    if($("#noEventsAll").hasClass("off")){
                        $("#noEventsAll").removeClass("off");
                    }
                }
            }
        });
    }

    function deleteCallback(id){
      document.getElementById("del"+id).addEventListener("click", function(){
        const data = {'id': id, 'token': token};

        fetch("deleteEvent.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.success ? "Event deleted successfully!" : `Your event was not deleted: ${data.message}`);
            if(data.success){
              //remove all references to that event and remove delete/edit buttons
              $("#tm"+id).remove();
              $("#ti"+id).remove();
              $("#del"+id).remove();
              $("#ed"+id).remove();
              $("#eda"+id).remove();
              $("#sh"+id).remove();
              $("#"+id).remove();
            }
        });
      }, false);
      //updateCalendar();
      getEventAjax();
    }

    function editCallback(id){

        const title = document.getElementById("newTitle").value;
        const time = document.getElementById("newTime").value;

        const data = {'id': id, 'title': title, 'time': time, 'token': token};

        fetch("editEvent.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        })
        //.then(response => response.text())
        //.then(text => console.log(text))
        .then(response => response.json())
        .then(data => {
            console.log(data.success ? "Event edited successfully!" : `Your event was not edited: ${data.message}`);
            if(data.success){
                $("#editEventDialog").dialog("close");
                //$("#dayEvents").dialog("close");
                $(".ui-dialog-content").dialog("close");
                updateCalendar();
                //alert(id);
            }
        });

      //updateCalendar();
      getEventAjax();
    }

    function userExists(id){
      const otherUser = document.getElementById("otherUser").value;
      const data = {'otherUser': otherUser, 'token': token};
      fetch("userExists.php", {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {'content-type': 'application/json'}
      })
      // .then(response => response.text())
      // .then(text => console.log(text))
      .then(response => response.json())
      .then(data => {
        console.log(data.success ? "User Exists" : `User does not exist: ${data.message}`);
          if(data.success){
          shareCallback(id);
          return;
          }
          else{
          alert("Invalid Username");
          return false;
          }
        });



    }

    function shareCallback(id){
            const otherUser = document.getElementById("otherUser").value;
            const data = {'id': id, 'otherUser': otherUser, 'token': token};
            fetch("shareEvent.php", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'content-type': 'application/json'}
            })
            // .then(response => response.text())
            // .then(text => console.log(text))
            .then(response => response.json())
            .then(data => {
              // console.log(data.success1 ? "Event query successful!" : `Your event was not queried: ${data.message1}`);
              // console.log(`variable check: ${data.events[0][0]}`);
              // console.log(`variable check: ${data.otherUser}`);
              console.log(data.success ? "Event shared successfully!" : `Your event was not shared: ${data.message}`);
                if(data.success){
                    $("#shareEventDialog").dialog("close");
                    //$("#dayEvents").dialog("close");
                    $(".ui-dialog-content").dialog("close");
                    updateCalendar();
                    alert("successfully added event to user: " + data.otherUser);
                }
            });

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
                $("#dateSwitch").removeClass("off");
                $("#allEvents").removeClass("off");

                //console.log("hello " + data.token);


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
                $("#dateSwitch").addClass("off");
                $("#allEvents").addClass("off");
                $(".ui-dialog-content").dialog("close");
                token = null;
                currID = null;
                updateCalendar();
            }
        });
    }

    function eventAjax(event){
        const title = document.getElementById("eventTitle").value;
        const date = document.getElementById("alt-date").value;
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
                // $("#noEvents").removeClass("off");

                updateCalendar();
                getEventAjax();
                //need to add event to calendar here. Probably using updateCalendar() but idk yet

            }
        });
    }

    function getEventAjax(){
      const title = document.getElementById("eventTitle").value;
      const date = document.getElementById("alt-date").value;
      const time = document.getElementById("eventTime").value;


      const data = {'title': title, 'date': date, 'time': time, 'token': token};
      fetch("getEventData.php", {
          method: 'POST',
          body: JSON.stringify(data),
          headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
      })
      .then(response => response.json())
      .then(data => {
        // console.log(data.bug1);
        // console.log(data.bug2);
         console.log(data)
          if(data.success){
            let event = data.events;
            // for(let i in userIdArray){
            //   $("#"+userIdArray[i]).children.remove();
            // }
            for(var i = 0; i< event.length; i++){
              //console.log(date);
              $("#"+event[i].eventID).remove();
              let title = document.getElementById(`${event[i].date}`);
              if(title != null){
                let a = document.createElement("li");
                a.setAttribute("id", `${event[i].eventID}`);
  	            a.appendChild(document.createTextNode(event[i].title));
  	            title.appendChild(a);
              }
            }

          }

          });
    }


    // function deleteAjax(id){
    //   const data = {'id': id, 'token': token};
    //
    //   fetch("deleteEvent.php", {
    //       method: 'POST',
    //       body: JSON.stringify(data),
    //       headers: {'content-type': 'application/json'}
    //   })
    //   .then(response => response.json())
    //   .then(data => {
    //       console.log(data.success ? "Event deleted successfully!" : `Your event was not deleted: ${data.message}`);
    //       if(data.success){
    //         //remove all references to that event and remove delete/edit buttons
    //         $("#tm"+id).remove();
    //         $("#tm"+id).remove();
    //         $("#del"+id).remove();
    //         $("#ed"+id).remove();
    //       }
    //   });
    // }


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
        getEventAjax();
    }

});
