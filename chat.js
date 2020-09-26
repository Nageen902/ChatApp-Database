var currentUserkey = '';
var chatKey = '';

document.addEventListener('keydown' , function (key) {
    if (key.which === 13) {
      sendMessage();
    } 
});
///////////////////////////////////////////////////////
function ChangeSendIcon(control) {
    if (control.value !== '') {
        document.getElementById('Send').removeAttribute('style');
        document.getElementById('audio').setAttribute('style', 'display:none','innerwidth');
        
    }
    else{
        document.getElementById('audio').removeAttribute('style');
        document.getElementById('Send').setAttribute('style', 'display:none');
        
    }
}
//////////////////////////////////////////
//audio record

let chunks = [];
let recorder;
var timeout;
function record(control){
    let device = navigator.mediaDevices.getUserMedia({audio: true});
    device.then(stream => {
        if (recorder === undefined) {
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => {
                chunks.push(e.data);
        
            if (recorder.state === 'inactive'){
                let blob =new Blob(chunks,{type:'audio/webm'});
                //document.getElementById('audio').innerHTML = '<source src="' + URL.createObjectURL(blob) + '" type = "video/webm" />'; //,
        
                var reader = new FileReader();
        
                reader.addEventListener("load", function(){
                   var chatMessage = { 
                       userId: currentUserkey,
                       msg: reader.result, 
                       msgType: 'audio',
                       dateTime: new Date().toLocaleString()                                                                        
          }; 
          
          firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error){
              if (error) alert(error);
              else{
          
                        document.getElementById('textMessage').value = '';
                        document.getElementById('textMessage').focus();
             
              }
          });
                }, false);
                    reader.readAsDataURL(blob);
                
            }
          }
          recorder.start();
          control.setAttribute('class', 'fa fa-stop fa-2x');
        }
    });
    if(recorder !== undefined){
        if(control.getAttribute('class').indexOf('stop') !== -1) {
            recorder.stop();
            control.setAttribute('class', 'fa fa-microphone fa-2x');
        }
        else{
            chunks =[]; 
            recorder.start();
             control.setAttribute('class', 'fa fa-stop fa-2x');
        }
    }
    
}


/////////////////////////////////////////////////
function startchat(friendkey, friendNmae, friendPhoto){
var friendList = {friendId: friendkey, userId: currentUserkey };

    var db = firebase.database().ref('friend_list');
    var flag = false;
    db.on('value', function(friends){
        friends.forEach(function (data)  {
            var user = data.val();
            if ((user.friendId === friendList.friendId && user.userId === friendList.userId) || ((user.friendId === friendList.userId && user.userId === friendList.friendId))){
                flag = true;
                chatKey = data.key;
            }
        });
        if (flag === false) {
            chatKey = firebase.database().ref('friend_list').push(friendList, function(error){
                if (error) alert(error);
                else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('divstart').setAttribute('style','display:none');
                    hidechatlist();
                }
            }).getKey();
        }
        else{
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('divstart').setAttribute('style','display:none');
            
            hidechatlist();
        }
        ///////////////
        // display friend name and photo
        
        document.getElementById('divChatNmae').innerHTML = friendNmae;
        document.getElementById('imgChat').src = friendPhoto;

        document.getElementById('messages').innerHTML = '';

        
        document.getElementById('textMessage').value = '';
        document.getElementById('textMessage').focus();

        ////////////////////
        // display The chat messages

        loadChatMessages(chatKey, friendPhoto);

    });   
}

///////////////////////

