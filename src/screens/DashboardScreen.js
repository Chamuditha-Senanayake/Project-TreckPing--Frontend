import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { Col, Row, Card } from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Chart from 'react-google-charts'
import { Store } from '../Store';
import getError from '../utils';
import { FaClipboardList, FaCoins, FaFileImport, FaUserAlt } from 'react-icons/fa';

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
            <h2 className="mb-4">Dashboard</h2>

            {loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    <hr />
                    <Row>
                        <Col md={3}>
                            <Card className='dashboard-card-users'>
                                <Card.Body>
                                    <Card.Title>
                                        <Row>
                                            <Col xs={1}></Col>
                                            <Col xs={8} >
                                                {
                                                    summary.users && summary.users[0]
                                                        ? summary.users[0].numUsers
                                                        : 0
                                                }
                                            </Col>
                                            <Col xs={3}>
                                                <FaUserAlt></FaUserAlt>
                                            </Col>
                                        </Row>
                                    </Card.Title>
                                    <Card.Text className='mx-3'>Total Users</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className='dashboard-card-orders'>
                                <Card.Body>
                                    <Card.Title>
                                        <Row>
                                            <Col xs={1}></Col>
                                            <Col xs={8} >
                                                {
                                                    summary.orders && summary.users[0]
                                                        ? summary.orders[0].numOrders
                                                        : 0
                                                }
                                            </Col>
                                            <Col xs={3}>
                                                <FaFileImport></FaFileImport>
                                            </Col>
                                        </Row>
                                    </Card.Title>
                                    <Card.Text className='mx-3'>Total Orders</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className='dashboard-card-reservations '>
                                <Card.Body>
                                    <Card.Title >
                                        <Row>
                                            <Col xs={1}></Col>
                                            <Col xs={8} >
                                                {
                                                    summary.reservations && summary.reservations[0]
                                                        ? summary.reservations[0].numOrders
                                                        : 0
                                                }
                                            </Col>
                                            <Col xs={3}>
                                                <FaClipboardList></FaClipboardList>
                                            </Col>
                                        </Row>
                                    </Card.Title>
                                    <Card.Text className='mx-3'>Total Reservations</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className='dashboard-card-sales '>
                                <Card.Body>
                                    <Card.Title>
                                        <Row>
                                            <Col xs={9}>
                                                {
                                                    summary.orders && summary.users[0]
                                                        ? (parseInt(summary.orders[0].totalSales) + parseInt(summary.reservations[0].totalSales)).toFixed(2)
                                                        : 0
                                                } LKR
                                            </Col>
                                            <Col xs={3}>
                                                <FaCoins></FaCoins>
                                            </Col>
                                        </Row>
                                    </Card.Title>
                                    <Card.Text className='mt-3'> <h3>Total Sales</h3></Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <hr />

                    <Row>
                        <Col md={6}>
                            <div className="my-4 ">
                                {summary.monthlyOrders.length === 0 ? (
                                    <MessageBox>Income from orders</MessageBox>
                                ) : (<Card>
                                    <Card.Body>
                                        <center><h2 className='mt-2'>Income from Orders</h2></center>
                                        <Chart
                                            width="100%"
                                            height="400px"
                                            chartType="ColumnChart"
                                            options={{ legend: "none" }}
                                            loader={<div>Loading Chart...</div>}
                                            data={[
                                                ['Month', 'Sales'],
                                                ...summary.monthlyOrders.map((x) => [x.month + " " + x.year, x.totalAmount]),
                                            ]}
                                        ></Chart>
                                    </Card.Body>
                                </Card>
                                )}
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="my-4">
                                {summary.monthlyReservations.length === 0 ? (
                                    <MessageBox>No Sale</MessageBox>
                                ) : (<Card>
                                    <Card.Body>
                                        <center><h2 className='mt-2'>Income from Reservations</h2></center>
                                        <Chart
                                            width="100%"
                                            height="400px"
                                            chartType="ColumnChart"
                                            options={{ legend: "none" }}
                                            loader={<div>Loading Chart...</div>}
                                            data={[
                                                ['Month', 'Sales'],
                                                ...summary.monthlyReservations.map((x) => [x.month + " " + x.year, x.totalAmount]),
                                            ]}

                                        ></Chart>
                                    </Card.Body>
                                </Card>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <div className="my-3">
                                {summary.productCategories.length === 0 ? (
                                    <MessageBox>No Category</MessageBox>
                                ) : (<Card>
                                    <Card.Body>
                                        <center><h2 className='mt-2'>Categories</h2></center>
                                        <Chart
                                            width="100%"
                                            height="400px"
                                            chartType="PieChart"
                                            options={{
                                                is3D: true, legend: { position: "bottom" }, pieSliceText: "label",
                                                slices: {
                                                    0: { color: "#4B4B66" },
                                                    1: { color: "#7FDD92" },
                                                    3: { color: "#34BBD2" },
                                                    5: { color: "#FFF181" },
                                                    7: { color: "#64A4ED" },
                                                },
                                            }}
                                            loader={<div>Loading Chart...</div>}
                                            data={[
                                                ['Category', 'Products'],
                                                ...summary.productCategories.map((x) => [x._id, x.count]),
                                            ]}
                                        ></Chart>
                                    </Card.Body>
                                </Card>
                                )}
                            </div>
                        </Col>

                        <Col md={4}>
                            <div className="my-3">

                                {summary.productCategories.length === 0 ? (
                                    <MessageBox>No Category</MessageBox>
                                ) : (<Card>
                                    <Card.Body>
                                        <center><h2 className='mt-2'>Top Selling Products</h2></center>
                                        <Chart
                                            width="100%"
                                            height="400px"
                                            chartType="PieChart"
                                            options={{
                                                is3D: true, legend: { position: "bottom" }, pieSliceText: "label",
                                                slices: {
                                                    0: { color: "#4B4B66" },
                                                    1: { color: "#7FDD92" },
                                                },
                                            }}
                                            loader={<div>Loading Chart...</div>}
                                            data={[
                                                ['Product', 'Sells'],
                                                ["Webr BBQ Grill", 8], ["Paracord 550 Rope", 12], ["High Ankle Boots", 15],
                                            ]}
                                        ></Chart>
                                    </Card.Body>
                                </Card>
                                )}
                            </div>
                        </Col>

                        <Col md={4}>
                            <div className="my-3">

                                {summary.productCategories.length === 0 ? (
                                    <MessageBox>No Category</MessageBox>
                                ) : (
                                    <Card>
                                        <center><h2 className='mt-2'>Best Selling Locations</h2></center>
                                        <Chart
                                            width="100%"
                                            height="400px"
                                            chartType="PieChart"
                                            options={{
                                                is3D: true, legend: { position: "bottom" }, pieSliceText: "label",
                                                slices: {
                                                    0: { color: "#4B4B66" },
                                                    1: { color: "#7FDD92" },
                                                },
                                            }}
                                            loader={<div>Loading Chart...</div>}
                                            data={[
                                                ['City', 'Sells'],
                                                ["Kandy", 28], ["Colombo", 21], ["Galle", 18],
                                            ]}
                                        ></Chart>
                                    </Card>
                                )}
                            </div>
                        </Col>
                    </Row>
                </>
            )
            }

        </div >
    )
}

export default DashboardScreen
