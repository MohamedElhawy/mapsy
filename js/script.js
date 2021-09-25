// activate strict mode
"use strict";




// catch DOM objects ---------------------------------------------------------------------------
const activityForm = document.getElementById("activityForm");
const distance = document.getElementById("distance");
const type = document.getElementById("type");
const elev = document.getElementById("elev");
const cadence = document.getElementById("cadence");
const duration = document.getElementById("duration");
const appActivityForm = document.getElementById("appActivityForm");
const activityLogAcontainer = document.getElementById("activityLogAcontainer");








// global variables  ---------------------------------------------------------------------------
let mapEvent;
let map;
let zoomLevel = 13;
let allActivites = [];
let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
let retrievedData;





// classes ---------------------------------------------------------------------------

class Workout
{

    date = new Date();
    id = (Date.now() + "").slice(-10);


    constructor(coords, distance, duration)
    {
        this.coords = coords; // array
        this.distance = distance;
        this.duration = duration;
    }

}

class Running extends Workout
{

    type = "running";

    constructor(coords, distance, duration , cadence)
    {

        super(coords,distance,duration);

        this.cadence = cadence;

        this.calcPace();
    }


    calcPace()
    {
        this.pace = this.duration / this.distance;
        return this.pace;
    }

}


class Cycling extends Workout
{
    type = "cycling";

    constructor(coords, distance, duration , elevationGain)
    {

        super(coords,distance,duration);

        this.elevationGain = elevationGain;

        this.calcSpeed();
    }


    calcSpeed()
    {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }

}






// functions ---------------------------------------------------------------------------


