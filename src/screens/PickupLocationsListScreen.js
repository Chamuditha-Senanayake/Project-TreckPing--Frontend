import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
                locations: action.payload.locations,
                page: action.payload.page,
                pages: action.payload.pages,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'CREATE_REQUEST':
            return { ...state, loadingCreate: true };
        case 'CREATE_SUCCESS':
            return {
                ...state,
                loadingCreate: false,
            };
        case 'CREATE_FAIL':
            return { ...state, loadingCreate: false };


        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_SUCCESS':
            return {
                ...state,
                loadingDelete: false,
                successDelete: true,
            };
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false, successDelete: false };

        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false };
        default:
            return state;
    }
};

const PickupLocationsListScreen = () => {

    const [
        {
            loading,
            error,
            locations,
            pages,
            loadingCreate,
            loadingDelete,
            successDelete,
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

    const { state } = useContext(Store);
    const { userInfo } = state;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(`/api/locations/admin?page=${page} `, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });

                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) { }
        };

        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [page, userInfo, successDelete]);


    const createHandler = async () => {
        if (true) {
            try {
                // dispatch({ type: 'CREATE_REQUEST' });
                // const { data } = await axios.post(
                //     '/api/locations/addpickuplocations',
                //     {},
                //     {
                //         headers: { Authorization: `Bearer ${userInfo.token}` },
                //     }
                // );
                // dispatch({ type: 'CREATE_SUCCESS' });
                navigate(`/admin/addpickuplocations`);
            } catch (err) {
                toast.error(getError(error));
                dispatch({
                    type: 'CREATE_FAIL',
                });
            }
        }
    };

    const deleteHandler = async (location) => {
        if (window.confirm('Are you sure to delete?')) {
            try {
                await axios.delete(`/api/locations/${location._id}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success('Location deleted successfully');
                dispatch({ type: 'DELETE_SUCCESS' });
            } catch (err) {
                toast.error(getError(error));
                dispatch({
                    type: 'DELETE_FAIL',
                });
            }
        }
    };


    return (
        <div>

            <Row>
                <Col>
                    <h2 className="mb-5">Locations</h2>
                </Col>
                <Col className="col text-end">
                    <div>
                        <Button type="button" onClick={createHandler}>
                            Add Location
                        </Button>
                    </div>
                </Col>
            </Row>

            {loadingCreate && <LoadingBox></LoadingBox>}
            {loadingDelete && <LoadingBox></LoadingBox>}

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
                                <th>City</th>
                                <th>Address</th>
                                <th>Agent</th>
                                <th>Email</th>
                                <th>Contact</th>
                                <th>Enabled As a Pickup Location</th>
                                <th>Enabled As a Delivery Location</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map((location) => (
                                <tr key={location._id}>
                                    {/* <td>{product._id}</td> */}
                                    <td>{location.location} </td>
                                    <td>{location.address} </td>
                                    <td>{location.agent} </td>
                                    <td>{location.email} </td>
                                    <td>{location.contact} </td>
                                    <td>{(location.enabledAsPickupLocation) === true ? "Active" : "Deactive"}</td>
                                    <td>{(location.enabledAsDeliveryLocation) === true ? "Active" : "Deactive"}</td>

                                    <td>
                                        <Button
                                            type="button"
                                            variant="light"
                                            onClick={() => navigate(`/admin/addpickuplocations/${location._id}`)}
                                        >
                                            Edit
                                        </Button>
                                        &nbsp;
                                        <Button
                                            type="button"
                                            variant="light"
                                            onClick={() => deleteHandler(location)}
                                        >
                                            Delete
                                        </Button>
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
                                to={`/admin/pickuplocationslist?page=${x + 1}`}
                            >
                                {x + 1}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div >)
}


export default PickupLocationsListScreen
