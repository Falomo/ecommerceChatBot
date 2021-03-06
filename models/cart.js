module.exports = function(oldCart){
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item, id){
        let storedItem = this.items[id];
        if(!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }

        console.log("stored", storedItem)
        storedItem.qty++;
        storedItem.price = storedItem.item.Price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.Price;

    };

    this.remove = function(id){
        let deleteItem = this.items[id];
        if(deleteItem)
            delete this.items[id];
        
        this.totalQty = this.totalQty - deleteItem.qty;
        this.totalPrice -= deleteItem.price;
        console.log(this.items)
    }

    this.generateArray = function(){
        let arr = [];
        for(var id in this.items){
            arr.push(this.items[id]);
        }

        return arr;
    }
}