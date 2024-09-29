// ==UserScript==
// @name         Extranet calendar export
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Export to Calendar
// @author       Drakkonnen
// @match        https://portal.wsb.pl/group/poznan/moj-plan
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wsb.pl
// @grant        none
// ==/UserScript==

setTimeout(function() {
    'use strict';
    var entries = [];
    if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
        Main();
    }

    function Main(){
        ExportButton();
    }


    function Lessons() {
        let months = document.getElementsByClassName("plan-tyg-table-txt wide");
        for (let month of months) {
            if (month.parentElement.className == "desktop-hidden") {
                continue;
            }
            let lessonsTbody = month.children[0].children;

            for (let i = 1; i < lessonsTbody.length; i++) {
                let day = lessonsTbody[i].cells[0].innerText.match(/(\d+).+/)[0];
                let time = lessonsTbody[i].cells[1].innerText.trim();
                let type = lessonsTbody[i].cells[2].innerText.trim();
                let name = lessonsTbody[i].cells[3].innerText.trim();
                let location = lessonsTbody[i].cells[4].innerText.trim();
                let person = lessonsTbody[i].cells[5].innerText.trim().split("\n")[0].trim();
                console.log(day + " " + time + " " + type + " " + name + " " + location + " " + person);

                entries.push(new LessonEntry(day, time, type, name, location, person));

            }
    }
  }

    function ExportButton(){
        let btn = document.createElement("button");
        btn.innerHTML = "Exportuj";
        btn.className = "export-button";
        btn.onclick = () => {
            Lessons();
            let ical = IcalFile();
            console.log(ical);


            saveData(ical, "WSB Calendar.ics");
        }


        let abc = document.querySelector(".calendar-navigator").appendChild(btn);
    }

    function IcalFile() {
        let ical = "BEGIN:VCALENDAR\n";

        for (let entry of entries) {
            ical += "BEGIN:VEVENT\n";
            ical += ParseDate(entry);
            ical += "SUMMARY: " + entry.name + " (" + entry.type + ")\\n" + entry.person + " " + entry.location + "\n";
            ical += "END:VEVENT\n";
        }
        ical += "END:VCALENDAR";
        return ical;
    }

    function ParseDate(entry) {
        let dateSplit = entry.day.split('.');
        let year = dateSplit[2];
        let month = dateSplit[1];
        let day = dateSplit[0];

        let timeSplit = entry.time.split(' - ');
        let startTime = timeSplit[0].split(':');
        let endTime = timeSplit[1].split(':');

        return "DTSTART:" + year + month + day + "T" + startTime[0] + startTime[1] +
            "00\nDTEND:" +year + month + day + "T" + endTime[0] + endTime[1] + "00\n";
    }

    function LessonEntry(day, time, type, name, location, person) {
        this.day = day;
        this.time = time;
        this.type = type;
        this.name = name;
        this.location = location;
        this.person = person;
    }


var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}())
}, 2000)();
