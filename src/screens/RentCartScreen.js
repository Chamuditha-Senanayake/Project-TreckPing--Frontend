import React, { useContext } from 'react';
import { Row, Col, ListGroup, Button, Card, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

//Rent Cart Screen
const RentCartScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { rentCart: { rentCartItems } } = state;

    //get product by id
    const updateCartHandler = async (item, quantity) => {
        const { data } = await axios.get(`/api/products/${item._id}`);
        if (data.countInStockForRent < quantity) {
            toast.error('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({ type: 'RENT_CART_ADD_ITEM', payload: { ...item, quantity } });
    }

    const removeItemHandler = (item) => {
        ctxDispatch({ type: 'RENT_CART_REMOVE_ITEM', payload: item });
    }

    const checkoutHandler = () => {
        navigate('/signin?redirect=/pickuplocation')
    }

    return (
        <div>
            <Helmet>
                <title>Shopping Cart</title>
            </Helmet>
            <h2 className="mb-4 mt-5">Shopping Cart</h2>
            <Row>
                <Col md={8}>
                    {rentCartItems.length === 0 ? (
                        <MessageBox>
                            Cart is empty. <Link to="/rent"> Shop Now</Link>
                        </MessageBox>
                    ) :
                        (
                            <ListGroup>
                                {rentCartItems.map((item) => (
                                    <ListGroup.Item key={item._id}>
                                        <Row className='align-items-center'>
                                            <Col md={2}>
                                                <img src={item.image} alt={item.name} className='img-fluid rounded img-thumbnail' />{' '}

                                            </Col>
                                            <Col md={3}><Link to={`/product/${item.slug}`} className='card-title-link'><span className='cart-item-name'>{item.name}</span></Link></Col>
                                            <Col md={2}><Form.Label >From</Form.Label><Form.Control type="date" name="startingDate" className='form-control-sm' placeholder="DateRange" value={item.pickupDate} ></Form.Control></Col>
                                            <Col md={2}><Form.Label >To</Form.Label><Form.Control type="date" name="endingDate" className='form-control-sm' placeholder="DateRange" value={item.returnDate} ></Form.Control></Col>
                                            <Col md={2}>
                                                <Button onClick={() => updateCartHandler(item, item.quantity - 1)} variant='light' disabled={item.quantity === 1}>
                                                    <i className='fas fa-minus-circle'></i>
                                                </Button>{' '}
                                                <span>{item.quantity}</span>{' '}
                                                <Button onClick={() => updateCartHandler(item, item.quantity + 1)} variant='light' disabled={item.quantity === item.countInStockForRent}>
                                                    <i className='fas fa-plus-circle'></i>
                                                </Button>{' '}
                                            </Col>
                                            <Col md={1}>
                                                <Button onClick={() => removeItemHandler(item)} variant='light'>
                                                    <i className='fas fa-trash'></i>
                                                </Button>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body >
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <h4>
                                        Subtotal ({rentCartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                                        items) :  {' '}
                                        {rentCartItems.reduce((a, c) => a + c.rent * c.quantity * (moment(c.returnDate).diff(c.pickupDate, 'days') != 0 ? moment(c.returnDate).diff(c.pickupDate, 'days') : 1), 0)} LKR
                                    </h4>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <div className='d-grid'>
                                        <Button onClick={checkoutHandler} type='button' variant='primary' disabled={rentCartItems.length === 0}> Proceed to Checkout </Button>
                                    </div>
                                </ListGroup.Item>
                            </ListGroup>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default RentCartScreen
