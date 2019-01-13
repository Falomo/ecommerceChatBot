

let chatContainer = document.querySelector('.chat-history');

function addUserChat(text){
    let date = new Date();
    chatContainer.innerHTML += `
    <div class="chat darker">
        <img src="/w3images/avatar_g2.jpg" alt="Avatar" class="right">
        <p>${text}</p>
        <span class="time-left">${date.getHours()}:${date.getMinutes()}</span>
    </div>
    `;
}

$('#submit').click(() =>{
    let message = document.querySelector('#message').value;
    addUserChat(message);

    // $.get("/chat/"+message, function(data, status, xhr){
    //     setHeader(xhr);
    //     alert("Data: " + data + "\nStatus: " + status);
    //   });

      $.ajax({url: "/chat/"+message,
      xhrFields: {
        withCredentials: true
     }
      ,
      success: function(result){
        $("#div1").html(result);
      }});

    //   fetch("/chat/"+message, {
    //     credentials: 'include'
    // }).then((response) => {
    //     if (response.status >= 400) {
    //         console.log(response.status);
    //     }
    //     return response.json();
    // }).then((json) => {
    //     console.log(json); 
    //     //do something
    // });
})


function setHeader(xhr) {
    // xhr.setRequestHeader('Authorization', getToken());
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    xhr.setRequestHeader('Access-Control-Allow-Headers', 'Authorization');
    xhr.withCredentials = true

}


addUserChat('', 'Hello world');