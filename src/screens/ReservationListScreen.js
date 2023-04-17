import axios from 'axios';
import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Button, Badge, Card, Col, Row, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import getError from '../utils';
import { FaHourglassHalf, FaCoins, FaClipboardList, FaClipboardCheck, FaSearch, FaUndo, FaPrint } from 'react-icons/fa';
import moment from 'moment';
import ReactToPrint from 'react-to-print';

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


const ReservationListScreen = () => {

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
            const { data } = await axios.get(`/api/reservations`, {
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
            const { data } = await axios.post('/api/reservations/reservations-by-date',
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
            const { data } = await axios.post('/api/reservations/filter-by-date',
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



    return (<div>
        <Helmet>
            <title>Reservations</title>
        </Helmet>
        <Row className="mb-5 ">
            <Col md={5} className="mt-4 mb-2"><h2 >Reservations</h2></Col>
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
                        trigger={() => <Button variant='light' className="mt-2" ><FaPrint></FaPrint></Button>}
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
                                        summary && summary.reservations && summary.reservations[0]
                                            ? summary.reservations[0].numOrders
                                            : 0
                                    }
                                </Col>
                                <Col xs={3}>
                                    <FaClipboardList></FaClipboardList>
                                </Col>
                            </Row>
                        </Card.Title>
                        <Card.Text>Total Reservations</Card.Text>
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
                                        summary && summary.preparingReservations && summary.preparingReservations[0]
                                            ? summary.preparingReservations[0].count
                                            : 0
                                    }
                                </Col>
                                <Col xs={3}>
                                    <FaHourglassHalf></FaHourglassHalf>
                                </Col>
                            </Row>
                        </Card.Title>
                        <Card.Text>Preparing Reservations</Card.Text>
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
                                        summary && summary.completedReservations && summary.completedReservations[0]
                                            ? summary.completedReservations[0].count
                                            : 0
                                    }
                                </Col>
                                <Col xs={3}>
                                    <FaClipboardCheck></FaClipboardCheck>
                                </Col>
                            </Row>
                        </Card.Title>
                        <Card.Text>Completed Reservations</Card.Text>
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
                                        summary && summary.reservations && summary.reservations[0]
                                            ? summary.reservations[0].totalSales.toFixed(2)
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
                        <th>USER</th>
                        <th>DATE</th>
                        <th>TOTAL</th>
                        <th>PAID</th>
                        <th>DISPATCHED</th>
                        <th>Order Status</th>
                        <th>ACTIONS</th>
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
                            <td><Badge bg={order.isPaid ? (order.deliveryStatus == "Preparing" ? "primary" : order.deliveryStatus == "Dispatched" ? "danger" : order.deliveryStatus == "Delivered" ? "danger" : order.deliveryStatus == "Released" ? "danger" : order.deliveryStatus == "Received" ? "success" : order.deliveryStatus == "Returned" ? "success" : order.deliveryStatus == "Completed" ? "success" : "success") : "light"} text={!order.isPaid ? "dark" : "light"}> {order.isPaid ? order.deliveryStatus : "Not paid"} </Badge></td>
                            <td>
                                <Button
                                    type="button"
                                    variant="light"
                                    onClick={() => {
                                        navigate(`/reservation/${order._id}`);
                                    }}
                                >
                                    Details
                                </Button>
                                &nbsp;
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        )}
    </div>)

}

export default ReservationListScreen
