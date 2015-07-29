/**
 * Created by esskov on 15.04.2015.
 */
var socket = io.connect('http://localhost:3000');

window.onload = function() {
    socket = io.connect('http://localhost:3000');

    //run_cmd( "whoami", [], function(text) { console.log (text); alert(text); });


    var simpleMessages = [];
    var nameOfUser = getCookie('nameOfUser');
    socket.emit('hello', {name: nameOfUser});
    socket.on('simpleMessage', function(data){
        simpleMessages.push(data.message);
        var html = '';
        for ( var i = 0, len = simpleMessages.length; i < len; i++){
            html += simpleMessages[i] + '<br />';
        }
        document.getElementById('simple').innerHTML = html;
    });


    // draw users, check click on checkboxes
    socket.on('drawUsers', function(data){
        var html = '<table>';
        html += '<tr><td>Имя</td><td>Отослать</td><td>С подтверждением</td><tr>';
        for ( var user in data ) {
            html += '<tr><td>' + data[user] + '</td>'
            +'<td>'+'<input type="checkbox" '
            //+'onchange="changePrivate();">'+'</td>'
            +'onchange="changePrivateRecipients(\''+data[user].id + '\');">'+'</td>'
            +'<td>'+'<input type="checkbox" class="checkbox checkbox-primary" '
            +'onchange="changeConfirmRecipients(\''+data[user].id+'\', \'' + data[user].name + '\');">'+'</td>'
            +'</td></tr>';
        }
        html += '</table>';
        usersOnline.innerHTML = html;
        users = data;

        //console.log(html);

    });

    forma.onsubmit = function () {
        var message = document.getElementById('textOfMessage');
        //console.log(message.value);
        var idMessage = new Date().getTime().toString();
        socket.emit('sendMessageToServer', {
                                            idDate: idMessage,
                                            WhoSend: nameOfUser,
                                            message: message.value
                                            //priv: privateRecipients,
                                            //confirm: confirmRecipients
                                            });

        //console.log('messages = '+ JSON.stringify(messages));

        document.getElementById('textOfMessage').value = '';

        return false;
    };
};


function confirm(messageId, id){
        socket.emit('accept',
            {whoConfirmId: socket.id,
            whoAskConfirmId: id,
            messageId: messageId });
}



function changePrivateRecipients(id) {
    var index = privateRecipients.indexOf(id);
    if (  index == -1 ) {
        privateRecipients.push(id);
    }else {
        privateRecipients.splice(index, 1);
    }
}

function changeConfirmRecipients(id, name) {
    var index = confirmRecipients[id];
    if(index != undefined)
        delete confirmRecipients[id];
    else {
        confirmRecipients[id] = false;
    }
}

function reDrawConfirmList(){
    var tableConf = document.getElementById('confirmSended');
    var elems = tableConf.getElementsByTagName('li');
    messagesWithConfirm.forEach(function(obj){
        for(var i= 0, len = elems.length; i<len; i++){
            if(obj.idDate == elems[i].id){
                for(var j=1; j < elems[i].childNodes.length; j++) {
                    var sp = elems[i].childNodes[j];
                    var idWhoConf = findUserIdByName(sp.innerHTML);
                    for ( var whoConf in obj.confirm) {
                        if(whoConf == idWhoConf && obj.confirm[whoConf] ){
                            if(sp.className.match(/\bconfirmRed\b/)){
                                sp.className = ' confirmGreen';
                            }
                        }
                    }

                }

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
}

function run_cmd(cmd, args, callBack ) {
    //var spawn = require('child-proc').spawn;
    //var child = spawn(cmd, args);
    //var resp = "";
    //
    //child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    //child.stdout.on('end', function() { callBack (resp) });
} // ()

// РІРѕР·РІСЂР°С‰Р°РµС‚ cookie СЃ РёРјРµРЅРµРј name, РµСЃР»Рё РµСЃС‚СЊ, РµСЃР»Рё РЅРµС‚, С‚Рѕ undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}