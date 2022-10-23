import { createContext, useReducer } from "react";

export const Store = createContext();

const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,

    cart: {
        cartItems: localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : []
    }
}

const reducer = (state, action) => {
    switch (action.type) {
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
        }

        case 'CART_REMOVE_ITEM': {
            //if payload != item, then add to cartItems array. If == then remove.
            const cartItems = state.cart.cartItems.filter(
                (item) => item._id !== action.payload._id
            )
            console.log(cartItems);
            localStorage.setItem('cartItems', JSON.stringify(cartItems))
            return { ...state, cart: { ...state.cart, cartItems } }
        }

        case 'USER_SIGNIN':
            return { ...state, userInfo: action.payload };

        case 'USER_SIGNOUT':
            return { ...state, userInfo: null };

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
