var serverUrl = "http://188.120.255.85:8000/api/"
var preloaded = {};

var load_resource = function(path, callback)
{
    console.log("Loading: " + path);
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
            console.log(error);
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
    selected_spec = id;
    $("#spec_input").val(id);
}

function send_search(){
    math = $("#math").val();
    russian = $("#russian").val();
    physics = $("#physics").val();        
    path = "result/percents.json/?specs=" + selected_spec + "&math=" + math + "&russian=" + russian + "&physics=" + physics;    
    load_resource(path, function(data) {
        preloaded.results = data;
        $.mobile.navigate( "#results" );       
    });
} 

$("#results").on( "pageshow", function( event ) {         
    var template = Handlebars.compile($("#results-list-template").html());
    $("#results-list").html(template(preloaded.results));
});

// SEARCHFORM
$( "#searchform" ).on( "pagecreate", function() {
    load_resource("specs.json", function( data ) { 
        /* TODO REMOVE PAGINATION */
        var template = Handlebars.compile($("#specs-list-template").html());
        preloaded.specs = data.results; 
        $("#specs-list").html(template(preloaded));
        $("#specs-list").listview( "refresh" );
        $("#specs-list").trigger( "updatelayout");
    });
    load_resource("groups.json", function( data ) { preloaded.spec_groups = data.results; });
});

// HIGHSCHOOLS LIST
var hstemplate = Handlebars.compile($("#hs-template").html());
var hspage = 1;

$("#hs").on( "pageshow", function( event ) {
    load_hs();
});

var load_hs = function() {        
    load_resource("highschools.json?page=" + hspage, function (data) {        
        $("#hs-list").append(hstemplate(data));
    });
    hspage += 1;
};