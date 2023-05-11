import axios from 'axios';
import React, { useContext } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import Rating from './Rating';


//product card component
const Product = (props) => {
    const { product } = props;

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart: { cartItems } } = state;

    //add to cart button handler
    const addToCartHandler = async (item) => {
        const existItem = cartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        const { data } = await axios.get(`/api/products/${item._id}`);
        if (data.countInStock < quantity) {
            toast.error('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });
    }

    return (
        // start of the product card
        <Card className='home-card'>
            <Link to={`/product/${product.slug}`}>
                <img src={product.image} className='card-img-top cart-img card-img pt-4' alt={product.name} width='auto' height='225px' />
            </Link>
            {/* card Body */}
            <Card.Body>
                <Link to={`/product/${product.slug}`} className='card-title-link'>
                    <Card.Title className='card-title card-ttl'>{product.name}</Card.Title>
                </Link>
                {/* ratings for the product */}
                <Rating rating={product.rating} numReviews={product.numReviews} />
                <Card.Text>{product.price} LKR</Card.Text>
                {/* add to cart button displays if products are available in the stock*/}
                {product.countInStock === 0 ? (
                    <Button variant='light' disabled>Out of Stock</Button>)
                    : (<Button onClick={() => addToCartHandler(product)}>Add to cart</Button>)}

            </Card.Body>
        </Card>
    )
}

export default Product