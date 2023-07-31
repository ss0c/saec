var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load',onLoad);


function initWebSocket(){
    console.log('Tratando de conectar con el WebSocket');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event){
    console.log('Connection opened');
}

function onClose(event){
    console.log("Connection close");
    setTimeout(initWebSocket, 200);
}

function onMessage(event) {
    const led1 = document.getElementById("led1");
    const led2 = document.getElementById("led2");
    const time = document.getElementById("time");
    const crrnt = document.getElementById("current")

    console.log(event.data);

  
    if (event.data === "led1_on") {
        led1.checked = true;
        console.log("1 led1");
    } 
    else if (event.data === "led1_off") {
        led1.checked = false;
        console.log("0 led1");
    } 

    else if (event.data === "2") {
        led2.checked = true;
        console.log("0 led2");
    } 
    else if (event.data === "3") {
        led2.checked = false;
        console.log("lde2");
    }
    else if(event.data[0] === "h"){

        for(i = 0; i < 5; i++){
            if(event.data[i] === undefined){
                event.data = 0;
            }
        }

        tm = event.data[1]+event.data[2]+event.data[3]+event.data[4]+event.data[5];
        time.innerHTML = tm;
    }
    else if(event.data[0] === "i"){
        for(i = 0; i < 5; i++){
            if(event.data[i] === undefined){
                event.data = 0;
            }
        }
        current = event.data[1]+event.data[2]+event.data[3]+event.data[4];
        crrnt.innerHTML =  current;
    }

  }

function onLoad(event){
    initWebSocket();
    initButton();
}

function initButton(){
    const botones = document.querySelector('#switches');
    botones.addEventListener('change', toggle);
}

function toggle(event){
    const led1 = document.getElementById("led1");
    const led2 = document.getElementById("led2");
    console.log(event.target);

    if(event.target === led1){
        if(led1.checked){
            websocket.send('toggle_on');
            console.log("ON");
            //led1.disabled = false;
        }
        else{
            console.log("OFF");
            websocket.send('toggle_off');
            //led1.disabled = false;
        }
    }     

    else if(event.target === led2){
        if(led2.checked){
            console.log("ON");
            websocket.send('toggle1');
            //led1.disabled = false;
        }
        else{
            console.log("OFF");
            websocket.send('toggle1');
            //led1.disabled = false;
        }
    }       
}