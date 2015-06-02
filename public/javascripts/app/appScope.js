
/************************** App Scope Object **************************/
/**
 * AppScope - The application scope object.
 * @constructor
 */
function AppScope() {

    /**
     * Global variables
     * @type {{glob_paused: number, extParams: {}}}
     */
    var $globals = {
        'glob_paused' : 0,
        'extParams' : {}
    };

    /**
     * Adds Visualization Tabs
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
     * Set active visualization tabs
     */
    var setActiveVisualizationTab = function (){
        $('#visualizations').find('li').first().addClass("active");
        $('#content').find('div').first().addClass("active");
    };

    /**
     * Get current visualization object
     * @returns {*}
     */
    this.getCurrentVisualizationObject = function() {
        var visualizationName = $(".tab-pane.active").attr('id');
        var visualizationFactory = new VisualizationFactory();
        return visualizationFactory.createVisualizationObject(visualizationName);
    };

    /**
     * Get application global glob_paused variable
     * @returns {$globals.glob_paused|*}
     */
    this.getGlobPaused = function () {
        return $globals.glob_paused;
    };

    /**
     * Set application global glob_paused variable
     * @param value
     */
    this.setGlobPaused = function (value) {
        $globals.glob_paused = value;
    };

    /**
     * Get extension application params
     * @returns {$globals.extParams|*}
     */
    this.getExtensionParams = function() {
        return $globals.extParams;
    };

    /**
     * Set extension application params
     * @param params
     */
    this.setExtensionParams = function(params){
        $globals.extParams = params;
    };

    /**
     * Load extension params from disk
     * @param extName
     */
    this.loadExtensionParams = function(extName){
        var file = "./../params/" + extName + ".html";
        $('#extension-params').load(file);
    };

    /**
     * Remove visualizations
     */
    this.removeVisualizations = function (){
        $('#visualizations').empty();
        $('#content').empty();
        removeDescriptionHandler();
    };

    /**
     * Load extension visualization on extension change
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