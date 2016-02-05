"use strict";

var map;
var marker;
var markerPosition;
var dateCount = 1;

function submitOffer() {
	
	var name = document.getElementById('name').value;
    var price = document.getElementById('price').value;
    var description = document.getElementById('descr').value;
    var dates = document.getElementsByName('dates');
    var times = document.getElementsByName('times');
    var datesVal = [];
    var timesVal = [];
    var ok = true;
    
	if (!name) {
        $('#nameErr').html("<font color='red'>Offer name can't be empty</font>");
        ok = false;
	} else {
	    $('#nameErr').html("");
	}
	
	if (!description) {
        $('#descrErr').html("<font color='red'>Offer description can't be empty</font>");
        ok = false;
	} else {
	    $('#descrErr').html("");
	}
	
	if (!Number(price) || Number(price) <= 0) {
        $('#priceErr').html("<font color='red'>Offer price must be a positive number</font>");
        ok = false;
	} else {
	    $('#priceErr').html("");
	} 
	
	if (!marker) {
		$('#mapErr').html("<font color='red'>Please select a meeting point</font>");
		ok = false;
	} else {
		$('#mapErr').html("");
	}
	
	for (var i = 0; i < dates.length; i++)  {
		var date = dates[i];
		var time = times[i];
		if (!date.value || !time.value) {
			$('#' + date.id + 'Err').html("<font color='red'>Please enter a valid date and time</font>");
			ok = false;
		} else {
			$('#' + date.id + 'Err').html("");
			datesVal.push(date.value + " " + time.value);
		}
	}

	if (ok === true) {
        $.post('add', {
		name : name,
		description : description,
		price : Number(price),
		category : document.getElementById('category').value,
        position : markerPosition,
        dates : datesVal
        },
        function(responseText) {
            if (responseText === 'Offer created') {
                window.location='/';
            }
		});
	}
		
}

function addDate() {
    var table = document.getElementById('mainTable');
	var date = document.createElement("input");
	var time = document.createElement("input");
	var button = document.createElement("input");
	var div = document.createElement("div");
	
	dateCount = dateCount + 1;
        
	date.setAttribute("type", "date");
	date.setAttribute("name", "dates");
	date.setAttribute("id", "date" + dateCount);
	
	time.setAttribute("type", "time");
	time.setAttribute("name", "times");
	time.setAttribute("id", "time" + dateCount);
	
	div.setAttribute("id", "date" + dateCount + "Err");
	
	button.setAttribute("type", "button");
	button.setAttribute("value", "Remove");
	button.setAttribute("onclick", "removeDate(" + dateCount + ")");

	var row = table.insertRow(-1);
	var cell = row.insertCell(0);
                
	cell = row.insertCell(1);
	cell.appendChild(date);
	cell.appendChild(document.createTextNode(" "));
	cell.appendChild(time);
	cell.appendChild(document.createTextNode(" "));
	cell.appendChild(button);

	
	cell = row.insertCell(2);
	cell.appendChild(div);
}

function removeDate(index) {
    var row = document.getElementById('mainTable').rows[Number(index) + 3];
       
    for (var j = 0, col; col = row.cells[j]; j++) {
        col.innerHTML = "";
    }
}


function createMap() {
    var position = new google.maps.LatLng(44.42, 26.10);
    var myOptions = {
      zoom: 10,
      center: position,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    map = new google.maps.Map(
        document.getElementById("mapCanvas"),
        myOptions);
   	
    google.maps.event.addListener(map, 'click', function(event) {
    	if (marker) {
    		marker.setMap(null);
    	}
    	marker = new google.maps.Marker({
	       	position: event.latLng,
	       	map: map,
	       	title:"This is the place."
    	});
    	markerPosition = {'lat': event.latLng.lat(), 'lng': event.latLng.lng()};
    });
}