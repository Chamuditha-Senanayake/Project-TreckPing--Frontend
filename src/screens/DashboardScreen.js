import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { Card, Col, Row } from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Chart from 'react-google-charts'
import { Store } from '../Store';
import getError from '../utils';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                summary: action.payload,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

const DashboardScreen = () => {

    const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });

    const { state } = useContext(Store);
    const { userInfo } = state;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get('/api/orders/summary', {
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

    return (
        <div className='dashboard'>
            <h2 className="mb-5">Dashboard</h2>

            {loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    <Row>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>
                                        {summary.users && summary.users[0]
                                            ? summary.users[0].numUsers
                                            : 0}
                                    </Card.Title>
                                    <Card.Text> Users</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>
                                        {summary.orders && summary.users[0]
                                            ? summary.orders[0].numOrders
                                            : 0}
                                    </Card.Title>
                                    <Card.Text> Orders</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>
                                        5
                                        {/* {summary.orders && summary.users[0]
                                            ? summary.orders[0].numOrders
                                            : 0} */}
                                    </Card.Title>
                                    <Card.Text> Reservations</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>

                                        {summary.orders && summary.users[0]
                                            ? summary.orders[0].totalSales.toFixed(2)
                                            : 0} LKR
                                    </Card.Title>
                                    <Card.Text> Total Sales</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <div className="my-5">
                                <h3>Income from orders</h3>
                                {summary.dailyOrders.length === 0 ? (
                                    <MessageBox>No Sale</MessageBox>
                                ) : (
                                    <Chart
                                        width="100%"
                                        height="400px"
                                        chartType="ColumnChart"
                                        loader={<div>Loading Chart...</div>}
                                        data={[
                                            ['Date', 'Sales'],
                                            ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                                        ]}

                                    ></Chart>
                                )}
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="my-5">
                                <h3>Income from Reservations</h3>
                                {summary.dailyOrders.length === 0 ? (
                                    <MessageBox>No Sale</MessageBox>
                                ) : (
                                    <Chart
                                        width="100%"
                                        height="400px"
                                        chartType="ColumnChart"
                                        loader={<div>Loading Chart...</div>}
                                        data={[
                                            ['Date', 'Sales'],
                                            ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                                        ]}

                                    ></Chart>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <div className="my-3">
                                <h2>Categories</h2>
                                {summary.productCategories.length === 0 ? (
                                    <MessageBox>No Category</MessageBox>
                                ) : (
                                    <Chart
                                        width="100%"
                                        height="400px"
                                        chartType="PieChart"
                                        loader={<div>Loading Chart...</div>}
                                        data={[
                                            ['Category', 'Products'],
                                            ...summary.productCategories.map((x) => [x._id, x.count]),
                                        ]}
                                    ></Chart>
                                )}
                            </div>
                        </Col>

                        <Col md={4}>
                            <div className="my-3">
                                <h2>Top Selling Products</h2>
                                {summary.productCategories.length === 0 ? (
                                    <MessageBox>No Category</MessageBox>
                                ) : (
                                    <Chart
                                        width="100%"
                                        height="400px"
                                        chartType="PieChart"
                                        loader={<div>Loading Chart...</div>}
                                        data={[
                                            ['Product', 'Sells'],
                                            ["Folding BBQ Grill", 8], ["Paracord 550 Rope", 12], ["High Ankle Hiking Boots", 15],
                                        ]}
                                    ></Chart>
                                )}
                            </div>
                        </Col>

                        <Col md={4}>
                            <div className="my-3">
                                <h2>Best Selling Locations</h2>
                                {summary.productCategories.length === 0 ? (
                                    <MessageBox>No Category</MessageBox>
                                ) : (
                                    <Chart
                                        width="100%"
                                        height="400px"
                                        chartType="PieChart"
                                        loader={<div>Loading Chart...</div>}
                                        data={[
                                            ['City', 'Sells'],
                                            ["Kandy", 32], ["Colombo", 21], ["Galle", 18],
                                        ]}
                                    ></Chart>
                                )}
                            </div>
                        </Col>
                    </Row>

                </>
            )}

        </div>
    )
}

export default DashboardScreen
