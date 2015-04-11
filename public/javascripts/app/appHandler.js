
/************************** App Handler **************************/
/**
 *
 * @constructor
 */
function AppHandler() {

    /**
     *
     * @type {AppScope}
     */
    var $appScope = new AppScope();

    /**
     *
     * @type {ExtensionHandlerFactory}
     */
    var extensionHandlerFactory = new ExtensionHandlerFactory();

    /**
     *
     * @param value
     */
    this.setGlobPaused = function (value) {
        $appScope.setGlobPaused(value);
    };

    /**
     *
     * @param data
     * @returns {boolean}
     */
    this.isInitData = function (data) {
        return (JSON.stringify($appScope.getExtensionParams()) === '{}' || $appScope.getExtensionParams().name !== data.params.name);
    };

    /**
     *
     * @param extName
     */
    this.loadExtensionParams = function (extName) {
        $appScope.loadExtensionParams(extName);
        var extensionHandler = extensionHandlerFactory.createExtensionHandlerObject(extName);
        extensionHandler.init();
    };

    /**
     *
     */
    this.handleExtensionChange = function () {
        var selected = $("#extensions-list").find("option:selected").attr('value');
        var socket2 = io.connect(window.location.hostname);
        var data = {
            extParams: {name: selected}
        };
        socket2.emit('extChange', data);
    };

    /**
     *
     * @param data
     */
    this.initExtensionParams = function (data) {
        $appScope.removeVisualizations();
        $appScope.setExtensionParams(data.params);
        this.loadExtensionParams(data.params.name);
        $appScope.loadExtensionVisualizations(data.params.name);
    };

    /**
     *
     * @param watchList
     * @param params
     */
    this.updateVisualization = function (watchList, params) {
        var visualizationObject = $appScope.getCurrentVisualizationObject();
        visualizationObject.initVisualization();
        visualizationObject.updateVisualization(watchList, params);
    };

    /**
     *
     * @param data
     */
    this.updateTwitterStream = function (data) {
        $('#hashtag').html(' (#' + data.search_for.join() + ')').addClass("animated bounceIn");
        $('.tweet').removeClass('animated').removeClass('flash');
        $('.r_entity').css('background-color', '');
        $.each(data.recent_tweets, function (i, v) {
            $('#tweets').prepend('<div class="tweet animated slideInDown recent">' +
            '<div class="tweet-date">' + v.date + '</div>' +
            '<div class="tweet-location">' + (v.hasOwnProperty('location') ? v.location : '') + '</div>' +
            v.text + '</div>')
                .linkify({target: '_blank'});
        });
    };

    /**
     *
     * @param data
     * @param params
     */
    this.updateTopPanelInfo = function (data, params) {
        if (params.symbols_no > params.max_ent) {
            this.pauseAnalyzing();
            alert('The demo is limited to ' + max_ent + ' entities! contact us for more info: khalili@informatik.uni-leipzig.de');
        }

        /*var avg_no = params.total / params.symbols_no;
         var slug_text = '';*/
        $('#symbols_no').html(params.symbols_no).addClass("animated bounceIn");
        $('#tweets_no').html(data.tweets_no).addClass("animated bounceIn");

        if (data.tweets_no > 0 && !$appScope.getGlobPaused()) {
            this.establishPauseMode();
        } else {
            this.setGlobPaused(0);
        }
    };

    /**
     *
     * @param data
     */
    this.onSocketData = function (data){

        /**
         *
         * @type {{total: (*|Extensions.watchList.total|total|params.total|number), symbols_no: (exports.length|*|Store.length|length|Function|findRules.length), max_ent: number}}
         */
        var params = {
            total: data.total,
            symbols_no: Object.keys(data.watchList.symbols).length,
            max_ent:  400
        };

        this.updateTopPanelInfo(data.watchList, params);

        //Right Panel (Tweet Stream)
        this.updateTwitterStream(data.watchList);

        if(this.isInitData(data)) {
            this.initExtensionParams(data);
        }

        //Main Panel (Viz)
        this.updateVisualization(data.watchList, params);

        $('#last-update').text(new Date().toTimeString());
    };

    /**
     *
     * @returns {number}
     */
    this.startAnalyzing = function (){
        $appScope.setGlobPaused(0);
        var terms = $('#keyword').val();
        if(!$.trim(terms)){
            return 0;
        }
        this.establishPauseMode();
        var socket2 = io.connect(window.location.hostname);
        var data = {
            keywords : terms.split(','),
            extParams : $appScope.getExtensionParams()
        };
        socket2.emit('startA', data);
    };

    /**
     *
     */
    this.stopAnalyzing = function (){
        $('#reset_btn').addClass('animated bounceIn');
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('stopA', {});
        setTimeout(function(){
            socket2.emit('removeAll', {});
            $appScope.getCurrentVisualizationObject().remove();
            $('#tweets').empty();
        },1000);

        var process_button = $('#process_btn');

        process_button.find('i').removeClass('glyphicon-pause').addClass('glyphicon-play');
        process_button.removeClass('btn-warning').addClass('btn-success').attr('title','start').removeClass('bounceIn').addClass('animated bounceIn').attr('onclick','startAnalyzing();');
    };

    /**
     *
     */
    this.pauseAnalyzing = function (){
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('pauseA', {});

        var process_button = $('#process_btn');

        process_button.find('i').removeClass('glyphicon-pause').addClass('glyphicon-play');
        process_button.removeClass('btn-warning').addClass('btn-success').attr('title','start').removeClass('bounceIn').addClass('animated bounceIn').attr('onclick','startAnalyzing();');
    };

    /**
     *
     */
    this.removeAllEntities = function (){
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('removeAll', {});
    };

    /**
     *
     */
    this.establishPauseMode = function (){
        var process_button = $('#process_btn');
        process_button.find('i').removeClass('glyphicon-play').addClass('glyphicon-pause');
        process_button.removeClass('btn-success').addClass('btn-warning').attr('title','pause').addClass('animated bounceIn').attr('onclick','pauseAnalyzing();');
    };

}

var appHandler = new AppHandler();
