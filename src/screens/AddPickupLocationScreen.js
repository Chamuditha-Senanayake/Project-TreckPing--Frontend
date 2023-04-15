import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import getError from '../utils';


const reducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'CREATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'CREATE_FAIL':
            return { ...state, loadingUpdate: false };
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };

        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        default:
            return state;
    }
}

const AddPickupLocationScreen = () => {

    const { state } = useContext(Store)
    const { userInfo } = state;

    const navigate = useNavigate();
    const params = useParams();
    const { id: locationId } = params;

    const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });

    const [agentsList, setAgentsList] = useState([]);
    const [nearestCity, setNearestCity] = useState("");
    const [address, setAddress] = useState("");
    const [agentId, setAgentId] = useState("");
    const [email, setEmail] = useState("");
    const [contact, setContact] = useState("");
    const [enabledAsPickupLocation, setEnabledAsPickupLocation] = useState(true);
    const [enabledAsDeliveryLocation, setEnabledAsDeliveryLocation] = useState(true);

    useEffect(() => {

        const fetchAgentData = async () => {
            try {
                const { data } = await axios.get(`/api/users/agents/get-all-agents`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
                );
                setAgentsList(data);
            } catch (err) {
                dispatch({
                    payload: getError(err),
                });
            }
        };

        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/locations/${locationId}`);
                setNearestCity(data.location)
                setAddress(data.address);
                setAgentId(data.agent);
                setEmail(data.email);
                setContact(data.contact);
                setEnabledAsPickupLocation(data.enabledAsPickupLocation);
                setEnabledAsDeliveryLocation(data.enabledAsDeliveryLocation);

                dispatch({ type: 'FETCH_SUCCESS' });
            } catch (err) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err),
                });
            }
        };

        fetchAgentData();

        if (locationId != null) {
            fetchData();
        }

    }, [locationId]);


    const submitHandler = async (e) => {
        e.preventDefault();
        if (locationId != null) {
            try {
                dispatch({ type: 'UPDATE_REQUEST' });
                await axios.put(
                    `/api/locations/${locationId}`,
                    {
                        _id: locationId,
                        nearestCity,
                        address,
                        agentId,
                        email,
                        contact,
                        enabledAsPickupLocation,
                        enabledAsDeliveryLocation

                    },
                    {
                        headers: { Authorization: `Bearer ${userInfo.token}` },
                    }
                );
                dispatch({
                    type: 'UPDATE_SUCCESS',
                });
                toast.success('Location Updated Successfully');

                { userInfo.isAdmin == "true" ? navigate('/admin/pickuplocationslist') : navigate('/agent/reservations') }

            } catch (err) {
                toast.error(getError(err));
                dispatch({ type: 'UPDATE_FAIL' });
            }
        }

        else {
            try {
                await axios.post(
                    '/api/locations/addlocation',
                    {
                        nearestCity,
                        address,
                        agentId,
                        email,
                        contact,
                        enabledAsPickupLocation,
                        enabledAsDeliveryLocation
                    },
                    {
                        headers: { authorization: `Bearer ${userInfo.token}` },
                    }

                );

                toast.success('Location Added Successfully');
                navigate('/admin/pickuplocationslist');

                dispatch({
                    type: 'CREATE_SUCCESS'
                });

            } catch (err) {
                dispatch({
                    type: 'CREATE_FAIL',
                });
                toast.error(getError(err));
            }
        }
    }


    return (
        <div className='container small-container'>
            <Helmet>{locationId != null ? "Update " : "Add "}Pickup Location</Helmet>
            <h2 className="mb-5">{locationId != null ? "Update " : "Add "} Pickup Location</h2>
            <form onSubmit={submitHandler}>

                <Form.Group className='mb-3 mt-3' controlId='name'>
                    <Form.Label>Nearest City</Form.Label>
                    <Form.Control value={nearestCity} onChange={(e) => setNearestCity(e.target.value)} required />
                </Form.Group>

                <Form.Group className='mb-3'>
                    <Form.Label>Address</Form.Label>
                    <Form.Control as="textarea" rows={5} value={address} onChange={(e) => setAddress(e.target.value)} required />
                </Form.Group>
                {userInfo.isAdmin == "true" &&
                    <Form.Group className='mb-3' >
                        <Form.Label>Select Agent</Form.Label>
                        <Form.Select onChange={(e) => setAgentId(e.target.value)} >
                            {
                                locationId != null ?
                                    <option disabled={true} >- Select agent-</option> :
                                    <option disabled={true} selected>- Select agent-</option>
                            }

                            {
                                agentsList.map((agent) => {
                                    return (
                                        agent._id === agentId ?
                                            <option value={agent._id} selected>{agent.name}</option> :
                                            <option value={agent._id}>{agent.name}</option>)
                                })
                            }
                        </Form.Select>
                    </Form.Group>
                }

                <Form.Group className='mb-3' >
                    <Form.Label>Contact</Form.Label>
                    <Form.Control value={contact} onChange={(e) => setContact(e.target.value)} required />
                </Form.Group>

                <Form.Group className='mb-4' >
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>
                <Alert variant={enabledAsPickupLocation ? "success" : "danger"}>
                    <Form.Check
                        className="mb-3"
                        type="checkbox" s
                        id="enabledAsPickupLocation"
                        label="Enabled As Pickup Location"
                        checked={enabledAsPickupLocation}
                        onChange={(e) => setEnabledAsPickupLocation(e.target.checked)}
                    />
                </Alert>

                <Alert variant={enabledAsDeliveryLocation ? "success" : "danger"}>
                    <Form.Check
                        className="mb-3"
                        type="checkbox"
                        id="enabledAsDeliveryLocation"
                        label="Enabled As Delivery Location"
                        checked={enabledAsDeliveryLocation}
                        onChange={(e) => setEnabledAsDeliveryLocation(e.target.checked)}
                    />
                </Alert>

                <Button type='submit' className="mt-5">Save</Button>
            </form>

        </div>
    )
}

export default AddPickupLocationScreen

