
/************************** App Base Object **************************/

function Base() {
    var glob_paused=0;
    var extParams = {};

    this.getCurrentVisualizationName = function () {
        /*if(extParams.param.length > 1)
         return $( ".selector" ).tabs( "option", "active" ).attr( 'id' );
         else
         return extParams.param;*/

        return "bubblecloud";
    };

    this.getCurrentVisualizationObject = function() {
        var visualizationName = this.getCurrentVisualizationName();
        var visualizationFactory = new VisualizationFactory();
        return visualizationFactory.createVisualizationObject(visualizationName);
    };

    this.getGlobPaused = function () {
        return glob_paused;
    };

    this.getExtensionParams = function() {
        return extParams;
    };

    this.setExtensionParams = function(params){
        extParams = params;
    };

    this.loadExtensionParams = function(){
        var file = "./../params/" + extParams.name + ".html";
        $('#extension-params').load(file);
    };

    var addVisualizationTab = function (visualizations) {
        var tabAnchor = "";
        var tabContent = "";
        for (var index = 0; index < visualizations.length; ++index) {
            tabAnchor += '<li> <a data-toggle="tab" href="#' + visualizations[index].name +'">' + visualizations[index].title +'</a></li>';
            tabContent += '<div id="' + visualizations[index].name + '" class="tab-pane"></div>';
        }

        $('#visualizations').append(tabAnchor);
        $('#content').append(tabContent);
    };

    var setActiveVisualizationTab = function (){
        $('#visualizations').find('li').first().addClass("active");
        $('#content').find('div').first().addClass("active");
    };

    this.loadExtensionVisualizations = function(extName) {
        if(extParams.name !== undefined || extName !== extParams.name)
        {
            addVisualizationTab(extParams.visualizations);
            setActiveVisualizationTab();
        }
    };

}