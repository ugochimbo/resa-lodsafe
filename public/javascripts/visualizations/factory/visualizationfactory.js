function VisualizationFactory(){

    this.createVisualizationObject = function(visualizationName) {
        if (visualizationName === 'bubblecloud')
            return new Bubblecloud();

        return new Bubblecloud();
    }

}
