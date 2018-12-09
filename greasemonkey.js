// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://travel.discoverglobalnetwork.com/dinersclub/guides/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function() {
  "use strict";
    var allRestaurants = [];
    var ourRestaurantsList = [];
    var sortedList = [];
    $(document).ready(function() {

        addGlobalStyle('.stars-outer { display: inline-block; position: relative; font-family: FontAwesome; }');

        addGlobalStyle('.stars-outer::before { content: "\f006 \f006 \f006 \f006 \f006";}')

        addGlobalStyle('.stars-inner {position: absolute; top: 0; left: 0; white-space: nowrap; overflow: hidden; width: 0; }');

        addGlobalStyle('.stars-inner::before {content: "\f005 \f005 \f005 \f005 \f005"; color: #f8ce0b;}');

        var container = document.getElementById('map-section').getElementsByClassName('container')[0];

        var element = document.getElementsByClassName('results-list')[0];
        var anode = document.createElement("a");
        anode.setAttribute('href', '#');
        anode.innerHTML = "My Results";

        anode.addEventListener('click', function() {
            showLoading();
            callS3();
        });
        container.prepend(anode);
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

    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    function showLoading() {
        var resultsArea = document.getElementsByClassName('results-wrapper')[0];
        var imgElement = document.createElement("img");
        imgElement.setAttribute('src', 'https://s3-us-west-2.amazonaws.com/images-angel-hack/circle.gif');
        imgElement.className = 'loading';
        imgElement.setAttribute('style', 'display:block;');
        resultsArea.prepend(imgElement);

        $(".loading").css({
            'margin-left': 'auto',
            'margin-right': 'auto',
            'display': 'table-cell'
        });

        var resultListArea = document.getElementsByClassName('results-list')[0];
        resultListArea.setAttribute("style", "display:none;");

        var paginationArea = document.getElementsByClassName('pagination')[0];
        paginationArea.setAttribute("style", "display:none;");
    }

    function hideLoading() {
        var resultsArea = document.getElementsByClassName('results-wrapper')[0];
        var imgElement = document.getElementsByClassName('loading')[0];
        resultsArea.removeChild(imgElement)
        var resultListArea = document.getElementsByClassName('results-list')[0];
        resultListArea.setAttribute("style", "display:block;");
        var paginationArea = document.getElementsByClassName('pagination')[0];
        paginationArea.setAttribute("style", "display:block;");
    }

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
            url: "https://mauryn1ho8.execute-api.us-west-2.amazonaws.com/default/WorkingFunction?city=New%20York",
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
                'review_count': orderedList[i]['review_count'],
                'categories': orderedList[i]['categories'],
                'is_privilege': orderedList[i]['is_privilege']
            };

            sortedList.push(data);
        }

        console.log(sortedList);

        for(i = 0; i < allList.length; i++) {
            // Not present
            console.log("dasaadda");
            console.log(allList[i]['Merchant Name']);
            console.log(orderedNames);
            if(orderedNames.indexOf(allList[i]['Merchant Name']) <= -1) {
                console.log("Not found");
                data = {
                    'data-name': allList[i]['Merchant Name'],
                    'data-key': allList[i]['Sr No']
                };
                sortedList.push(data);
            }
        }
        hideLoading();
        createElement();
    }

    function createElement() {

        var start = parseInt(document.getElementsByClassName('first-index')[0].innerText);
        var end = parseInt(document.getElementsByClassName('last-index')[0].innerText);
        console.log("Shubham");
        console.log(sortedList);
        var ourListToShow = sortedList.slice(start-1, end+1);
        console.log(ourListToShow);
        var reviewElems = document.getElementsByClassName('merchant-review');
        while(reviewElems[0]) {
            reviewElems[0].parentNode.removeChild(reviewElems[0]);
        }
        $('.results-list li[data-key]').each(function (i) {
            console.log(ourListToShow[i]);
            $(this)[0].setAttribute('data-key', ourListToShow[i]['data-key']);
            $(this)[0].setAttribute('data-name', ourListToShow[i]['data-name']);
            if('is_privilege' in ourListToShow[i] && ourListToShow[i]['is_privilege'] === "1") {
                $(this)[0].setAttribute('class', 'dining active');
            } else {
                $(this)[0].setAttribute('class', '');
            }

            const starTotal = 5;
            if('rating' in ourListToShow[i]) {
                var reviewElem = document.createElement('li');
                reviewElem.setAttribute('class', 'merchant-review');

                reviewElem.innerHTML = ourListToShow[i]['rating'] + " stars(" + ourListToShow[i]['review_count'] + " reviews) " + ourListToShow[i]['categories'];
                //reviewElem.innerHTML =
                $(this)[0].parentNode.insertBefore(reviewElem, $(this)[0].nextSibling);

                // 2
                //const starPercentage = (ourListToShow[i]['rating'] / starTotal) * 100;
                // 3
                //const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
                // 4
                //document.querySelector(`.$(this)[0] .stars-inner`).style.width = starPercentageRounded;
            }
        });

        $(".merchant-review").css({
            'display' : 'inline-block',
            'color': '#005404',
            'font-family' : "Gotham Book",
            'font-size' : '10px'
        });
    }
})();
