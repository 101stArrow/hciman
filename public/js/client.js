var socket;
socket = io.connect('http://'+location.hostname+':'+location.port);

function init() {
    servercode = $('#servercode').val();
    username = $('#username').val()

    socket.emit('joingame', {user: username, server: servercode})
    
    $('#intro').addClass('animated fadeOutDown').hide()
    $('#game').addClass('animated fadeInDown').show()
}
function controller(e){
    key = e.keyCode
    if(key == 119){ // w
        
    } else if (key == 100) { // d
        
    } else if (key == 97) { // a
        
    } else if (key == 115) { // s
        
    } else if (key == 80) { // p
        
    } else {
        // console.log(e.keyCode)
    }
}

function input(button){
    socket.emit('move', {player: username, action: button})
}

socket.on('news', function (data) {
    $.notify({
        title: data.title,
        message: " - "+data.body
    },{
        type: 'info'
    })
});