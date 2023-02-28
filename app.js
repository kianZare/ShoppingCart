const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal  = document.querySelector(".cart-item-confirm");

const productsDOM =document.querySelector(".products-center");
const cartTotal =document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-item");
const cartContent = document.querySelector(".cart-content")
const clearCart = document.querySelector(".clear-cart")


import { productsData } from "./products.js";

let cart = [];
// 1.get products
class Products{
    getProducts() {
        return productsData;
    }
}

let buttonsDOM = [];

// 2. display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach((item) => {
            result += `
            <section class="product">
            <div class="img-container">
                <img class="product-img" src="${item.imageUrl}" alt="p -1">
            </div>
            <div class="product-desc">
                <p class="product-title">${item.title}</p>
                <p class="product-price">£ ${item.price}</p>
            </div>
            <button class="add-to-cart" data-id=${item.id}><i class="fas fa-cart-plus">&nbsp&nbsp</i>add to cart</button>
        </section>
            `;
            productsDOM.innerHTML = result;
        });
    };
    getAddToCartBtns() {
        const addTocartBtns = [...document.querySelectorAll(".add-to-cart")];
        buttonsDOM = addTocartBtns;
        
        addTocartBtns.forEach((btn) => {
            const id = btn.dataset.id;
            // check if this product id is in cart or not ! ;
            const isInCart = cart.find((p) => p.id === parseInt(id));
            if (isInCart){
                btn.innerText = "In Cart";
                btn.disabled = true;
            }
            btn.addEventListener("click", (event) =>{
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from products
                const addedProduct = { ...Storage.getproduct(id), quantity:1};
                // add to cart

                cart = [...cart, addedProduct];
                // save cart to local storage
                Storage.saveCart(cart);
                // update cart value
                this.setCartValue(cart);
                // add to cart item
                this.addCartItem(addedProduct);
                // get cart from storage
            });
        });
    }
    setCartValue(cart){
        // 1. cart items:
        // 2. cart total price


        let tempCartItems = 0;
        const totalPrice = cart.reduce((acc, curr) => {
            tempCartItems += curr.quantity;
            return acc + (curr.quantity * curr.price);
        }, 0);
        // console.log(totalPrice)
        cartTotal.innerText = `Total Price : £  ${totalPrice.toFixed(2)}`;
        cartItems.innerText = tempCartItems;
    }
    addCartItem(cartItem) {
        const div = document.createElement("div");
        div.classList.add("cart-items");
        div.innerHTML = `
            <img class="cart-item-img" src=${cartItem.imageUrl} alt="bed"/>
            <div class="cart-item-desc">
                <h4>${cartItem.title}</h4>
                <h5>£ ${cartItem.price}</h5>
            </div>
            <div class="cart-item-conteoller">
                <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
                <p>${cartItem.quantity}</p>
                <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
            </div>
            <i class="far fa-trash-alt" data-id=${cartItem.id}></i>
    `;
    cartContent.appendChild(div);
    }
    setupApp() {
        // get cart from storage
        cart = Storage.getCart() || [];
        // addCartItem
        cart.forEach((cartItem) => this.addCartItem(cartItem))
        this.setCartValue(cart);
    }
    cartLogic () {
        // clear cart
        clearCart.addEventListener("click", () => this.clearCart());


        // cart functionality
        cartContent.addEventListener('click', (event) => {
            // console.log(event)
            if(event.target.classList.contains("fa-chevron-up")){
                console.log(event.target.dataset.id);
                const addQuantity = event.target;
                // 1. get item from cart
                const addedItem = cart.find((cItem) => cItem.id == addQuantity.dataset.id);
                addedItem.quantity++;
                // 2. update cart value
                this.setCartValue(cart);
                // 3. save cart
                Storage.saveCart(cart);
                // 4.update cart item in UI :
                addQuantity.nextElementSibling.innerText = addedItem.quantity;

            }else if(event.target.classList.contains("fa-trash-alt")) {
                const removeItem = event.target;
                const _removeItem = cart.find((c) => c.id == removeItem.dataset.id );
                this.removeItem(_removeItem.id);
                Storage.saveCart(cart);
                cartContent.removeChild(removeItem.parentElement);

            }else if(event.target.classList.contains("fa-chevron-down")) {
                const subQuantity = event.target;
                const substractedItem = cart.find((c) => c.id == subQuantity.dataset.id );
                if (substractedItem.quantity === 1) {
                    cartContent.removeChild(subQuantity.parentElement.parentElement);
                }
                substractedItem.quantity--;
                this.setCartValue(cart);
                Storage.saveCart(cart);
                subQuantity.previousElementSibling.innerText = substractedItem.quantity;
            }

        });

    }
    clearCart() {
        // remove: (DRY) =>
        cart.forEach((cItem) => this.removeItem(cItem.id));
        // remove cart content children :
        while(cartContent.children.length){
            cartContent.removeChild(cartContent.children[0]);
        }
        closeModalFunction();
    }
    removeItem(id) {
        // update cart
        cart = cart.filter((cItem) => cItem.id !== parseInt(id));
        // total price and cart items
        this.setCartValue(cart);
        // update storage
        Storage.saveCart(cart);
        // get add to cart btns => update text and disable
        this.getSingleButton(id);
    }
    getSingleButton(id) {
        const button = buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
        button.innerText  = "add to cart";
        buttonsDOM.disabled = false;
    }
}

// 3. storage

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getproduct(id) {
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find((p) => p.id === parseInt(id));
    }
    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return JSON.parse(localStorage.getItem("cart"));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const products = new Products();
    const productsData = products.getProducts();
    // set up :get cart and set up app
    const ui = new UI();
    ui.setupApp();
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    ui.cartLogic()
    Storage.saveProducts(productsData);

    // console.log(productsData);
})

// cart item module
function showModalFunction () {
    backDrop.style.display = "block";
    cartModal.style.opacity = "1";
    cartModal.style.top = "15%";
};

function closeModalFunction () {
    backDrop.style.display = "none";
    cartModal.style.opacity = "0";
    cartModal.style.top = "100%";
};

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);
