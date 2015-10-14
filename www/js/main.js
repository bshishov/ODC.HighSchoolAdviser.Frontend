//var serverUrl = "http://192.168.26.24:8000/";
var serverUrl = "http://188.120.255.85/api/"
var preloaded = {};

var load_resource = function(path, callback)
{
    $.ajax({
        url: serverUrl + path,
        dataType: "json",
        async: true,
        success: function (result) {   
            console.log("Loaded: " + path);
            console.log(result);
            callback(result);
        },
        error: function (request,error) {
            alert('Network error has occurred please try again!');
        }
    });
};

$(document).on({
    ajaxSend: function () { loading("show"); },
    ajaxStart: function () { loading("show"); },
    ajaxStop: function () { loading("hide"); },
    ajaxError: function () { loading("hide"); }
});
 
function loading(showOrHide) {
    setTimeout(function(){
        $.mobile.loading(showOrHide);
    }, 1); 
}

var selected_spec = null;
function spec_select(id) {
    //alert(id);
    selected_spec = id;
    $("#spec_input").val(id);
}

function send_search(){
    math = $("#math").val();
    russian = $("#russian").val();
    physics = $("#physics").val();
    preloaded.sum = parseInt(math) + parseInt(russian) + parseInt(physics);
    path = String.format("search/{0}.json?sum={1}", selected_spec, preloaded.sum);
    load_resource(path, function(data) {
        preloaded.results = data;
        $.mobile.navigate( "#results" );       
    });
} 

$("#results").on( "pageshow", function( event ) { 
    // preloaded.results
    var input = preloaded.results;
    var hs = {};
    var hsid;
    for (var i = 0; i < input.length; i++) {
        if(!hs.hasOwnProperty(input[i].highschool.id))
        {
            hs[input[i].highschool.id] = { 
                enrollee1: [],
                enrollee2: [],
                highschool: input[i].highschool,
                spec_id: input[i].spec_id
                };
        }
        if(input[i].result_type == 1)
            hs[input[i].highschool.id].enrollee1.push(input[i]);
        else
            hs[input[i].highschool.id].enrollee2.push(input[i]); 
          //  hs[input[i].highschool] = input[i];
    };

    for (var id in hs) {
        current = hs[id];

        wavePassed = 0;
        for (var j = 0; j < current.enrollee1.length; j++) {
            if(current.enrollee1[j].total <= preloaded.sum)
                wavePassed += 1;
        }
        hs[id].passed1 = (wavePassed / current.enrollee1.length * 100).toFixed(1);
        hs[id].passed1Count = current.enrollee1.length;

        wavePassed = 0;
        for (var j = 0; j < current.enrollee2.length; j++) {
            if(current.enrollee2[j].total <= preloaded.sum)
                wavePassed += 1;
        }
        hs[id].passed2 = (wavePassed / current.enrollee2.length * 100).toFixed(1);
        hs[id].passed2Count = current.enrollee2.length;
    }

    preloaded.hsresults = hs;
    var template = Handlebars.compile($("#results-list-template").html());
    $("#results-list").html(template(preloaded));
});

$( "#searchform" ).on( "pagecreate", function() {
    load_resource("specs.json", function( data ) { 
        var template = Handlebars.compile($("#specs-list-template").html());
        preloaded.specs = data; 
        $("#specs-list").html(template(preloaded));
        $("#specs-list").listview( "refresh" );
        $("#specs-list").trigger( "updatelayout");
    });
    load_resource("spec_groups.json", function( data ) { preloaded.spec_groups = data; });
});

$("#hs").on( "pageshow", function( event ) { 
    var template = Handlebars.compile($("#hs-template").html());
    load_resource("highschools.json", function (data) {
        var o = {highschools: data};
        $("#hs-list").html(template(o));
    });
});




if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}