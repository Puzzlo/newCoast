/**
 * Created by esskov on 15.04.2015.
 */
var socket = io.connect('http://192.168.0.67:3000', {
    reconnect: false
});
//var socket = io.connect('http://localhost:3000');
var privateRecipients = [];
var confirmRecipients = [];
var privateMessages = [];
var messagesWithConfirm = [];
var title = 'Akucha';
var newForConfirm = 0;
var arrayTabs = []; // array of tabs in private messages

window.onload = function() {

    //run_cmd( "whoami", [], function(text) { console.log (text); alert(text); });



    var simpleMessages = [];
    var nameOfUser = getCookie('nameOfUser');

    socket.on('disconnect', function () {
        console.log('disconnect client event....');
        setTimeout(reconnect, 500);
    });

    socket.emit('hello', {name: nameOfUser});

    socket.on('closeNow', function () {
        alert('Пользователь с таким ником уже сидит в чате.');
        window.location.href = '/';
    });
    socket.on('simpleMessage', function(data){
        simpleMessages.push(data.message);
        console.log('simplemessage=' + data.message);
        var html = '';
        for ( var i = 0, len = simpleMessages.length; i < len; i++){
            html += simpleMessages[i] + '<br />';
        }
        document.getElementById('mainChat__messages').innerHTML = html;
        document.getElementById('mainChat__messages').scrollTop = 9999;

    });


    // draw users, check click on checkboxes
    socket.on('drawUsers', function(data){
        var html = '<table>';
        html += '<tr><td class="third">Имя</td><td class="third">Приватно</td><td class="third">С подтверждением</td></tr>';
        for ( var user in data ) {

            if( user != nameOfUser ) {
                html += '<tr><td name="' + user + '">' + user + '</td>'
                + '<td>' + '<input type="checkbox" '
                    //+'onchange="changePrivate();">'+'</td>'
                + 'onchange="changePrivateRecipients(\'' + user + '\');">'
                     +'</td><td>'+'<input type="checkbox" class="checkbox" '
                    + 'id="confirm_' + user + '" '
                    +'onchange="changeConfirmRecipients(\'' + user + '\');">'
                +'<label for="confirm_' + user + '"></label>'
                + '</td></tr>';
            }
        }
        html += '</table>';
        usersOnline.innerHTML = html;
        users = data;

        //console.log(html);

    });

    socket.on('privateMessage', function (data) {

        console.log('time='+data.time);
        // работа с вкладками
        showTabs(data.whoSend, data.message, data.time);

        //var priv = document.getElementById('private');
        //privateMessages.push(data.message);
        //console.log('private='+privateMessages);
        //var liBegin = '<li>';
        //var liEnd = '</li>';
        //var inner = '<ul>';
        //
        //for(var i=0; i < privateMessages.length; i++){
        //    inner += liBegin + privateMessages[i] + liEnd;
        //}
        //inner += '</ul>';
        //priv.innerHTML = inner;
        //document.getElementById('private').scrollTop = 9999;
    });

    socket.on('forConfirm', function (data) {

        var list = document.getElementById('confirmReceived');
        var mB = document.createElement('li');
        mB.className = 'list-group-item';
        mB.innerHTML = 'От ' +  data.whoSend
        +  ' : '
        + data.message
        + '  <input type="button" value="Подтвердить" class = "btn__confirm" onclick = "confirm(\''
        + data.messageId + '\',\''
        + nameOfUser + '\',\''
        +  data.whoSend
        + '\');this.disabled=true;this.className = \'btn__confirm_done\';this.value=\'Подтверждено\';">';
        list.appendChild(mB);
        document.getElementById('confirmReceived').scrollTop = 9999;
        document.title = title + '(' + ++newForConfirm + ')';

    });

    socket.on('iConfirm', function (data) {

        messagesWithConfirm.forEach(function (obj) {
           if(obj.id == data.messageId) {
               obj.whoConfirm[obj.whoConfirm.length] = data.whoConfirm;
           }
        });
        console.log('messwithconf = ' + JSON.stringify(messagesWithConfirm));
        reDrawConfirmList();

    });



    //var codes = [];
    //document.onkeydown = function (e) {
    //    e = e || window.event;
    //    codes.push(String.fromCharCode(e.keyCode));
    //    console.log(codes);
    //
    //    if (codes.length == 2) {
    //        if((codes.indexOf(17)!=-1 && codes.indexOf(13))  ||  (codes.indexOf(16)!=-1 && codes.indexOf(13))) {
    //            codes = [];
    //            subm();
    //        }
    //    }
    //};
    //document.onkeyup = function(e) {
    //    codes = [];
    //};




    forma.onsubmit = function() {
        var message = document.getElementById('vvod__text');
        var idMessage = new Date().getTime().toString();
        //console.log(message.value);

        if(confirmRecipients.length) {

            var list = document.getElementById('confirmSended');
            var newLi = document.createElement('li');
            newLi.id = idMessage;
            var mess = message.value;
            console.log('confirmRecipients = ' + confirmRecipients);
            confirmRecipients.forEach(function(ppl){
                mess += '<span class="confirmRed">' + ppl + '</span>';
            });
            newLi.innerHTML = mess;
            list.appendChild(newLi);

            messagesWithConfirm.push(
                {
                    id: idMessage,
                    whoSend: nameOfUser,
                    message: message.value,
                    whoMustConfirm: confirmRecipients,
                    whoConfirm: []
                }
            );

        }

        socket.emit('sendMessageToServer',
            {
                idDate: idMessage
                , whoSend: nameOfUser
                , message: message.value
                , priv: privateRecipients
                , confirm: confirmRecipients
            });

        if(privateRecipients.length) {
            privateRecipients.forEach(function(ppl){
                showTabs(ppl, message.value, idMessage, 1);
            });
        }

        uncheckAllcheckboxes();
        document.getElementById('vvod__text').value = '';
        document.getElementById("vvod__text").focus();
        privateRecipients = [];
        confirmRecipients = [];

        return false;
    }
};


