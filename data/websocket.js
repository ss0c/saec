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
    const led3 = document.getElementById("led3")
    const time = document.getElementById("time");
    const crrnt = document.getElementById("current");
    const toma1 = document.getElementById("toma1");
    const toma2 = document.getElementById("toma2");
    const toma3 = document.getElementById("toma3");

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

    else if (event.data === "led3_on") {
        led3.checked = true;
        console.log("led3_1");
    }
    else if (event.data === "led3_off") {
        led3.checked = false;
        console.log("led3_0");
    }


//TomaS
    else if (event.data === "toma1_on") {
        toma1.checked = true;
        console.log("toma11");
    }
    else if (event.data === "toma1_off") {
        toma1.checked = false;
        console.log("toma10");
    }

    else if (event.data === "toma2_on") {
        toma2.checked = true;
        console.log("toma21");
    }
    else if (event.data === "toma2_off") {
        toma2.checked = false;
        console.log("toma11");
    }

    else if (event.data === "toma3_on") {
        toma3.checked = true;
        console.log("toma31");
    }
    else if (event.data === "toma3_off") {
        toma3.checked = false;
        console.log("toma32");
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
    
  //Luces

  }

function onLoad(event){
    initWebSocket();
    initButton();
}

function getTime(){
    const iTime = document.getElementById("iTime");
    start_time = iTime.value;
    websocket.send("i" + start_time);
}

function getFTime(){
    const FTime = document.getElementById("FTime");
    final_time = FTime.value;
    websocket.send("f" + final_time);
}


function initButton(){
    const botones = document.querySelector('#switches');
    botones.addEventListener('change', toggle);
}

function toggle(event){
    const led1 = document.getElementById("led1");
    const led2 = document.getElementById("led2");
    const toma1 = document.getElementById("toma1");
    const toma2 = document.getElementById("toma2");
    const toma3 = document.getElementById("toma3");
    const led3 = document.getElementById("led3");

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
            websocket.send('toggle1_on');
            //led1.disabled = false;
        }
        else{
            console.log("OFF");
            websocket.send('toggle1_off');
            //led1.disabled = false;
        }
    }   

    else if(event.target === led3){
        if(led3.checked){
            console.log("ON");
            websocket.send('toggle3_on');
            //led1.disabled = false;
        }
        else{
            console.log("OFF");
            websocket.send('toggle3_off');
            //led1.disabled = false;
        }
    }
    
    
    else if(event.target === toma1){
        if(toma1.checked){
            console.log("ON");
            websocket.send('toma1_on');
            //led1.disabled = false;
        }
        else{
            console.log("OFF");
            websocket.send('toma1_off');
            //led1.disabled = false;
        }
    }

    else if(event.target === toma2){
        if(toma2.checked){
            console.log("ON");
            websocket.send('toma2_on');
            //led1.disabled = false;
        }
        else{
            console.log("OFF");
            websocket.send('toma2_off');
            //led1.disabled = false;
        }
    }

    else if(event.target === toma3){
        if(toma3.checked){
            console.log("ON");
            websocket.send('toma3_on');
            //led1.disabled = false;
        }
        else{
            console.log("OFF");
            websocket.send('toma3_off');
            //led1.disabled = false;
        }
    }

    
}