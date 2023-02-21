import axios from 'axios';
import React, { useContext, useReducer, useState } from 'react'
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
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
        default:
            return state;

    }
}

const AddPickupLocationScreen = () => {

    const { state } = useContext(Store);
    const { userInfo } = state;
    const navigate = useNavigate();

    const [address, setAddress] = useState("");
    const [enabledAsPickupLocation, setEnabledAsPickupLocation] = useState(true);
    const [enabledAsDeliveryLocation, setEnabledAsDeliveryLocation] = useState(true);


    //const navigate = useNavigate();
    const [dispatch] = useReducer(reducer, {
        loadingUpdate: false
    });

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                '/api/locations/addlocation',
                {
                    address,
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

    return (
        <div className='container small-container'>
            <Helmet>Add Pickup Location</Helmet>
            <h2 className="my-3">Add Pickup Location</h2>
            <form onSubmit={submitHandler}>

                <Form.Group className='mb-4 mt-5' controlId='name'>
                    <Form.Label>Address</Form.Label>
                    <Form.Control value={address} onChange={(e) => setAddress(e.target.value)} required />
                </Form.Group>

                <Form.Check
                    className="mb-4"
                    type="checkbox"
                    id="enabledAsPickupLocation"
                    label="Enabled As Pickup Location"
                    checked={enabledAsPickupLocation}
                    onChange={(e) => setEnabledAsPickupLocation(e.target.checked)}
                />

                <Form.Check
                    className="mb-5"
                    type="checkbox"
                    id="enabledAsDeliveryLocation"
                    label="Enabled As Delivery Location"
                    checked={enabledAsDeliveryLocation}
                    onChange={(e) => setEnabledAsDeliveryLocation(e.target.checked)}
                />

                <Button type='submit'>Save</Button>

            </form>

        </div>
    )
}

export default AddPickupLocationScreen