function  loadChatMessages(chatKey, friendPhoto) {
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function (chats){
        var messageDisplay = '';
         chats.forEach(function (data) {
            var chat = data.val();
            var dateTime = chat.dateTime.split(",");  
            var msg = '';
            if (chat.msgType === 'image') {
                msg = `<img src='${chat.msg}' class="img-fluid" />`;
            }
            else if(chat.msgType === 'audio')
            {
                msg = `<audio controls style="width: 220px"; >
                         <source src="${chat.msg}" type="video/webm" />
                         </audio>`;
            }
            else{
                msg = chat.msg;
            }
            if (chat.userId !== currentUserkey){
                messageDisplay += `<div class="row">  
                        <div class="col-2 col-sm-1 col-md-1">
                            <img src="${friendPhoto}" alt="Chat pic" class="rounded-circle chat-pic">
                        </div>
                        <div class="col-7 col-sm-7 col-md-7">
                            <p class="receive">
                            ${msg}
                            <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span></p>
                        </div>
                    </div>`;

            }
            else{
                messageDisplay += `<div class="row justify-content-end">                        
                <div class="col-7 col-sm-7 col-md-7">
                <p class="sent float-right">
                ${msg}
               <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span></p>
               </div>
               <div class="col-2 col-sm-1 col-md-1">
              <img src="${firebase.auth().currentUser.photoURL}" alt="Chat pic" class="rounded-circle chat-pic">
               </div>
               </div>`;
            }
         });
         document.getElementById('messages').innerHTML = messageDisplay;
         document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    });
}

// show chat list
function showchartlist(){
    document.getElementById('side-1').classList.remove('d-none', 'd-md-block');
    document.getElementById('side-2').classList.add('d-none');
}

//hide chat list
function hidechatlist(){
    document.getElementById('side-1').classList.add('d-none', 'd-md-block');
    document.getElementById('side-2').classList.remove('d-none');
}

//send Messege 


function sendMessage() {
    var chatMessage = { 
        userId: currentUserkey,
        msg: document.getElementById('textMessage').value,  
        msgType: 'normal',
        dateTime: new Date().toLocaleString()                                                                        
}; 

firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error){
    if (error) alert(error);
    else{
//     var message = `<div class="row justify-content-end">                        
//         <div class="col-7 col-sm-7 col-md-7">
//           <p class="sent float-right">
//            ${document.getElementById('textMessage').value}
//             <span class="time float-right"> 1:28 PM</span></p>
//          </div>
// <div class="col-2 col-sm-1 col-md-1">
// <img src="${firebase.auth().currentUser.photoURL}" alt="Chat pic" class=" rounded-circle chat-pic">
// </div>
// </div>`;

// document.getElementById('messages').innerHTML += message;
document.getElementById('textMessage').value = '';
document.getElementById('textMessage').focus();

// document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    }
});
}

//////////////////////////////////
//send Image

function ChooseImage() {
    document.getElementById('imageFile').click();
}

function SendImage(event) {
    var file = event.files[0];

    if (!file.type.match("image.*")) {
        alert("Please select image only.");
    }
    else{
      var reader = new FileReader();

      reader.addEventListener("load", function(){
         var chatMessage = { 
             userId: currentUserkey,
             msg: reader.result, 
             msgType: 'image',
             dateTime: new Date().toLocaleString()                                                                        
}; 

firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error){
    if (error) alert(error);
    else{

              document.getElementById('textMessage').value = '';
              document.getElementById('textMessage').focus();
   
    }
});
 }, false);

      if (file) {
          reader.readAsDataURL(file);
      }
    }
}


