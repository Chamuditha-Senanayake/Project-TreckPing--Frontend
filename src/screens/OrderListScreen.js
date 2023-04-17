import axios from 'axios';
import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Button, Badge, Col, Row, Card, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import getError from '../utils';
import { FaHourglassHalf, FaCoins, FaClipboardList, FaClipboardCheck, FaSearch, FaUndo, FaDownload } from 'react-icons/fa';
import moment from 'moment';
import ReactToPrint, { useReactToPrint } from 'react-to-print';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                orders: action.payload,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'FETCH_SUCCESS_SUMMARY':
            return {
                ...state,
                summary: action.payload,
            };
        case 'FETCH_FAIL_SUMMARY':
            return { ...state, loading: false, error: action.payload };
        case 'FETCH_SUCCESS_FILTER':
            return {
                ...state,
                summary: action.payload,
            };
        case 'FETCH_FAIL_FILTER':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

const OrderListScreen = () => {

    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const componentRef = useRef();

    const [{ loading, error, summary, orders, loadingDelete }, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });

    useEffect(() => {
        fetchData();
        fetchDataSummary();
    }, [userInfo]);

    const fetchData = async () => {
        try {
            dispatch({ type: 'FETCH_REQUEST' });
            const { data } = await axios.get(`/api/orders`, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (err) {
            dispatch({
                type: 'FETCH_FAIL',
                payload: getError(err),
            });
        }
    };

    const fetchDataByDate = async () => {
        try {
            dispatch({ type: 'FETCH_REQUEST' });
            const { data } = await axios.post('/api/orders/orders-by-date',
                {
                    startDate,
                    endDate
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (err) {
            dispatch({
                type: 'FETCH_FAIL',
                payload: getError(err),
            });
        }
    }

    const fetchDataSummary = async () => {
        try {
            dispatch({ type: 'FETCH_REQUEST' });
            const { data } = await axios.get('/api/orders/summary', {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            dispatch({ type: 'FETCH_SUCCESS_SUMMARY', payload: data });
        } catch (err) {
            dispatch({
                type: 'FETCH_FAIL_SUMMARY',
                payload: getError(err),
            });
        }
    };

    const fetchDataFilter = async () => {
        try {
            dispatch({ type: 'FETCH_REQUEST' });
            const { data } = await axios.post('/api/orders/filter-by-date',
                {
                    startDate,
                    endDate
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
            dispatch({ type: 'FETCH_SUCCESS_FILTER', payload: data });
        } catch (err) {
            dispatch({
                type: 'FETCH_FAIL_FILTER',
                payload: getError(err),
            });
        }
        fetchDataByDate();
    }

    return <div>
        <Helmet>
            <title>Orders</title>
        </Helmet>
        <Row className="mb-5 ">
            <Col md={5} className="mt-4 mb-2"><h2 >Orders</h2></Col>
            <Col md={2} className="mb-3">
                <Form.Label >From :</Form.Label>
                <Form.Control type="date" name="startingDate" placeholder="DateRange" onChange={(e) => { setStartDate(e.target.value); moment(endDate).diff(startDate, 'days') > 0 ? setEndDate(endDate) : setEndDate(e.target.value) }}></Form.Control>
            </Col>
            <Col md={2} className="mb-3">
                <Form.Label >To :</Form.Label>
                <Form.Control type="date" name="endingDate" min={startDate} placeholder="DateRange" onChange={(e) => setEndDate(e.target.value)}></Form.Control>
            </Col>
            <Col md={2} className="mt-4 mb-2"><span><Button variant='light' className="mt-2" onClick={fetchDataFilter}><FaSearch></FaSearch></Button></span> <span><Button variant='light' className="mt-2" onClick={() => { fetchData(); fetchDataSummary() }}> <FaUndo></FaUndo></Button></span></Col>
            <Col md={1} className="mt-4 mb-2">
                <div>
                    <ReactToPrint
                        trigger={() => <Button variant='light' className="mt-2" ><FaDownload></FaDownload></Button>}
                        content={() => componentRef.current}
                    />
                </div>
            </Col>
        </Row>

        <hr />

        <Row className="mb-5 mt-5">
            <Col md={3}>
                <Card className='card-color'>
                    <Card.Body>
                        <Card.Title>
                            <Row>
                                <Col xs={9}>
                                    {
                                        summary && summary.orders && summary.orders[0]
                                            ? summary.orders[0].numOrders
                                            : 0
                                    }
                                </Col>
                                <Col xs={3}>
                                    <FaClipboardList></FaClipboardList>
                                </Col>
                            </Row>
                        </Card.Title>
                        <Card.Text>Total Orders</Card.Text>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={3}>
                <Card className='card-color'>
                    <Card.Body>
                        <Card.Title>
                            <Row>
                                <Col xs={9}>
                                    {
                                        summary && summary.preparingOrders && summary.preparingOrders[0]
                                            ? summary.preparingOrders[0].count
                                            : 0
                                    }
                                </Col>
                                <Col xs={3}>
                                    <FaHourglassHalf></FaHourglassHalf>
                                </Col>
                            </Row>
                        </Card.Title>
                        <Card.Text>Preparing Orders</Card.Text>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={3}>
                <Card className='card-color'>
                    <Card.Body>
                        <Card.Title>
                            <Row>
                                <Col xs={9}>
                                    {
                                        summary && summary.completedOrders && summary.completedOrders[0]
                                            ? summary.completedOrders[0].count
                                            : 0
                                    }
                                </Col>
                                <Col xs={3}>
                                    <FaClipboardCheck></FaClipboardCheck>
                                </Col>
                            </Row>
                        </Card.Title>
                        <Card.Text>Completed Orders</Card.Text>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={3}>
                <Card className='card-color'>
                    <Card.Body>
                        <Card.Title>
                            <Row>
                                <Col xs={9}>
                                    {
                                        summary && summary.orders && summary.orders[0]
                                            ? summary.orders[0].totalSales.toFixed(2)
                                            : 0
                                    }
                                </Col>
                                <Col xs={3}>
                                    <FaCoins></FaCoins>
                                </Col>
                            </Row>
                        </Card.Title>
                        <Card.Text> Income</Card.Text>
                    </Card.Body>
                </Card>
            </Col>

        </Row>

        <hr />

        {loadingDelete && <LoadingBox></LoadingBox>}
        {loading ? (
            <LoadingBox></LoadingBox>
        ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
        ) : (<div ref={componentRef}>


            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Dispatched</th>
                        <th>Order Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                            <td>{order.createdAt.substring(0, 10)}</td>
                            <td>{order.totalPrice.toFixed(2)}</td>
                            <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                            <td>
                                {order.isDispatched
                                    ? order.dispatchedAt.substring(0, 10)
                                    : 'No'}
                            </td>
                            <td><Badge bg={order.isPaid ? (order.deliveryStatus == "Preparing" ? "primary" : order.deliveryStatus == "Dispatched" ? "danger" : order.deliveryStatus == "Delivered" ? "success" : "success") : "light"} text={!order.isPaid ? "dark" : "light"}>{order.isPaid ? order.deliveryStatus : "Not paid"}</Badge></td>
                            <td>
                                <Button
                                    type="button"
                                    variant="light"
                                    onClick={() => {
                                        navigate(`/order/${order._id}`);
                                    }}
                                >
                                    Details
                                </Button>
                                &nbsp;
                                {/* <Button
                                    type="button"
                                    variant="light"
                                    onClick={() => deleteHandler(order)}
                                >
                                    Delete
                                </Button> */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        )}
    </div>

}

export default OrderListScreen