function confirm(messageId, nameOfClient, whoSend){
        socket.emit('accept',
            { id: messageId ,
            whoAskConfirm: nameOfClient,
            senderOfMessage: whoSend });
    if(--newForConfirm)
        document.title = title + '(' + newForConfirm + ')';
    else document.title = title;
}



function changePrivateRecipients(user) {
    var index = privateRecipients.indexOf(user);
    if (  index == -1 ) {
        privateRecipients.push(user);
    }else {
        privateRecipients.splice(index, 1);
    }
}

function changeConfirmRecipients(name) {
    var elem = document.getElementsByName(name);
    console.log('elem='+elem[0]);
    var index = confirmRecipients.indexOf(name);
    if(index == -1) {
        confirmRecipients.push(name);
        elem[0].style.color = "#9FD468";
        elem[0].style.fontWeight = "900";
    } else {
        confirmRecipients.splice(index, 1);
        elem[0].style.color = "black";
        elem[0].style.fontWeight = "300";
    }
}

function reDrawConfirmList(){
    var tableConf = document.getElementById('confirmSended');
    var elems = tableConf.getElementsByTagName('li');
    messagesWithConfirm.forEach(function(obj){
        for(var i= 0, len = elems.length; i<len; i++){
            if(obj.id == elems[i].id){
                //for(var j=1; j < elems[i].childNodes.length; j++) {
                //    var sp = elems[i].childNodes[j];
                //    var idWhoConf = findUserIdByName(sp.innerHTML);
                //    for ( var whoConf in obj.confirm) {
                //        if(whoConf == idWhoConf && obj.confirm[whoConf] ){
                //            if(sp.className.match(/\bconfirmRed\b/)){
                //                sp.className = ' confirmGreen';
                //            }
                //        }
                //    }
                //
                //}

                obj.whoMustConfirm.forEach(function (name) {
                    var confirmator = obj.whoConfirm.indexOf(name);
                    if( confirmator != -1 ){
                        for(var j=1; j < elems[i].childNodes.length; j++) {
                            var span = elems[i].childNodes[j];
                            if ( span.innerHTML.toString() == name ) {
                                span.classList.remove('confirmRed');
                                span.classList.add('confirmGreen');
                            }
                        }
                    }
                })

            }

        }
    });
}

function findUserIdByName(name){
    for ( var user in users){
        if (users[user].name == name) return users[user].id;
    }
}
function findUserNameById(id){
    for ( var user in users){
        if (users[user].id == id) return users[user].name;
    }
}

function uncheckAllcheckboxes(){
    var ch = document.getElementsByTagName("input");
    for(var i=0;i<ch.length;i++) {
        if (ch[i].type == 'checkbox' && ch[i].checked) ch[i].checked = !ch[i].checked;
    }
    var elem = document.getElementsByTagName("td");
    for(i=0;i<elem.length;i++) {
        if(elem[i].getAttribute('name')) {
            elem[i].style.color = "black";
            elem[i].style.fontWeight = "300";
        }
    }
}

function run_cmd(cmd, args, callBack ) {
    //var spawn = require('child-proc').spawn;
    //var child = spawn(cmd, args);
    //var resp = "";
    //
    //child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    //child.stdout.on('end', function() { callBack (resp) });
} // ()

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function sendMessage(e) {
    e = e || window.event;
    if(e.keyCode == 13 && e.ctrlKey || e.keyCode == 13 && e.shiftKey){
        document.getElementById('forma').onsubmit();
        document.getElementById("vvod__text").focus();
    }
}

function showTabs(companion, message, time, self) {
    self = self || 0;
    var im = self?' Я: ':'';
    var hours = new Date(parseInt(time)).getHours();
    var minutes = new Date(parseInt(time)).getMinutes();
    var now = '[' + hours + ':' + minutes + ']' + im;
    if(arrayTabs.indexOf(companion) == -1) {
        arrayTabs.push(companion);
        var theDiv = document.createElement('span');
        theDiv.setAttribute('id', 'tab_'+companion);
        theDiv.classList.add('private__tab');
        theDiv.innerHTML = companion;
        document.getElementById('tabs').appendChild(theDiv);
        document.getElementById('tabContent').innerHTML =  now + message;
    } else {
        document.getElementById('tabContent').innerHTML += '<br />' + now + message;
    }
}

function reconnect() {
    //socket.once('error', function () {
    //    setTimeout(reconnect, 500);
    //});
    //socket.socket.connect();
    window.location.href = '/';
}