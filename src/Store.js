import { createContext, useReducer } from "react";

export const Store = createContext();

const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,

    cart: {
        shippingAddress: localStorage.getItem('shippingAddress')
            ? JSON.parse(localStorage.getItem('shippingAddress'))
            : {},

        paymentMethod: localStorage.getItem('paymentMethod')
            ? JSON.parse(localStorage.getItem('paymentMethod'))
            : '',

        cartItems: localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : [],
    },

    rentCart: {
        deliveryAddress: localStorage.getItem('deliveryAddress')
            ? JSON.parse(localStorage.getItem('deliveryAddress'))
            : {},

        paymentMethod: localStorage.getItem('paymentMethod')
            ? JSON.parse(localStorage.getItem('paymentMethod'))
            : '',

        rentCartItems: localStorage.getItem('rentCartItems')
            ? JSON.parse(localStorage.getItem('rentCartItems'))
            : [],
    }
}

const reducer = (state, action) => {
    switch (action.type) {
        //cart
        case 'CART_ADD_ITEM': {
            //Add cart item
            //check wheather the item is new item or existing item 
            const newItem = action.payload;
            const existItem = state.cart.cartItems.find(
                (item) => item._id === newItem._id
            );

            //update the cartitems variable according to existence of items in the cart
            const cartItems = existItem ? state.cart.cartItems.map((item) => item._id === existItem._id ? newItem : item) : [...state.cart.cartItems, newItem];

            //Save cart details in the local storage
            localStorage.setItem('cartItems', JSON.stringify(cartItems))
            return { ...state, cart: { ...state.cart, cartItems } }
        };

        case 'CART_REMOVE_ITEM': {
            //if payload != item, then add to cartItems array. If == then remove.
            const cartItems = state.cart.cartItems.filter(
                (item) => item._id !== action.payload._id
            )
            console.log(cartItems);
            localStorage.setItem('cartItems', JSON.stringify(cartItems))
            return { ...state, cart: { ...state.cart, cartItems } }
        };

        case 'CART_CLEAR':
            return { ...state, cart: { ...state.cart, cartItems: [] } }

        //rent cart
        case 'RENT_CART_ADD_ITEM': {
            //Add cart item
            //check wheather the item is new item or existing item 
            const newItem = action.payload;
            const existItem = state.rentCart.rentCartItems.find(
                (item) => item._id === newItem._id
            );

            //update the cartitems variable according to existence of items in the cart
            const rentCartItems = existItem ? state.rentCart.rentCartItems.map((item) => item._id === existItem._id ? newItem : item) : [...state.rentCart.rentCartItems, newItem];

            //Save cart details in the local storage
            localStorage.setItem('rentCartItems', JSON.stringify(rentCartItems))
            return { ...state, rentCart: { ...state.rentCart, rentCartItems } }
        };

        case 'RENT_CART_REMOVE_ITEM': {
            //if payload != item, then add to cartItems array. If == then remove.
            const rentCartItems = state.rentCart.rentCartItems.filter(
                (item) => item._id !== action.payload._id
            )
            console.log(rentCartItems);
            localStorage.setItem('rentCartItems', JSON.stringify(rentCartItems))
            return { ...state, rentCart: { ...state.rentCart, rentCartItems } }
        };

        case 'RENT_CART_CLEAR':
            return { ...state, rentCart: { ...state.rentCart, rentCartItems: [] } }


        //signin
        case 'USER_SIGNIN':
            return { ...state, userInfo: action.payload };

        //signout
        case 'USER_SIGNOUT':
            return {
                ...state,
                userInfo: null,
                cartItems: [],
                rentCartItems: [],
                shippingAddress: {},
                deliveryAddress: {},
                paymentMethod: ''
            };

        case 'SAVE_SHIPPING_ADDRESS':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    shippingAddress: action.payload
                }
            };

        case 'SAVE_DELIVERY_ADDRESS':
            return {
                ...state,
                rentCart: {
                    ...state.rentCart,
                    deliveryAddress: action.payload
                }
            };

        case 'SAVE_PAYMENT_METHOD':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    paymentMethod: action.payload
                },
                rentCart: {
                    ...state.rentCart,
                    paymentMethod: action.payload
                }
            };

        default:
            return state;
    }
}

// const StoreProvider = (props) => {
//     const [state, dispatch] = useReducer(reducer, initialState);
//     const value = { state, dispatch };
//     return <Store.provider value={value}>{props.children}</Store.provider>
// }

// export default StoreProvider;

export function StoreProvider(props) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const value = { state, dispatch };
    return <Store.Provider value={value}>{props.children}</Store.Provider>
}
