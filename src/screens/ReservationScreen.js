import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useReducer } from 'react'
import { Card, Col, Form, ListGroup, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store';
import getError from '../utils';


function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, order: action.payload, error: '' };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'PAY_REQUEST':
            return { ...state, loadingPay: true };
        case 'PAY_SUCCESS':
            return { ...state, loadingPay: false, successPay: true };
        case 'PAY_FAIL':
            return { ...state, loadingPay: false, errorPay: action.payload };
        case 'PAY_RESET':
            return { ...state, loadingPay: false, successPay: false };
        default:
            return state;

    }
}

export default function ReservationScreen() {

    const { state } = useContext(Store);
    const { userInfo } = state;

    const params = useParams();
    const { id: orderId } = params;
    const navigate = useNavigate();

    const [{ loading, error, order, successPay, loadingPay }, dispatch] = useReducer(reducer, {
        loading: true,
        order: {},
        error: '',
        successPay: false,
        loadingPay: false
    })

    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

    function createOrder(data, actions) {
        return actions.order.create({
            purchase_units: [
                {
                    amount: { value: order.totalPrice }
                }
            ]
        }).then((orderID) => {
            return orderID;
        })
    }

    function onApprove(data, actions) {
        return actions.order.capture().then(async function (details) {
            try {
                dispatch({ type: 'PAY_REQUEST' });
                const { data } = await axios.put(
                    `/api/reservations/${order._id}/pay`,
                    details,
                    {
                        headers: { authorization: `Bearer ${userInfo.token}` }
                    }
                );
                dispatch({ type: 'PAY_SUCCESS', payload: data })
                toast.success('Order is paid');
            } catch (err) {
                dispatch({ type: 'PAY_FAIL', payload: getError(err) })
                toast.error(getError(err));
            }
        })
    }

    function onError(err) {
        toast.error(getError(err));
    }

    useEffect(() => {

        const fetchOrder = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(
                    `/api/reservations/${orderId}`,
                    { headers: { authorization: `Bearer ${userInfo.token}` } }
                );
                dispatch({ type: 'FETCH_SUCCESS', payload: data });

            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
            }
        };

        if (!userInfo) {
            return navigate('/login')
        }
        if (!order._id || successPay || (order._id && order._id !== orderId)) {
            fetchOrder();
            if (successPay) {
                //localStorage.removeItem('paymentMethod');                
                dispatch({ type: 'PAY_RESET' })
            }

        } else {
            const loadPaypalScript = async () => {
                const { data: clientId } = await axios.get('/api/keys/paypal', {
                    headers: { authorization: `Bearer ${userInfo.token}` }
                })
                paypalDispatch({
                    type: 'resetOptions',
                    value: {
                        'client-id': clientId,
                        currency: 'USD'
                    }
                })
                paypalDispatch({ type: 'setLoadingStatus', value: 'pending' })
            }
            loadPaypalScript();
        }
    }, [order, userInfo, orderId, navigate, paypalDispatch, successPay]);

    return loading ? (
        <LoadingBox></LoadingBox>
    ) : error ? (
        <MessageBox variant="danger"></MessageBox>
    ) : (
        <div>
            <Helmet><title>Reservation {orderId}</title></Helmet>
            <h2 className='my-3'>Reservation {orderId}</h2>
            <Row>
                <Col md={8}>
                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Shipping</Card.Title>
                            <Card.Text>
                                <strong>Pickup Location:</strong> {order.shippingAddress.pickupLocation} <br />
                                <strong>Return Location:</strong> {order.shippingAddress.returnLocation},  {order.shippingAddress.city},  {order.shippingAddress.postalCode}
                            </Card.Text>
                            {order.isDelivered ? (
                                <MessageBox variant='success'>Delivered at {order.deliveredAt}</MessageBox>
                            ) : (
                                <MessageBox variant='danger'>Not delivered</MessageBox>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Payment</Card.Title>
                            <Card.Text>
                                <strong>Method:</strong> {order.paymentMethod}
                            </Card.Text>
                            {order.isPaid ? (
                                <MessageBox variant='success'>Paid at {order.paidAt}</MessageBox>
                            ) : (
                                <MessageBox variant='danger'>Not paid</MessageBox>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Items</Card.Title>
                            <ListGroup variant='flush'>
                                {order.orderItems.map((item) => (
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
                                        <Col>{order.itemsPrice.toFixed(2)}LKR</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col>{order.shippingPrice.toFixed(2)}LKR</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col><strong>Order Total</strong></Col>
                                        <Col><strong>{order.totalPrice.toFixed(2)}LKR</strong></Col>
                                    </Row>
                                </ListGroup.Item>
                                {!order.isPaid && (
                                    <ListGroup.Item>
                                        {isPending ? (<LoadingBox />) :
                                            (
                                                <div>
                                                    <PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError}></PayPalButtons>
                                                </div>

                                            )}
                                        {loadingPay && <LoadingBox></LoadingBox>}
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row >
            {/* <Row>
                <Card className='mb-3'>
                    <Card.Body>
                        <Card.Title>Items</Card.Title>
                        <ListGroup variant='flush'>
                            {order.orderItems.map((item) => (
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
                    </Card.Body>
                </Card>
            </Row> */}
        </div >)


}

