import Axios from 'axios'
import React, { useContext, useEffect, useReducer } from 'react'
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CheckoutSteps from '../components/CheckoutSteps'
import LoadingBox from '../components/LoadingBox'
import { Store } from '../Store'
import getError from '../utils'

//reducer for handle states
const reducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_REQUEST':
            return { ...state, loading: false };
        case 'CREATE_SUCCESS':
            return { ...state, loading: true };
        case 'CREATE_FAIL':
            return { ...state, loading: false };
        default:
            return state;

    }
}


//Place Order Screen
const PlaceOrderScreen = () => {

    const navigate = useNavigate();
    const [{ loading }, dispatch] = useReducer(reducer, {
        loading: false
    });
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart, userInfo } = state;

    cart.itemsPrice = cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0);
    cart.shippingPrice = cart.itemsPrice > 62500 ? 5000 : cart.itemsPrice * 8 / 100;
    cart.totalPrice = cart.itemsPrice + cart.shippingPrice;

    const placeOrderHandler = async () => {
        try {
            dispatch({ type: 'CREATE_REQUEST' });
            //create order
            const { data } = await Axios.post(
                '/api/orders',
                {
                    orderItems: cart.cartItems,
                    shippingAddress: cart.shippingAddress,
                    paymentMethod: cart.paymentMethod,
                    itemsPrice: cart.itemsPrice,
                    shippingPrice: cart.shippingPrice,
                    totalPrice: cart.totalPrice
                },
                {
                    headers: {
                        authorization: `Bearer ${userInfo.token}`
                    },
                }
            );
            ctxDispatch({ type: 'CART_CLEAR' });
            dispatch({ type: 'CREATE_SUCCESS' });
            localStorage.removeItem('cartItems');
            localStorage.removeItem('paymentMethod');
            navigate(`/order/${data.order._id}`)

        } catch (err) {
            dispatch({ type: 'CREATE_FAIL' });
            toast.error(getError(err));
        }

    };

    useEffect(() => {
        if (!cart.paymentMethod) {
            navigate('/payment');
        }
    }, [cart, navigate])

    return (
        <div>
            <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
            <Helmet><title>Preview Order</title></Helmet>
            <h2 className='my-3'>Preview Order</h2>
            <Row>
                <Col md={8}>
                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Shipping</Card.Title>
                            <Card.Text>
                                <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                                <strong>Address:</strong> {cart.shippingAddress.address},  {cart.shippingAddress.city},  {cart.shippingAddress.postalCode}
                            </Card.Text>
                            <Link to="/shipping"><button className='mt-3 btn btn-outline-secondary'>Edit</button></Link>
                        </Card.Body>
                    </Card>
                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Payment</Card.Title>
                            <Card.Text>
                                <strong>Method:</strong> {cart.paymentMethod}
                            </Card.Text>
                            <Link to="/payment"><button className='mt-3 btn btn-outline-secondary'>Edit</button></Link>
                        </Card.Body>
                    </Card>
                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Cart Items</Card.Title>
                            <ListGroup variant='flush'>
                                {cart.cartItems.map((item) => (
                                    <ListGroup.Item key={item._id}>
                                        <Row className='align-items-center'>
                                            <Col md={8}>
                                                <img src={item.image} alt={item.name} className='img-fluid rounded img-thumbnail'></img>{' '}
                                                <Link to={`/product/${item.slug}`} className='card-title-link'>{item.name}</Link>
                                            </Col>
                                            <Col md={2}><span>{item.quantity}</span></Col>
                                            <Col md={2}>{item.price}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <Link to="/cart"><button className='mt-4 btn btn-outline-secondary'>Edit</button></Link>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Order Summary</Card.Title>
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Items</Col>
                                        <Col>{cart.itemsPrice.toFixed(2)}LKR</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col>{cart.shippingPrice.toFixed(2)}LKR</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col><strong>Order Total</strong></Col>
                                        <Col><strong>{cart.totalPrice.toFixed(2)}LKR</strong></Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <div className='d-grid'>
                                        <Button type='button' onClick={placeOrderHandler} disabled={cart.cartItems.length === 0}>Place Order</Button>
                                        {loading && <LoadingBox></LoadingBox>}
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

export default PlaceOrderScreen
