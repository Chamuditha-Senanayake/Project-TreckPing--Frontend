import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';
import axios from 'axios';
import getError from '../utils';
import { toast } from 'react-toastify';

//Pickup Location Screen
const PickupLocationScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispacth } = useContext(Store)

    const {
        userInfo,
        rentCart: { deliveryAddress }
    } = state;

    const [pickupLocation, setPickupLocation] = useState(deliveryAddress.pickupLocation || '');
    const [returnLocation, setReturnLocation] = useState(deliveryAddress.returnLocation || '');
    const [customerName, setCustomerName] = useState('')
    const [locationList, setLocationList] = useState([]);

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/pickuplocation');
        }
        else {
            setCustomerName(userInfo.name)
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        const fetchLoactionData = async () => {
            try {
                //get all locations
                const { data } = await axios.get(`/api/locations/get-all`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
                );
                setLocationList(data);
            } catch (err) {
                toast.error(getError(err));;
            }
        };

        fetchLoactionData();

    }, [userInfo])


    const submitHandler = (e) => {
        e.preventDefault();

        ctxDispacth({
            type: 'SAVE_DELIVERY_ADDRESS',
            payload: {
                customerName,
                pickupLocation,
                returnLocation,
            }
        });
        localStorage.setItem(
            'deliveryAddress',
            JSON.stringify({
                customerName,
                pickupLocation,
                returnLocation,
            })
        );
        navigate('/rentpayment');
    }
    return (
        <div>
            <Helmet>
                <title>Shipping Address</title>
            </Helmet>
            <CheckoutSteps step1 step2></CheckoutSteps>
            <div className='container small-container'>
                <h2 className='mt-5 mb-4'>Pickup & Return Locations</h2>
                <p className='italic'>Choose locations that are most convenient for you to pickup and return your packages. You can pick and return your packages by visiting our sales agents at the selected location.</p>
                <Form onSubmit={submitHandler}>

                    <Form.Group className='mt-5 mb-3' controlId='fullName'>
                        <Form.Label>Pickup Location</Form.Label>

                        <Form.Select size="lg" onChange={(e) => setPickupLocation(e.target.value)} required>
                            <option disabled={true} >- Select agent-</option>
                            {
                                locationList.map((location) => {
                                    return (
                                        <option value={location.address}> {location.address}</option>)
                                })
                            }
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className='mb-5' controlId='address'>
                        <Form.Label>Return Location</Form.Label>
                        <Form.Select size="lg" onChange={(e) => setReturnLocation(e.target.value)} required>
                            <option disabled={true} >- Select agent-</option>
                            {
                                locationList.map((location) => {
                                    return (
                                        <option value={location.address}> {location.address}</option>)
                                })
                            }
                        </Form.Select>
                    </Form.Group>


                    <div className='mb-3'>
                        <Button variant='primary' type='submit'>Continue</Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default PickupLocationScreen;
