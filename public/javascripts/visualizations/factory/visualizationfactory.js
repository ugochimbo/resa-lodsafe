
/// Viz Factory

function VisualizationFactory(){

    this.createVisualizationObject = function(visualizationName) {
        if (visualizationName === 'lodsafe-facet')
            return lodsafe_facet;

        return bubble_cloud;
    }

}
