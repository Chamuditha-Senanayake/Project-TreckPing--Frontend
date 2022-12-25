import Axios from 'axios'
import moment from 'moment'
import React, { useContext, useEffect, useReducer } from 'react'
import { Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CheckoutSteps from '../components/CheckoutSteps'
import LoadingBox from '../components/LoadingBox'
import { Store } from '../Store'
import getError from '../utils'


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

const MakeReservationScreen = () => {

    const navigate = useNavigate();
    const [{ loading }, dispatch] = useReducer(reducer, {
        loading: false
    });
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { rentCart, userInfo } = state;

    //const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
    rentCart.itemsPrice = rentCart.rentCartItems.reduce((a, c) => a + c.rent * c.quantity * (moment(c.returnDate).diff(c.pickupDate, 'days') != 0 ? moment(c.returnDate).diff(c.pickupDate, 'days') : 1), 0);
    rentCart.shippingPrice = rentCart.itemsPrice > 62500 ? 5000 : rentCart.itemsPrice * 8 / 100;
    rentCart.totalPrice = rentCart.itemsPrice + rentCart.shippingPrice;

    const placeOrderHandler = async () => {
        try {
            dispatch({ type: 'CREATE_REQUEST' });
            const { data } = await Axios.post(
                '/api/reservations',
                {
                    orderItems: rentCart.rentCartItems,
                    shippingAddress: rentCart.deliveryAddress,
                    paymentMethod: rentCart.paymentMethod,
                    itemsPrice: rentCart.itemsPrice,
                    shippingPrice: rentCart.shippingPrice,
                    totalPrice: rentCart.totalPrice
                },
                {
                    headers: {
                        authorization: `Bearer ${userInfo.token}`
                    },
                }
            );
            ctxDispatch({ type: 'RENT_CART_CLEAR' });
            dispatch({ type: 'CREATE_SUCCESS' });
            localStorage.removeItem('rentCartItems');
            navigate(`/reservation/${data.reservation._id}`)

        } catch (err) {
            dispatch({ type: 'CREATE_FAIL' });
            toast.error(getError(err));
        }

    };

    useEffect(() => {
        if (!rentCart.paymentMethod) {
            navigate('/rentpayment');
        }
    }, [rentCart, navigate])


    return (
        <div>
            <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
            <Helmet><title>Preview Reservation</title></Helmet>
            <h2 className='mt-5 mb-4'>Preview Reservation</h2>
            <Row>
                <Col md={8}>
                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Shipping</Card.Title>
                            <Card.Text>
                                <strong>Pickup Location:</strong> {rentCart.deliveryAddress.pickupLocation} <br />
                                <strong>Return Location:</strong> {rentCart.deliveryAddress.returnLocation},
                            </Card.Text>
                            <Link to="/pickuplocation"><button className='mt-3 btn btn-outline-secondary'>Edit</button></Link>
                        </Card.Body>
                    </Card>
                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Payment</Card.Title>
                            <Card.Text>
                                <strong>Method:</strong> {rentCart.paymentMethod}
                            </Card.Text>
                            <Link to="/rentpayment"><button className='mt-3 btn btn-outline-secondary'>Edit</button></Link>
                        </Card.Body>
                    </Card>

                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Items</Card.Title>
                            <ListGroup variant='flush'>
                                {rentCart.rentCartItems.map((item) => (
                                    <ListGroup.Item key={item._id}>
                                        <Row className='align-items-center'>
                                            <Col md={2}>
                                                <img src={item.image} alt={item.name} className='img-fluid rounded img-thumbnail'></img>{' '}
                                            </Col >
                                            <Col md={10}>
                                                <Row>
                                                    <Col md={6}><Link to={`/product/${item.slug}`} className='card-title-link'>{item.name}</Link></Col>
                                                    <Col md={2}><span>{item.quantity}</span></Col>
                                                    <Col md={2}>{item.price}</Col>
                                                </Row>
                                                <br />
                                                <Row>
                                                    <Col md={5}><Form.Label > <strong>From : </strong></Form.Label> {moment(item.pickupDate).utc().format('DD/MM/YYYY')}</Col>
                                                    <Col md={5}><Form.Label > <strong>To : </strong></Form.Label>  {moment(item.returnDate).utc().format('DD/MM/YYYY')}</Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
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
                                        <Col>{rentCart.itemsPrice.toFixed(2)}LKR</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col>{rentCart.shippingPrice.toFixed(2)}LKR</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col><strong>Order Total</strong></Col>
                                        <Col><strong>{rentCart.totalPrice.toFixed(2)}LKR</strong></Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <div className='d-grid'>
                                        <Button type='button' onClick={placeOrderHandler} disabled={rentCart.rentCartItems.length === 0}>Make Reservation</Button>
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

export default MakeReservationScreen
