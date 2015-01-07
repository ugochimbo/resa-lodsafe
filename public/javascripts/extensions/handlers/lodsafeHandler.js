$(function(){

    var lodsafe_mode = $("#lodsafe-mode");

    lodsafe_mode.bootstrapSwitch({
        'state': true,
        'animate': true,
        'handleWidth': 80,
        'onColor': 'success',
        'offColor': 'danger'
    });

    lodsafe_mode.on('switchChange.bootstrapSwitch', function(event, state) {
        extParams.strict = state;
    });

});