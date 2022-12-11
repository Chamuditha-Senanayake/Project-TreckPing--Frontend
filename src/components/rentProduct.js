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
    const { rentCart: { rentCartItems } } = state;

    const [startDate, setStartDate] = useState(Moment().add(2, 'day').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(Moment().format('YYYY-MM-DD'));
    const [reserveOrCheck, setReserveOrCheck] = useState('Reserve');
    const today = Moment().add(2, 'day').format('YYYY-MM-DD');

    const addToCartHandler = async (item) => {
        reserveOrCheck === "Reserve" ? setReserveOrCheck("Check Availability") : setReserveOrCheck("Add to cart")
        const existItem = rentCartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        const createdAt = startDate;
        const updatedAt = endDate;
        const { data } = await axios.get(`/api/products/${item._id}`);
        if (data.countInStockForRent < quantity) {
            toast.error('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({ type: 'RENT_CART_ADD_ITEM', payload: { ...item, quantity, createdAt, updatedAt } });
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
                <Form.Label className={reserveOrCheck === "Reserve" ? 'd-none' : ''}>Starting Date</Form.Label>
                <Form.Control className={reserveOrCheck === "Reserve" ? 'd-none mb-3' : 'mb-3'} type="date" format='YYYY/MM-DD' min={today} name="startingDate" placeholder="DateRange" value={startDate} onChange={(e) => setStartDate(e.target.value)}></Form.Control>
                <Form.Label className={reserveOrCheck === "Reserve" ? 'd-none' : ''}>Ending Date</Form.Label>
                <Form.Control className={reserveOrCheck === "Reserve" ? 'd-none mb-5' : 'mb-5'} type="date" min={startDate} name="endingDate" placeholder="DateRange" value={endDate > startDate ? endDate : startDate} onChange={(e) => setEndDate(e.target.value)}></Form.Control>
                {product.countInStockForRent === 0 ? (
                    <Button variant='light' disabled>Out of Stock</Button>)
                    : (reserveOrCheck === "Add to cart" ? <Button onClick={() => addToCartHandler(product)}>{reserveOrCheck}</Button> :
                        (reserveOrCheck === "Check availability" ? <Button onClick={() => setReserveOrCheck("Add to cart")}>{reserveOrCheck}</Button> : <Button onClick={() => setReserveOrCheck("Check availability")}>{reserveOrCheck}</Button>))}

            </Card.Body>
        </Card >
    )
}

export default RentProduct