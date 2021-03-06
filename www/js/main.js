var serverURL = "http://188.120.255.85:8000/api/";

var resultsTemplate = Handlebars.compile($("#results-template").html());	
var specsTemplate = Handlebars.compile($("#specs-template").html());	
var egeTemplate = Handlebars.compile($("#ege-template").html());
var args = "";
var specs;

$('#addEgeButton').on('click', function () {
	
	var val = $("#ege-select").val();
	var text = $("#ege-select option:selected").text();
	var context = {text: text, val: val};
	console.log(context);
	$("#ege-select-wrapper").before(egeTemplate(context));
});

var proceedArgs = function()
{
	var argsRaw = $('#searchForm').serializeArray();	
	var argsArray = {};
	for (var i = 0; i < argsRaw.length; i++) {
		var a = argsRaw[i];
		if(argsArray[a.name] == undefined)
			argsArray[a.name] = a.value;
		else
			argsArray[a.name] += ',' + a.value;
	};
	args = "";
	for(var key in argsArray)	
		args += key + "=" + argsArray[key] + "&";	

	if(args.length > 0)
		args = args.substring(0, args.length - 1);
}

$('#searchButton').on('click', function () {
	var $btn = $(this).button('loading');	
	proceedArgs();
	
	loadResource("result/bins.json/?" + args, function(data) {	
		var filtered = {};
		
		filtered.results = [];

		for (var i = 0; i < data.results.length; i++) {
			var res = data.results[i];
			if(jQuery.isEmptyObject(res.points))
			{
				console.log("Found empty result");
				console.log(res);
				continue;
			}

			filtered.results.push(res);
		}

		filtered.count = filtered.results.length;		

		$("#results").html(resultsTemplate(filtered));
		console.log(filtered);
		$btn.button('reset');		    	
		
		for (var i = 0; i < filtered.results.length; i++) {
			var res = filtered.results[i];
			
			if(jQuery.isEmptyObject(res.points))
			{
				console.log("Found empty result");
				filtered.count -=1;
			}
			
			if(res.points.percent1 == undefined)
				continue;
			
			bindGauge('#result-' + res.id + ' .chart1', res.points.percent1);
			bindGauge('#result-' + res.id + ' .chart2', res.points.percent2);
			bindChart('#result-' + res.id + ' .chart3', res);		
		};

	}, function(error) {
		$('#searchError').show('slow');	
		$btn.button('reset');
	});	
});

var loadSpecs = function(id) {
	loadResource("result/bins/" + id + ".json/?" + args, 
		function(data) {
			var hsid = data.results[0].id;
			data.results.hsid = hsid;
			$("#specs-" + hsid).html(specsTemplate(data));

			for(var id in data.results[0].specs)
			{
				var res = data.results[0].specs[id];

				bindGauge('#result-' + hsid + ' #spec-' + id + ' .chart1', res.points.percent1);
				bindGauge('#result-' + hsid + ' #spec-' + id + ' .chart2', res.points.percent2);
				bindChart('#result-' + hsid + ' #spec-' + id + ' .chart3', res);		
				
				$('#specs-' + hsid + ' #spec-' + id + ' h3').html(specs[id].name);
			}			
		}, 
		function(error){
			$('#searchError').show('slow');	
			$btn.button('reset');
		});
};

var bindGauge = function(selector, data){
	var chart2 = c3.generate({
		bindto: selector,
		size: { height: 100 },
	    data: {
	        columns: [['Шанс', data]],
	        type: 'gauge'
	    },			    
	    color: {
	        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
	        threshold: { values: [30, 60, 90, 100] }
	    },			    
	});
}

var bindChart = function(selector, data){
	var chart = c3.generate({
        bindto: selector,
        size: { height: 200 },
	    legend: { show: false },
        data: {
            columns: [
                ['1ая волна', data["1"].below_150, data["1"].below_160, data["1"].below_170, data["1"].below_180, data["1"].below_190, data["1"].below_200, data["1"].below_210, data["1"].below_220, data["1"].below_230, data["1"].below_240, data["1"].below_250, data["1"].below_260, data["1"].below_270, data["1"].below_280, data["1"].below_290, data["1"].below_300],
                ['2ая волна', data["2"].below_150, data["2"].below_160, data["2"].below_170, data["2"].below_180, data["2"].below_190, data["2"].below_200, data["2"].below_210, data["2"].below_220, data["2"].below_230, data["2"].below_240, data["2"].below_250, data["2"].below_260, data["2"].below_270, data["2"].below_280, data["2"].below_290, data["2"].below_300],
            ],
            type: 'bar',
	        groups: [['2ая волна', '1ая волна']]
        },
        axis: { 
        	x: {
	            type: 'category',
	            categories: ['150', '160', '170', '180', '190', '200', '210', '220', '230', '240', '250', '260', '270', '280', '290', '300'],
	            tick: {
        			rotate: 45,
        			multiline: false
        		}
	        },
	        y: { show: false }			
        }
    });
}

// Load resource from ajax
var loadResource = function(path, onsuccess, onerror)
{    
    $.ajax({
        url: serverURL + path,
        dataType: "json",
        async: true,
        success: function (result) {               
        	console.log("Loaded: " + path);
            onsuccess(result);
        },
        error: function (request,error) {
        	onerror(error);                        
        }
    });
};

loadResource("specs.json", function(data) {
	var avail = [10301, 10302, 10304, 50301, 50306, 70301, 80301, 90301, 90302, 90303, 90304, 100301, 110301, 110302, 110304, 120301, 120304, 130301, 130302, 130303, 140301, 150301, 150302, 150303, 150304, 150306, 160301, 180301, 180302, 190301, 200301, 210301, 240303, 250301, 270301, 270304, 380301, 380302, 380305, 400301, 420301];

    filtered = [];
    specs = {};

	for (var i = data.length - 1; i >= 0; i--) {
		data[i].text = data[i].name;		
		specs[data[i].id] = data[i];
		//if( data[i].name.indexOf("информ") > -1)
		if(avail.contains(data[i].id)) {			
			filtered.push(data[i]);
		}
	};

	$("#specs").select2({
	  placeholder: "Выберите специальность",
	  multiple: true,
	  data: filtered,
	  maximumSelectionLength: 5
	});
}, function(error) {
	$('#searchError').show('slow');	
	$btn.button('reset');
});


Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}