import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { Button, Badge } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import getError from '../utils';

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

        default:
            return state;
    }
};

const OrderListScreen = () => {

    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });

    useEffect(() => {
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
        fetchData();
    }, [userInfo]);

    return <div>
        <Helmet>
            <title>Orders</title>
        </Helmet>
        <h2 className="mb-5">Orders</h2>

        {loadingDelete && <LoadingBox></LoadingBox>}
        {loading ? (
            <LoadingBox></LoadingBox>
        ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
        ) : (
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
        )}
    </div>

}

export default OrderListScreen