// getting our geolocation position ---------------------------------------------------------------------------
if (window.navigator.geolocation)
window.navigator.geolocation.getCurrentPosition( function (coords) { // if geolocation succeded


    // our coords using geolocation 
    let myCoords = [coords.coords.latitude,coords.coords.longitude];


    // leaflet library - create map with coordinations and zoom level 
    map = L.map('map').setView(myCoords, zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    // click event on map to get coordinates and make it public
    map.on("click" , function (mapE)
    {
        activityForm.classList.remove("hidden");
        distance.focus();
        mapEvent = mapE;

    });

    if (localStorage.getItem("data"))
    {
        retrievedData.forEach( function (el) {

            // message of popup
            let mess = `${el.type === "running"  ? "🏃🏻‍♂️" : "🚴‍♂️"}${el.type} on ${months[Number.parseInt(el.date.split("T")[0].split("-")[1])] + "," + Number.parseInt(el.date.split("T")[0].split("-")[2])}`;
    
    
            createMarker(el.coords,mess);
    
        });  
    }



}, function () { // if we geolocation failed

    alert("😟can not get your location, please try turning your Location(On) then reload the page.😟");
});



// checking function for values that are numbers and positive ---------------------------------------------------------------------------
function validateInputs (...x)
{

    return x.every( function (el) {

        if ( Number.isFinite(el) && el > 0)
        {
            return true;
        }

        return false;

    });
}




// creating a marker ---------------------------------------------------------------------------
function addMarker (e)
{

    // prevent submition
    e.preventDefault();


    // message of popup
    let popupMessage;


    // create markers on each click! :D
    let lat = mapEvent.latlng.lat;
    let lng = mapEvent.latlng.lng;

    let targetCorrds = [lat,lng];



    // catch values of form
    let workOutType = type.value;
    let workOutDistance = +distance.value;
    let workOutDuration = +duration.value;

    if (workOutType === "Running")   // running 
    {
        let workOutCadence = +cadence.value;

        // validation
        if ( !validateInputs(workOutDistance,workOutDuration,workOutCadence) )
        {
            return alert("the inputs must be positive numbers.");
        }

        // create runnign object
        let run = new Running(targetCorrds , workOutDistance, workOutDuration, workOutCadence);



        // log the activity
        allActivites.push(run);


        // display the activity as a log on html
        ansertActivityLog(allActivites);


        // store in local storage
        localStorage.setItem("data" , JSON.stringify(allActivites));


        // message of popup
        popupMessage = `🏃‍♂️${run.type} on ${months[run.date.getUTCMonth()] + "," + run.date.getUTCDate()}`;


    }
    else if (workOutType === "Cycling")  // cycling
    {
        let workOutElevGain = +elev.value;

        // validation
        if ( !validateInputs(workOutDistance,workOutDuration,workOutElevGain) )
        {
            return alert("the inputs must be positive numbers.");
        }

        // create Cycling object
        let cycle = new Cycling(targetCorrds , workOutDistance, workOutDuration, workOutElevGain);


        // log the activity
        allActivites.push(cycle);

        // display the activity as a log on html
        ansertActivityLog (allActivites);

        // store in local storage
        localStorage.setItem("data" , JSON.stringify(allActivites));

        // message of popup
        popupMessage = `🚴‍♂️${cycle.type} on ${months[cycle.date.getUTCMonth()] + "," + cycle.date.getUTCDate()}`;

    }


    // creates marker on map with popup box
    createMarker(targetCorrds,popupMessage);

    
    // reset input field
    distance.value = "";
    type.value = "Running";
    elev.value = "";
    cadence.value = "";
    duration.value = "";
    switchMode();

    // hide the form again after creating the marker
    activityForm.classList.add("hidden");

}


// switching between "running" and "cycling" --------------------------------------------------------------------
function switchMode ()
{

    if (type.value === "Cycling")
    {
        document.querySelector(".cedence").classList.add("hidden")
        document.querySelector(".elevation").classList.remove("hidden");
    }
    else if (type.value === "Running")
    {
        document.querySelector(".cedence").classList.remove("hidden")
        document.querySelector(".elevation").classList.add("hidden");
    }


}




// insert a log inside DOM ---------------------------------------------------------------------------

function ansertActivityLog (arrObject)
{


    // reset the container
    activityLogAcontainer.innerHTML = "";

    arrObject.forEach(
        function (object)
        {
            let dataObject = object;
            let objectTime;

            if (typeof dataObject.date === "object")
            {
                objectTime = months[dataObject.date.getUTCMonth()] + "," +  dataObject.date.getUTCDate();
            }
            else if (typeof dataObject.date === "string")
            {
                objectTime = months[Number.parseInt(dataObject.date.split("T")[0].split("-")[1])] + "," + Number.parseInt(dataObject.date.split("T")[0].split("-")[2]);
            }



            let insertedEl = `
            <div class="activityLog" data-id="${dataObject.id}">
        
                <div class="activityLogHeader">
                    <h2>${dataObject.type} on ${"sunday" + "," + "2"}</h2>
                </div>
        
        
                <div class="activityLogBody">
                    <div><span>${dataObject.type === "running" ? "🏃" : "🚴‍♂️"}</span> <span>${dataObject.distance}</span>KM</div>
                    <div><span>⌚</span> <span>${dataObject.duration}</span>MIN</div>
                    <div><span>⚡</span> <span>${dataObject.type === "running" ? dataObject.pace.toFixed(2) : dataObject.speed.toFixed(2)}</span>${dataObject.type === "running" ? "MIN/KM" : "KM/MIN"}</div>
                    <div><span>${dataObject.type === "running" ? "🦶" : "🗻"}</span> <span>${dataObject.type === "running" ? dataObject.cadence : dataObject.elevationGain}</span>${dataObject.type === "running" ? "SPM" : "M"}</div>
                </div>
        
            </div>`;
        
        
            activityLogAcontainer.insertAdjacentHTML("afterbegin" , insertedEl);
        }
    );

   

}



// finding marker from clicking log ---------------------------------------------------------------------------
function findTheMarkerOfTheLog (e)
{

    let clickedEl = e.target.closest(".activityLog");

    if (!clickedEl) return;



    // finding the object that have id equals the log data-id attribute
    let targetObject = allActivites.find( function (el)
    {
        return el.id === clickedEl.dataset.id;
    });

    // move the viewport of the map to the location specified
    map.setView(targetObject.coords , zoomLevel , {
        animate: true,
        pan: {
            duration: 1
        }
    });
}


// creating marker function ---------------------------------------------------------------------------
function createMarker (coords,message)
{
    // will create the marker on map with popup window
    L.marker(coords).addTo(map).bindPopup(
        L.popup({
        autoClose: false,
        closeOnClick: false
    })).setPopupContent(message).openPopup();
}






// retriving data from local storage
function loadOurData()
{

    if (localStorage.getItem("data"))
    {
        let data = JSON.parse(localStorage.getItem("data"));

        // fill the main data storage of the app
        allActivites = data;
    
        // display them on log list
        ansertActivityLog(data);
    
        // make the data puplic to be used outside the function
        retrievedData = data;
    }

}






// events listners --------------------------------------------------------------------
activityForm.addEventListener("submit" , addMarker);
type.addEventListener("change" , switchMode);
activityLogAcontainer.addEventListener("click" , findTheMarkerOfTheLog);





// on load --------------------------------------------------------------------

loadOurData();