import axios from 'axios';
import React, { useContext, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import Rating from './Rating';
import Moment from 'moment';

const RentProduct = (props) => {
    const { product } = props;

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart: { cartItems } } = state;

    const [startDate, setStartDate] = useState(Moment().add(2, 'day').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(Moment().format('YYYY-MM-DD'));
    const today = Moment().add(2, 'day').format('YYYY-MM-DD');

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
        <Card className='home-card'>
            <Link to={`/product/${product.slug}`}>
                <img src={product.image} className='card-img-top cart-img card-img pt-4' alt={product.name} width='auto' height='225px' />
            </Link>
            <Card.Body>
                <Link to={`/product/${product.slug}`} className='card-title-link'>
                    <Card.Title className='card-title card-ttl'>{product.name}</Card.Title>
                </Link>
                <Rating rating={product.rating} numReviews={product.numReviews} />
                <Card.Text>{product.rent} LKR per day</Card.Text>
                <hr className='mt-5' />
                <Form.Label >Starting Date</Form.Label>
                <Form.Control className='mb-3' type="date" format='YYYY/MM-DD' min={today} name="startingDate" placeholder="DateRange" value={startDate} onChange={(e) => setStartDate(e.target.value)}></Form.Control>
                <Form.Label>Ending Date</Form.Label>
                <Form.Control className='mb-5' type="date" min={startDate} name="endingDate" placeholder="DateRange" value={endDate} onChange={(e) => setEndDate(e.target.value)}></Form.Control>
                {product.countInStockForRent === 0 ? (
                    <Button variant='light' disabled>Out of Stock</Button>)
                    : (<Button onClick={() => addToCartHandler(product)}>Reserve</Button>)}

            </Card.Body>
        </Card>
    )
}

export default RentProduct