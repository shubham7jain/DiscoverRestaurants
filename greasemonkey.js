// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function() {
  "use strict";
    var allRestaurants = [];
    var ourRestaurantsList = [];
    var sortedList = [];
    $(document).ready(function() {
        var elem = document.getElementById('map-section').getElementsByClassName('container')[0];
        elem.style.width = '90%';
        callS3();
    });

    var element = document.getElementsByClassName('fa-angle-right');

    element[0].addEventListener('click', function() {
        setTimeout(createElement, 100);
    });

    element = document.getElementsByClassName('fa-angle-left');
    element[0].addEventListener('click', function() {
        setTimeout(createElement, 100);
    });

    setTimeout(listeners, 100);

    function listeners() {
        var elementsArray = document.getElementsByClassName('leaflet-marker-icon');
        console.log(elementsArray);
        Array.prototype.slice.call(elementsArray).forEach(function(elem) {
            elem.addEventListener('click', function() {
                setTimeout(createElement, 100);
            })
        })
    }

    function callS3() {
        $.ajax({
            url: "https://s3-us-west-2.amazonaws.com/client-dcidscv/cityguides/newyork/NewYorkDCI.json",
            cache: false,
            type: "GET",
            success: function(response) {
                for(i = 0; i <= response['city']['restaurants'].length; i++) {
                    if(response['city']['restaurants'][i] == undefined) {
                        continue;
                    }
                    allRestaurants.push(response['city']['restaurants'][i]);
                }
                callOurApi();
            },
            error: function(xhr) {
                console.log("ERROR");
            }
        });
    }

    function callOurApi() {
        $.ajax({
            url: "https://mauryn1ho8.execute-api.us-west-2.amazonaws.com/default/hellohttp?city=New%20York",
            cache: false,
            type: "GET",
            success: function(response) {
                console.log("SUCCESS");
                for(var i = 0; i < response['result'].length; i++) {
                    ourRestaurantsList.push(response['result'][i]);
                }

                sortLists(allRestaurants, ourRestaurantsList);
            },
            error: function(xhr) {
                console.log("ERROR");
            }
        });
    }

    function sortLists(allList, orderedList) {
        var allMap = {};
        for(var i = 0; i < allList.length; i++) {
            allMap[allList[i]['Merchant Name']] = allList[i]['Sr No'];
        }
        console.log(allMap);

        var orderedNames = [];
        for(i = 0; i < orderedList.length; i++) {
            orderedNames.push(orderedList[i]['name']);
            var data = {
                'data-name': orderedList[i]['name'],
                'data-key': allMap[orderedList[i]['name']],
                'rating': orderedList[i]['ratings'],
                'review_count': orderedList[i]['review_count']
            };

            sortedList.push(data);
        }

        console.log(sortedList);

        for(i = 0; i < allList.length; i++) {
            // Not present
            if(allList[i]['Merchant Name'].indexOf(orderedNames) <= -1) {
                data = {
                'data-name': allList[i]['Merchant Name'],
                'data-key': allList[i]['Sr No']
            };
                sortedList.push(data);
            }
        }
        createElement();
    }

    function createElement() {

        var start = parseInt(document.getElementsByClassName('first-index')[0].innerText);
        var end = parseInt(document.getElementsByClassName('last-index')[0].innerText);
        var ourListToShow = sortedList.slice(start, end+1);
        console.log(ourListToShow);
        $('.results-list li').each(function (i) {
            console.log(ourListToShow[i]);
            $(this)[0].setAttribute('data-key', ourListToShow[i]['data-key']);
            $(this)[0].setAttribute('data-name', ourListToShow[i]['data-name']);

            if('rating' in ourListToShow[i]) {
                 let review = "<span class='merchant-review'>" + ourListToShow[i]['rating'] + " stars(" + ourListToShow[i]['review_count'] + " reviews)" +"</span>" ;
                 $(this)[0].innerHTML = review;
            }
        });

        $(".merchant-review").css({
            'float' : 'right',
            'display' : 'inline-block',
            'color': '#005404',
            'font-family' : "Gotham Book",
            'font-size' : '10px',
            'line-height': '24px',
        });
    }
})();
