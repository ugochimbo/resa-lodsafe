
//************ DOM Events *************//

//** TODO: Refactor view.. Unclean code **//

function startAnalyzing(){
    appHandler.startAnalyzing();
}

function pauseAnalyzing() {
   appHandler.pauseAnalyzing();
}

function stopAnalyzing() {
    appHandler.stopAnalyzing();
}

//** Extension Change **//
$("#extensions-list").on( "change", function() {
    appHandler.handleExtensionChange();
});

function getResourceDescription(resourceUri){
    var uriComponents = resourceUri.split('http://dbpedia.org/resource/');
    var description='';
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://lookup.dbpedia.org/api/search/PrefixSearch?MaxHits=1&QueryString="+uriComponents[1],
        async:false
    }).done(function( data ) {
        //console.log(data);
        description=data.results[0].description
    });

    if(!description){
        return '';
    }

    return description;
}

function popOver() {
    var resource = $(this).attr('resource');
    $(this).webuiPopover({
        title: resource.split('http://dbpedia.org/resource/')[1],
        content: getResourceDescription(resource),
        placement: 'top',
        animation: 'pop'
    });
}

function attachDescriptionHandler() {
    $('body').on('mouseover', 'span.r_entity', popOver);
}

function removeDescriptionHandler() {
    $('body').off('mouseover', 'span.r_entity', popOver);
}

