'use strict'

//var resultsArray = [];

function jsonp(url) {
    return new Promise(function(resolve, reject) {
        let script = document.createElement('script')
        const name = "_jsonp_" + Math.round(100000 * Math.random());
        //url formatting
        if (url.match(/\?/)) url += "&callback="+name
        else url += "?callback="+name
        script.src = url;

        window[name] = function(data) {
            resolve(data);
            document.body.removeChild(script);
            delete window[name];
        }
        document.body.appendChild(script);
    });
}
var data = jsonp("https://ckan.govdata.de/api/3/action/package_search?fq=organization:berlin-open-data&rows=1000");
var data2 = jsonp("https://ckan.govdata.de/api/3/action/package_search?fq=organization:berlin-open-data&rows=1000&start=1000&callback=initTwo")


Promise.all([data, data2])
.then(values => {
	var resultsArray = values["0"].result.results.concat(values["1"].result.results);
	return resultsArray;
})
.then(data => {
	initialize(data);
});

function initialize(results) {

	var licenses = getHighscores(results, "license", 3);
	var authors = getHighscores(results, "author", 5);
	var tags = getHighscores(results, "tags", 5);
	var formats = getHighscores(results, "formats", 7);
    //console.dir(results);
  //	console.log("Total # of datasets: " + getTotalNumber(results))
 //  	console.log("Neuester Datensatz: " + findNewest(results)); 
//	console.dir(getTimestamps(results));
	
	//Namen zählen
	//Häufigste Tags

	makeChart(authors);

}


function findNewest(data) {
	return data["0"].name;
}

function getTotalNumber(data) {
	return data.length;
}

function getTimestamps(data) {
	var timestamps = data.map(x => ({"time": x.metadata_modified, "name": x.name}));
	return timestamps;
}

function getHighscores(data, item, amount){
	
	var countsObj = {};

	if (item === "author") {

		for (var i = 0; i < data.length; i++) {
			if (countsObj.hasOwnProperty(data[i].author)) {
				countsObj[data[i].author]++
			}

			else {
				countsObj[data[i].author] = 1;
			}

		}
	} else if (item === "license") {
		for (var i = 0; i < data.length; i++) {
			if (countsObj.hasOwnProperty(data[i].license_title)) {
				countsObj[data[i].license_title]++
			}

			else {
				countsObj[data[i].license_title] = 1;
			}

		}

	} else if (item === "tags") {
		for (var i = 0; i < data.length; i++) {

			data[i].tags.forEach(function(el) {
				
				if (countsObj.hasOwnProperty(el.name)) {
				
				countsObj[el.name]++
				
				} else {
				
				countsObj[el.name] = 1;
				
				}

			});

		}

	} else if (item === "formats") {
		for (var i = 0; i < data.length; i++) {

			data[i].resources.forEach(function(el) {
				
				if (countsObj.hasOwnProperty(el.format)) {
				
				countsObj[el.format]++
				
				} else {
				
				countsObj[el.format] = 1;
				
				}

			});

		}	
	}

		var props = Object.keys(countsObj).map(function(key) {
			return {key: key, value: this[key] };
		}, countsObj);

		props.sort(function(p1, p2) {return p2.value - p1.value});
		var tops = props.slice(0, amount);

		return tops;
}


function makeChart(value) {
	var ctx = document.getElementById("chartOne").getContext('2d');

	
	var authorNames = value.map((el) => el.key);
	var nrOfDatasets = value.map((el) => el.value);


	var myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: ["SenSW", "SenGPG", "Yellow", "Green", "Purple"],
	        //labels: authorNames,

	        datasets: [{
	            
	            data: nrOfDatasets,
	            backgroundColor: '#6fc0ba',
	            borderColor: '#00eeee',
	            borderWidth: 1
	        }]
	    },
	    options: {
	        title: {
	        	display: true,
	        	text: "Top-Bereitsteller"
	        },
	        legend: {
	        	display: false
	        },
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }],
	            xAxes: [{
	            	ticks: {
	            		autoSkip: false,
	            		maxRotation: 90,
	            		minRotation: 90
	            	}
	            }]
	        }
	    }
	});
}

