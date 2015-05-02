
/// Viz Factory

function VisualizationFactory(){

    this.createVisualizationObject = function(visualizationName) {
        if (visualizationName === 'lodsafe-facet')
            return lodsafe_facet;

        else if (visualizationName === 'map')
            return map;

        return bubble_cloud;
    }

}
