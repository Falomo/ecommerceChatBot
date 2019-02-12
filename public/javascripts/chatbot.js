

let chatContainer = document.querySelector('.chat-history');
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new SpeechRecognition();
recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    console.log(speechToText)
    document.querySelector('#message').value = speechToText;
    submitSpeech();
}

var synth = window.speechSynthesis;

function addUserChat(text){
    let date = new Date();
    chatContainer.innerHTML += `
    <div class="chat">
        <img src="/w3images/avatar_g2.jpg" alt="Avatar" class="right">
        <p>${text}</p>
        <span class="time-left">${date.getHours()}:${date.getMinutes()}</span>
    </div>
    `;
}
function addBotChat(text){
    let date = new Date();
    chatContainer.innerHTML += `
    <div class="chat darker">
        <img src="/w3images/avatar_g2.jpg" alt="Avatar">
        <p>${text}</p>
        <span class="time-left">${date.getHours()}:${date.getMinutes()}</span>
    </div>
    `;
}
function addProductChat(products){
    console.log(products);
    let date = new Date();
    let productHtml = '';
    productHtml += `
    <div class="products">`;

    for(let x = 0; x < products.length; x++){
        console.log(products[x])
        productHtml += `
         <div class="product">
           <img src="${products[x].ImagePath}" alt="Avatar">
           <p>${products[x].Name}</p>
           <p>Item ${x+1}</p>
        </div>
        `;
    }

    productHtml += `

    <span class="time-right">${date.getHours()}:${date.getMinutes()}</span>

  </div>
    `;
    console.log('productHTML', productHtml);
    chatContainer.innerHTML += productHtml;
}
function addCartChat(cart){

    let {totalPrice, items} = cart;

    console.log(totalPrice, ' -- ', items);
    let date = new Date();
    let cartHtml = ' <div class="cart darker">';
    let count = 0;
    for(let itemIndex in items){
       
        cartHtml += `
        <div class="cart-item ">
          <h5>${items[itemIndex].item.Name}</h5>
          <div class="det">
            <p>Qty: ${items[itemIndex].qty}</p>
            <p>Price: N${items[itemIndex].price}</p>
          </div>
          <p>Item ${++count}</p>
        </div>
        `;
       
    
    }
    cartHtml += `
    <div class="cart-item">
        <p>Total Price: N${totalPrice}</p>
    </div>
    <span class="time-right">${date.getHours()}:${date.getMinutes()}</span>
    </div>`;
    chatContainer.innerHTML += cartHtml;
}

function botSpeak(msg, cb){
    var synth = window.speechSynthesis;


    var text = msg;
    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    // msg.voice = voices[$('#voices').val()];
    // msg.rate = $('#rate').val() / 10;
    // msg.pitch = $('#pitch').val();
    msg.text = text;

    msg.onend = function(e) {
      cb();
      console.log('Finished in ' + event.elapsedTime + ' seconds.');
    };

    speechSynthesis.speak(msg);

}

function productSpeak(product){
    console.log(product)
    botSpeak('These are the top picks for '+ product.Keyword + '.', function(){
        product.forEach((product, i) => {
            botSpeak(`Item ${i+1}, Name: ${product.Name}, price: ${product.Price} Naira`)
        })
     })
}
function cartSpeak(cart){
    botSpeak('These are the items currently in your cart', function(){

        // let cart = {"items":{"3":{"item":{"ProductID":3,"Name":"Television","Desc":"This is a very cool tv","Price":200,"ImagePath":"/images/image2.jpg","Keyword":"television"},"qty":1,"price":200}},"totalQty":1,"totalPrice":200}
        let {items} = cart;
        console.log(items);
        let count = 0;
        for(index in items){
            let item = items[index] 
            botSpeak(`Item ${++count} , Name: ${item.item.Name}, price: ${item.price} Naira, quantity: ${item.qty}`);
        }
        botSpeak(`Total price is ${cart.totalPrice} Naira`)
      
    })
}

$('#submit').click(submitSpeech)

function submitSpeech(){
   
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
            for(name in result){
                let chatResponse = result[name];
                if(chatResponse){
                    switch(name){
                        case 'speech':
                            addBotChat(result[name])
                            botSpeak(result[name])
                            break;
                        case 'product':
                            addProductChat(chatResponse);
                            productSpeak(chatResponse)
                            console.log(chatResponse)
                            break;
                        case 'cart':
                            addCartChat(chatResponse);
                            cartSpeak(chatResponse)
                            break;
    
    
                    }
    
                }
            }
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
    }


$('#voice').click(() => {

    recognition.start();
})


function setHeader(xhr) {
    // xhr.setRequestHeader('Authorization', getToken());
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    xhr.setRequestHeader('Access-Control-Allow-Headers', 'Authorization');
    xhr.withCredentials = true

}


addUserChat('', 'Hello world');