'use strict'

// next: finish makeActivity()

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

	var licenses = getHighscores(results, "license", 5);
	var authors = getHighscores(results, "author", 7);
	var tags = getHighscores(results, "tags", 5);
	var formats = getHighscores(results, "formats", 7);
    var activity = getTimestamps(results); 
    //console.dir(results);
  	//	console.log("Total # of datasets: " + getTotalNumber(results))
	 //  	console.log("Neuester Datensatz: " + findNewest(results)); 
	//console.dir(getTimestamps(results));
	
	//Namen zählen
	//Häufigste Tags
	
	makeChart(authors);
	makeDonut(licenses);
	makeActivity(activity);

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

	var authorDict = {
		"Senatsverwaltung für Stadtentwicklung und Wohnen Berlin": "SenSW",
		"Senatsverwaltung für Gesundheit und Soziales Berlin": "SenGeSoz",
		"Senatsverwaltung für Umwelt, Verkehr und Klimaschutz Berlin": "SenUVK",
		"Senatsverwaltung für Gesundheit, Pflege und Gleichstellung Berlin" : "SenGPG",
		"Amt für Statistik Berlin-Brandenburg": "AfSBB",
		"Stromnetz Berlin GmbH": "Stromnetz",
		"VBB - Verkehrsverbund Berlin-Brandenburg GmbH": "VBB"
		}

		var authorNames = value.map((el) => authorDict[el.key]);
		var nrOfDatasets = value.map((el) => el.value);
	
	var myChart = new Chart(ctx, {
	    type: 'pie',
	    data: {
	        labels: authorNames,

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

function makeDonut(value) {
	
	var licenceDict = {
		"Creative Commons Namensnennung (CCBY)": "CC-BY",
		"Nutzungsbestimmungen für die Bereitstellung von Geodaten des Landes Berlin": "Geo Berlin",
		"Creative Commons Attribution ShareAlike (ccbysa)": "CC-BY-SA",
		"Andere geschlossene Lizenz": "Other (nicht offen)",
		"Creative Commons CCZero (CC0)": "CC-0",
		"dl-de-2-0": "DL DE 2.0"
	}

	var ctx = document.getElementById("chartTwo").getContext('2d');

	var licenceNames = value.map((el) => licenceDict[el.key]);
	var nrOfDatasets = value.map((el) => el.value);

	var myChart = new Chart(ctx, {
	    type: 'doughnut',
	    data: {
	        labels: licenceNames,

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
	        	text: "Lizenzen"
	        },
	        legend: {
	        	display: false
	        }
	        
	    }
	});

}

function makeActivity(value) {

	/*var chartData = [];
	value.forEach(function(el) {
		var temp = {};
		temp.date = el.time;
		temp.count= 1; // wenn mehrere Einträge mit selbem datum, erhöhe
		chartData.push(temp);
	})
	console.dir(chartData);
*/
 var now = moment().endOf('day').toDate();
 var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
 var chartData = d3.timeDays(yearAgo, now).map(function (dateElement) {
      return {
        date: dateElement,
        count: (dateElement.getDay() !== 0 && dateElement.getDay() !== 6) ? Math.floor(Math.random() * 60) : Math.floor(Math.random() * 10)
      };
    });

	var chart1 = calendarHeatmap()
	              .data(chartData)
	              .selector('#chartThree')
	              .colorRange(['#D8E6E7', '#6fc0ba'])
	              .tooltipEnabled(true)
	              .legendEnabled(false)
	              .onClick(function (data) {
	                console.log('onClick callback. Data:', data);
	              });
	chart1();  // render the chart
}

