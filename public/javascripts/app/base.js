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

    var addVisualizationTab = function (visualizations) {

        console.log(JSON.stringify(visualizations));

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

    this.setExtensionVisualizations = function(data) {
        if(this.getExtensionParams().name !== undefined || data.params.name !== this.getExtensionParams().name)
        {
            addVisualizationTab(data.params.visualizations);
            setActiveVisualizationTab();
        }
    };

}