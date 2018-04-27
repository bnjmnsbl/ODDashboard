'use strict'

var resultsArray = [];

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
	resultsArray = values["0"].result.results.concat(values["1"].result.results);
	return resultsArray;
})
.then(data => {
	initialize(data);
});

function initialize(results) {
	console.log("starting out!");
	console.dir(results)
}