///////////////////////////////////////////////////
function loadChatList() {
    var db = firebase.database().ref('friend_list');
    db.on('value', function (lists){
        document.getElementById('lstChat').innerHTML = `<li class="list-group-item" id="list">
                                        <input type="text" placeholder="Search on new chat" class="form-control form-rounded">
                                    </li>`;
        lists.forEach(function (data){
            var lst = data.val();
            var friendkey = '';
            if(lst.friendId === currentUserkey){
                friendkey = lst.userId;
            }

            else if(lst.userId === currentUserkey){
                friendkey = lst.friendId;
            }

            if (friendkey !== " "){
                firebase.database().ref('users').child(friendkey).on('value', function (data){
                    var user = data.val();
                    document.getElementById('lstChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="startchat('${data.key}', '${user.name}', '${user.photoURL}')">
                    <div class="row">
                    <div class="col-md-2">
                        <img src="${user.photoURL}" alt="Chat pic" class="rounded-circle friend-pic">
                    </div>
                    <div class="col-md-10" style="cursor:pointer">
                        <div class="name">${user.name}</div>
                        <div class="under-name">This is some message text...</div>
                    </div>
                    </div>
                </li>`;
    
                });
            }   
        });
    });
}

// Conguration
//google

function PopulateFriendList() {

    document.getElementById('lstFriend').innerHTML =`<div class="text-center">
                                                        <span class="spinner-border"></span>
                                                        <i class="fa fa-circle-o-notch fa-spin" style="font-size:70px; margin-top:5%;color:blue;"></i>
                                                    </div>`;
        var db = firebase.database().ref('users');
        var lst = '';
        db.on('value', function (users){
            if (users.hasChildren()){
                lst = `<li class="list-group-item" id="list">
                <input type="text" placeholder="Search on new chat" class="form-control form-rounded">
            </li>`;
            }
            users.forEach(function (data){
                var user = data.val();
                if (user.email !== firebase.auth().currentUser.email){
                    lst += `<li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="startchat('${data.key}', '${user.name}', '${user.photoURL}')">
                    <div class="row">
                    <div class="col-md-2">
                        <img src="${user.photoURL}" class=" rounded-circle friend-pic" />
                    </div>
                    <div class="col-md-10" style="cursor:pointer;">
                        <div class="name">${user.name}</div>
                    </div>
                    </div>
                </li>`;
                }
                 
            });
            document.getElementById('lstFriend').innerHTML = lst;
        });   
}        

 function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        
        var token = result.credential.accessToken;
      
        var user = result.user;
        // ...
      }).catch(function(error) {
    
        var errorCode = error.code;
        var errorMessage = error.message;
       
        var email = error.email;
       
        var credential = error.credential;
        // ...
      });
 }

 function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
}

function onFirebaseStateChanged(){
    firebase.auth().onAuthStateChanged(onStateChanged);
}

function onStateChanged(user){
    if (user){
        //alert (firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName);
        
         var userProfile = { email:"", name:"", photoURL:""};
         userProfile.email = firebase.auth().currentUser.email; 
         userProfile.name = firebase.auth().currentUser.displayName;
         userProfile.photoURL = firebase.auth().currentUser.photoURL;
          
        var db = firebase.database().ref('users');
        var flag = false;
        db.on('value', function (users){
            users.forEach(function (data){
                var user = data.val();
                if (user.email === userProfile.email) {
                    currentUserkey = data.key;
                    flag = true; 
                }
                  
            });
            
            if (flag === false) {
                firebase.database().ref('users').push(userProfile, callback);
            }
            else{
                document.getElementById('imgprofile').src = firebase.auth().currentUser.photoURL;
                document.getElementById('imgprofile').title = firebase.auth().currentUser.displayName;
                document.getElementById('lnkSignIn').style = 'display:none';
                document.getElementById('lnkSignOut').style = '';
            }
            
        document.getElementById('lnkNewChat').classList.remove('disabled');
        
        loadChatList();

        });   
    }
    else {
        document.getElementById('imgprofile').src = 'images/PP.jpg';
        document.getElementById('imgprofile').title = '';

        document.getElementById('lnkSignIn').style = '';
        document.getElementById('lnkSignOut').style = 'display:none';

        document.getElementById('lnkNewChat').classList.add('disabled');
    }
}

 function callback(error){
     if (error){
         alert(error);
    }
     else{
         document.getElementById('imgprofile').src = firebase.auth().currentUser.photoURL;
         document.getElementById('imgprofile').title = firebase.auth().currentUser.displayName;
         document.getElementById('lnkSignIn').style = 'display:none';
         document.getElementById('lnkSignOut').style = '';
     }
 }

/////
// call auth state changed 
 
onFirebaseStateChanged();