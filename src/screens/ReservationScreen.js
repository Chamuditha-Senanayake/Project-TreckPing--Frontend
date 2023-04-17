import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import swal from 'sweetalert';
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
        case 'DELIVER_REQUEST':
            return { ...state, loadingDeliver: true };
        case 'DELIVER_SUCCESS':
            return { ...state, loadingDeliver: false, successDeliver: true };
        case 'DELIVER_FAIL':
            return { ...state, loadingDeliver: false };
        case 'DELIVER_RESET':
            return {
                ...state,
                loadingDeliver: false,
                successDeliver: false,
            };
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
    const today = moment().add(1, 'day').format('YYYY-MM-DD');

    const [{ loading, error, order, successPay, loadingPay, loadingDeliver, successDeliver }, dispatch] = useReducer(reducer, {
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
        if (!order._id || successPay || successDeliver || (order._id && order._id !== orderId)) {
            fetchOrder();
            if (successPay) {
                //localStorage.removeItem('paymentMethod');                
                dispatch({ type: 'PAY_RESET' })
            }

            if (successDeliver) {
                dispatch({ type: 'DELIVER_RESET' })
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
    }, [order, userInfo, orderId, navigate, paypalDispatch, successPay, successDeliver]);

    async function dispatchOrderHandler() {
        swal({
            title: "Are you sure?",
            text: "Delivery status of this order will be changed as Dispatched !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willYes) => {
                if (willYes) {
                    try {
                        dispatch({ type: 'DELIVER_REQUEST' });
                        const { data } = await axios.put(
                            `/api/reservations/${order._id}/dispatch`,
                            {},
                            {
                                headers: { authorization: `Bearer ${userInfo.token}` },
                            }
                        );
                        dispatch({ type: 'DELIVER_SUCCESS', payload: data });
                        toast.success('Order is dispatched');
                    } catch (err) {
                        toast.error(getError(err));
                        dispatch({ type: 'DELIVER_FAIL' });
                    }
                }
            })

    }

    //handle delivered orders
    async function deliverOrderHandler() {

        swal({
            title: "Are you sure?",
            text: "Delivery status of this order will be changed as Delivered !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willYes) => {
                if (willYes) {
                    try {
                        dispatch({ type: 'DELIVER_REQUEST' });
                        const { data } = await axios.put(
                            `/api/reservations/${order._id}/deliver`,
                            {},
                            {
                                headers: { authorization: `Bearer ${userInfo.token}` },
                            }
                        );
                        dispatch({ type: 'DELIVER_SUCCESS', payload: data });
                        toast.success('Order is delivered');
                    } catch (err) {
                        toast.error(getError(err));
                        dispatch({ type: 'DELIVER_FAIL' });
                    }
                }
            })
    }

    //handle released orders
    async function releaseOrderHandler() {

        swal({
            title: "Are you sure?",
            text: "Delivery status of this order will be changed as Released !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willYes) => {
                if (willYes) {
                    try {
                        dispatch({ type: 'DELIVER_REQUEST' });
                        const { data } = await axios.put(
                            `/api/reservations/${order._id}/release`,
                            {},
                            {
                                headers: { authorization: `Bearer ${userInfo.token}` },
                            }
                        );
                        dispatch({ type: 'DELIVER_SUCCESS', payload: data });
                        toast.success('Order is released');
                    } catch (err) {
                        toast.error(getError(err));
                        dispatch({ type: 'DELIVER_FAIL' });
                    }
                }
            })
    }

    //handle received orders
    async function receiveOrderHandler() {

        swal({
            title: "Are you sure?",
            text: "Delivery status of this order will be changed as Received !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willYes) => {
                if (willYes) {
                    try {
                        dispatch({ type: 'DELIVER_REQUEST' });
                        const { data } = await axios.put(
                            `/api/reservations/${order._id}/receive`,
                            {},
                            {
                                headers: { authorization: `Bearer ${userInfo.token}` },
                            }
                        );
                        dispatch({ type: 'DELIVER_SUCCESS', payload: data });
                        toast.success('Order is received');
                    } catch (err) {
                        toast.error(getError(err));
                        dispatch({ type: 'DELIVER_FAIL' });
                    }
                }
            })
    }

    //handle returned orders
    async function returnOrderHandler() {

        swal({
            title: "Are you sure?",
            text: "Delivery status of this order will be changed as Returned !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willYes) => {
                if (willYes) {
                    try {
                        dispatch({ type: 'DELIVER_REQUEST' });
                        const { data } = await axios.put(
                            `/api/reservations/${order._id}/return`,
                            {},
                            {
                                headers: { authorization: `Bearer ${userInfo.token}` },
                            }
                        );
                        dispatch({ type: 'DELIVER_SUCCESS', payload: data });
                        toast.success('Order is returned');
                    } catch (err) {
                        toast.error(getError(err));
                        dispatch({ type: 'DELIVER_FAIL' });
                    }
                }
            })
    }

    //handle completed orders
    async function completeOrderHandler() {

        swal({
            title: "Are you sure?",
            text: "Delivery status of this order will be changed as Completed !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willYes) => {
                if (willYes) {
                    try {
                        dispatch({ type: 'DELIVER_REQUEST' });
                        const { data } = await axios.put(
                            `/api/reservations/${order._id}/complete`,
                            {},
                            {
                                headers: { authorization: `Bearer ${userInfo.token}` },
                            }
                        );
                        dispatch({ type: 'DELIVER_SUCCESS', payload: data });
                        toast.success('Order is completed');
                    } catch (err) {
                        toast.error(getError(err));
                        dispatch({ type: 'DELIVER_FAIL' });
                    }
                }
            })
    }


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
                                {/* todo */}
                                <strong>Customer Name : </strong> {order.shippingAddress.customerName}<br />
                                <strong>Pickup Location : </strong> {order.shippingAddress.pickupLocation} <br />
                                <strong>Return Location : </strong> {order.shippingAddress.returnLocation},  {order.shippingAddress.city},  {order.shippingAddress.postalCode}
                            </Card.Text>
                            {order.isDispatched ? (
                                <MessageBox variant='success'>{(order.deliveryStatus != "Received" && order.deliveryStatus != "Returned" && order.deliveryStatus != "Completed") ? order.deliveryStatus : "Completed"} at {moment(order.deliveryStatus == "Dispatched" ? order.dispatchedAt : order.deliveryStatus == "Delivered" ? order.deliveredAt : order.deliveryStatus == "Released" ? order.releasedAt : order.deliveryStatus == "Received" ? order.receivedAt : order.receivedAt).format('LLL')}</MessageBox>
                            ) : (
                                <MessageBox variant='danger'>Not Dispatched</MessageBox>
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
                                <div>
                                    <MessageBox variant='success'>Paid at {moment(order.paidAt).format('LLL')}</MessageBox>
                                    {order.deliveryStatus == "Released" && true ?
                                        <MessageBox variant='success'>Paid at {moment(order.paidAt).format('LLL')}</MessageBox>
                                        : <></>}

                                </div>

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
                                                    <Col md={5}><Form.Label > <strong>From : </strong></Form.Label><strong> {moment(item.pickupDate).utc().format('DD/MM/YYYY')} </strong></Col>
                                                    <Col md={5}><Form.Label > <strong>To : </strong></Form.Label><strong>  {moment(item.returnDate).utc().format('DD/MM/YYYY')} </strong></Col>
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
                                {userInfo.isAdmin == "false" && userInfo.isAdmin == "false" && !order.isPaid && (
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
                                {userInfo.isAdmin == "true" && order.isPaid && !order.isDispatched && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button type="button" onClick={dispatchOrderHandler}>
                                                Dispatch Order
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {/* for customers */}
                                {userInfo.isAdmin != "true" && userInfo.isAgent != "true" && order.isPaid && order.deliveryStatus == "Preparing" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button variant="warning" disabled>
                                                Order Preparing
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {/* for customers */}
                                {userInfo.isAdmin != "true" && userInfo.isAgent != "true" && order.isPaid && order.isDispatched && order.deliveryStatus == "Dispatched" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button variant="warning" disabled>
                                                Order Dispatched
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {userInfo.isAgent == "true" && order.isPaid && order.isDispatched && order.deliveryStatus == "Dispatched" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button type="button" onClick={deliverOrderHandler}>
                                                Order Delivered
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {/* for customers */}
                                {userInfo.isAdmin != "true" && userInfo.isAgent != "true" && order.isPaid && order.isDispatched && order.deliveryStatus == "Delivered" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button variant="danger" disabled>
                                                Package Received to Agent
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {userInfo.isAgent == "true" && order.isPaid && order.isDispatched && order.deliveryStatus == "Delivered" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button type="button" variant="danger" onClick={releaseOrderHandler}>
                                                Release To the Customer
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {/* for customers */}
                                {userInfo.isAdmin != "true" && userInfo.isAgent != "true" && order.isPaid && order.isDispatched && order.deliveryStatus == "Released" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button variant="danger" disabled>
                                                Pickedup the Package
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {userInfo.isAgent == "true" && order.isPaid && order.isDispatched && order.deliveryStatus == "Released" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button type="button" variant="danger" onClick={receiveOrderHandler}>
                                                Received the Package
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {/* for customers */}
                                {userInfo.isAdmin != "true" && userInfo.isAgent != "true" && order.isPaid && order.isDispatched && (order.deliveryStatus == "Received" || order.deliveryStatus == "Returned" || order.deliveryStatus == "Completed") && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button variant="success" disabled>
                                                Order Completed
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {userInfo.isAgent == "true" && order.isPaid && order.isDispatched && order.deliveryStatus == "Received" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button type="button" onClick={returnOrderHandler}>
                                                Return Package to Warehosue
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {userInfo.isAdmin == "true" && order.isPaid && order.isDispatched && order.deliveryStatus == "Returned" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button type="button" onClick={completeOrderHandler}>
                                                Received Package
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {(userInfo.isAdmin == "true" || userInfo.isAgent == "true") && order.isPaid && order.isDispatched && order.deliveryStatus == "Completed" && (
                                    <ListGroup.Item>
                                        {loadingDeliver && <LoadingBox></LoadingBox>}
                                        <div className="d-grid mt-4">
                                            <Button variant="success" disabled>
                                                Order Completed
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row >
        </div >)


}

