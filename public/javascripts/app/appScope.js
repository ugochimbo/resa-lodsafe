
/************************** App Scope Object **************************/

/**
 *
 * @constructor
 */
function AppScope() {

    /**
     *
     * @type {{glob_paused: number, extParams: {}}}
     */
    var $globals = {
        'glob_paused' : 0,
        'extParams' : {}
    };

    /**
     *
     * @param visualizations
     */
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

    /**
     *
     */
    var setActiveVisualizationTab = function (){
        $('#visualizations').find('li').first().addClass("active");
        $('#content').find('div').first().addClass("active");
    };

    /**
     *
     * @returns {*}
     */
    this.getCurrentVisualizationObject = function() {
        var visualizationName = $(".tab-pane.active").attr('id');
        var visualizationFactory = new VisualizationFactory();
        return visualizationFactory.createVisualizationObject(visualizationName);
    };

    /**
     *
     * @returns {$globals.glob_paused|*}
     */
    this.getGlobPaused = function () {
        return $globals.glob_paused;
    };

    /**
     *
     * @param value
     */
    this.setGlobPaused = function (value) {
        $globals.glob_paused = value;
    };

    /**
     *
     * @returns {$globals.extParams|*}
     */
    this.getExtensionParams = function() {
        return $globals.extParams;
    };

    /**
     *
     * @param params
     */
    this.setExtensionParams = function(params){
        $globals.extParams = params;
    };

    /**
     *
     * @param extName
     */
    this.loadExtensionParams = function(extName){
        var file = "./../params/" + extName + ".html";
        $('#extension-params').load(file);
    };

    /**
     *
     */
    this.removeVisualizations = function (){
        $('#visualizations').empty();
        $('#content').empty();
    };

    /**
     *
     * @param extName
     */
    this.loadExtensionVisualizations = function(extName) {
        if($globals.extParams.name !== undefined || extName !== $globals.extParams.name)
        {
            addVisualizationTab($globals.extParams.visualizations);
            setActiveVisualizationTab();
        }
    };

}