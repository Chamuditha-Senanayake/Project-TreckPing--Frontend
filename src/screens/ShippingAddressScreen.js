import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';
import getError from '../utils';

const ShippingAddressScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispacth } = useContext(Store)

    const {
        userInfo,
        cart: { shippingAddress },
    } = state;

    const [isPickup, setIsPickup] = useState(false);
    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [locationList, setLocationList] = useState([]);
    //const savedLocation = localStorage.getItem("shippingAddress")

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/shipping');
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        const fetchLoactionData = async () => {
            try {
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



    const addressHandler = (e) => {
        e.preventDefault();

        ctxDispacth({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                fullName,
                address,
                city,
                postalCode
            }
        });
        localStorage.setItem(
            'shippingAddress',
            JSON.stringify({
                fullName,
                address,
                city,
                postalCode
            })
        );
        navigate('/payment');
    }


    const pickupHandler = (e) => {
        e.preventDefault();

        ctxDispacth({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                fullName: userInfo.name,
                address,
                city: "",
                postalCode: ""
            }
        });
        localStorage.setItem(
            'shippingAddress',
            JSON.stringify({
                fullName: userInfo.name,
                address,
                city: "",
                postalCode: ""
            })
        );
        navigate('/payment');
    }

    return (
        <div>
            <Helmet>
                <title>Shipping Address</title>
            </Helmet>
            <CheckoutSteps step1 step2></CheckoutSteps>
            <div className='container medium-container'>
                <h2 className='mt-5 mb-4'>Shipping Address</h2>
                <Form >
                    <Form.Label><strong>You can pickup gears through our sales agents in your area. Or we can deliver them to your doorstep.</strong> <br /><br /> </Form.Label>
                    <p className='pickup-type-txt'>Select pickup type :</p>

                    <Form.Check
                        className="mb-3 mt-3 radio-checked h6"
                        type="radio"
                        label="Deliver to my doorstep "
                        name="adress"
                        checked={!isPickup}
                        onChange={() => setIsPickup(!(isPickup))}
                    />

                    <Form.Check
                        className="mb-3 radio-checked h6"
                        type="radio"
                        label="Pickup from an agent"
                        name="adress"
                        checked={isPickup}
                        onChange={() => setIsPickup(!(isPickup))}
                    />
                    <br />
                    <hr />
                    {
                        isPickup ? (
                            <div>
                                <Form.Group className='mt-5 mb-3' controlId='fullName'>
                                    <Form.Label>Pickup Location</Form.Label>

                                    <Form.Select size="lg" onChange={(e) => setAddress(e.target.value)}>
                                        {/* {
                            locationId != null ?
                                <option disabled={true} >- Select agent-</option> :
                                <option disabled={true} selected>- Select agent-</option>
                        } */}
                                        <option disabled={true} >- Select agent-</option>

                                        {
                                            locationList.map((location) => {
                                                return (
                                                    <option value={location.address}> {location.address}</option>)
                                            })
                                        }
                                    </Form.Select>

                                    {/* <Form.Select size="lg" onChange={(e) => setAddress(e.target.value)} required >
                                        <option value="TreckPing Showroom - No.04, Polgolla, Kandy">TreckPing Showroom - No.04, Polgolla, Kandy</option>
                                        <option value="6/11, Badulla Rd, Bibila">6/11, Badulla Rd, Bibila</option>
                                    </Form.Select> */}
                                </Form.Group>
                                <br />
                                <div className='mb-3'>
                                    <Button variant='primary' type='button' onClick={pickupHandler}>Continue</Button>
                                </div>
                            </div>
                        ) :
                            (
                                <div className='mt-5 mb-5'>
                                    <Form.Group className='mb-3' controlId='fullName'>
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                    </Form.Group>

                                    <Form.Group className='mb-3' controlId='address'>
                                        <Form.Label>Address Line</Form.Label>
                                        <Form.Control as="textarea" rows={5} value={address} onChange={(e) => setAddress(e.target.value)} required />
                                    </Form.Group>

                                    <Form.Group className='mb-3' controlId='city'>
                                        <Form.Label>City</Form.Label>
                                        <Form.Control value={city} onChange={(e) => setCity(e.target.value)} required />
                                    </Form.Group>

                                    <Form.Group className='mb-3' controlId='postalCode'>
                                        <Form.Label>Postal Code</Form.Label>
                                        <Form.Control value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                                    </Form.Group>
                                    <br />
                                    <div className='mb-3'>
                                        <Button variant='primary' onClick={addressHandler}>Continue</Button>
                                    </div>
                                </div>
                            )
                    }

                </Form>
            </div>
        </div>
    )
}

export default ShippingAddressScreen
