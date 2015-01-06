var lodsafe_mode = $("#lodsafe-mode");

function init() {
    lodsafe_mode.bootstrapSwitch({
        'state': true,
        'animate': true,
        'handleWidth': 80,
        'onColor': 'success',
        'offColor': 'danger'
    });
}

lodsafe_mode.on('switchChange.bootstrapSwitch', function(event, state) {
    console.log(state); // true | false
});

init();