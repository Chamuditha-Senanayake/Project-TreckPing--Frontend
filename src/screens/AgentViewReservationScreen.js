import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Badge, Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import swal from 'sweetalert';
import { Store } from '../Store';
import getError from '../utils';
import moment from 'moment';

//reducer for handle states
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                orders: action.payload.orders,
                page: action.payload.page,
                pages: action.payload.pages,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };

        case 'FETCH_REQUEST_NOT_DELIVERED_ORDERS':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS_NOT_DELIVERED_ORDERS':
            return {
                ...state,
                notDeliveredOrders: action.payload.orders,
            };
        case 'FETCH_FAIL_NOT_DELIVERED_ORDERS':
            return { ...state, loading: false, error: action.payload };


        default:
            return state;
    }
};

//View Reservation Screen
const AgentViewReservationScreen = () => {
    const [
        {
            loading,
            error,
            orders,
            // notDeliveredOrders,
            pages,
            loadingCreate,

        },
        dispatch,
    ] = useReducer(reducer, {
        loading: true,
        error: '',
    });


    //pagination
    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1;

    const [notDeliveredOrders, setNotDeliveredOrders] = useState([])
    const [customerName, setCustomerName] = useState("Nimal Fernando")
    const { state } = useContext(Store);
    const { userInfo } = state;

    //fetch Orders By location
    const fetchOrdersBylocation = async () => {
        try {
            const { data } = await axios.post(`/api/reservations/by-location?page=${page} `,
                {
                    address: "No.28, Colombo Rd, Galle"
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });

            dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (err) {
            toast.error(getError(err))
        }
    };

    //fetch Not Delivered Orders By location
    const fetchNotDeliveredOrdersBylocation = async () => {
        try {
            const { data } = await axios.post(`/api/reservations/by-location/not-delivered `,
                {
                    address: "No.28, Colombo Rd, Galle"
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });

            setNotDeliveredOrders(data);
        } catch (err) {
            toast.error(getError(err))
        }
    };

    //To fecth the customer
    const fetchUserByUserId = async (userId) => {
        const { data } = await axios.get(`/api/users/${userId}`,
            {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
        setCustomerName(data.name)
    }

    useEffect(() => {
        fetchOrdersBylocation();
        fetchNotDeliveredOrdersBylocation();
    }, [page, userInfo]);

    return (
        <div>
            <Row>
                <Col>
                    <h3 className="mb-5">Upcoming Reservations</h3>
                </Col>
            </Row>

            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    <table className="table product-tbl  mb-5">
                        <thead>
                            <tr>
                                {/* <th>ID</th> */}
                                <th>ID</th>
                                <th>NAME</th>
                                <th>ORDERED AT</th>
                                <th>DISPATCHED AT</th>
                                <th>ORDER STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notDeliveredOrders.map((order) => (

                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.shippingAddress.customerName}</td>
                                    <td>{moment(order.createdAt).format('LLL')}</td>
                                    <td>{order.isDispatched ? moment(order.dispatchedAt).format('LLL') : "No"}</td>
                                    <td><Badge bg={order.deliveryStatus == "Preparing" ? "warning" : order.deliveryStatus == "Dispatched" ? "danger" : order.deliveryStatus == "Delivered" ? "primary" : order.deliveryStatus == "Released" ? "danger" : order.deliveryStatus == "Received" ? "primary" : order.deliveryStatus == "Returned" ? "success" : "success"}>{order.deliveryStatus}</Badge></td>
                                    <td>
                                        <Button
                                            type="button"
                                            variant="light"
                                            onClick={() => { navigate(`/reservation/${order._id}`) }}
                                        >
                                            Update
                                        </Button>
                                        &nbsp;

                                    </td>
                                </tr>

                            ))}
                        </tbody>
                    </table>

                </>
            )}
            <hr className="my-5" />
            <Col>
                <h3 className="mb-5">reservation History</h3>
            </Col>
            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    <table className="table product-tbl">
                        <thead>
                            <tr>
                                {/* <th>ID</th> */}
                                <th>ID</th>
                                <th>NAME</th>
                                <th>ORDERED AT</th>
                                <th>DISPATCHED AT</th>
                                <th>ORDER STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    {/* <td>{product._id}</td> */}
                                    <td >{order._id}</td>
                                    <td>{order.shippingAddress.customerName}</td>
                                    <td>{moment(order.createdAt).format('LLL')}</td>
                                    <td>{order.isDispatched ? moment(order.dispatchedAt).format('LLL') : "No"}</td>
                                    <td><Badge bg={order.deliveryStatus == "Preparing" ? "warning" : order.deliveryStatus == "Dispatched" ? "danger" : order.deliveryStatus == "Delivered" ? "primary" : order.deliveryStatus == "Released" ? "danger" : order.deliveryStatus == "Received" ? "primary" : order.deliveryStatus == "Returned" ? "success" : "success"}>{order.deliveryStatus}</Badge></td>
                                    <td>
                                        <Button
                                            type="button"
                                            variant="light"
                                            onClick={() => { navigate(`/reservation/${order._id}`) }}
                                        >
                                            View
                                        </Button>
                                        &nbsp;

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        {[...Array(pages).keys()].map((x) => (
                            <Link
                                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                                key={x + 1}
                                to={`/agent/reservations?page=${x + 1}`}
                            >
                                {x + 1}
                            </Link>
                        ))}
                    </div>
                </>
            )}

        </div >
    )

}


export default AgentViewReservationScreen
