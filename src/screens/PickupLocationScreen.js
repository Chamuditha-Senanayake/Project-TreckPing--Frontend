import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';

const PickupLocationScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispacth } = useContext(Store)

    const {
        userInfo,
        cart: { shippingAddress }
    } = state;

    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/shipping');
        }
    }, [userInfo, navigate]);


    const submitHandler = (e) => {
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
    return (
        <div>
            <Helmet>
                <title>Shipping Address</title>
            </Helmet>
            <CheckoutSteps step1 step2></CheckoutSteps>
            <div className='container small-container'>
                <h2 className='mt-5 mb-4'>Pickup & Return Locations</h2>
                <p className='italic'>Choose locations that are most convenient for you to pickup and return your package. You can pick and return your packages by visiting our sales agents.</p>
                <Form onSubmit={submitHandler}>

                    <Form.Group className='mt-5 mb-3' controlId='fullName'>
                        <Form.Label>Pickup Location</Form.Label>
                        <Form.Select size="lg" value={fullName} onChange={(e) => setFullName(e.target.value)} required >
                            <option><p className='h-2'>TreckPing Showroom</p> - No.04, Polgolla, Kandy</option>
                            <option>6/11, Badulla Rd, Bibila</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className='mb-5' controlId='address'>
                        <Form.Label>Return Location</Form.Label>
                        <Form.Select size="lg" value={fullName} onChange={(e) => setFullName(e.target.value)} required >
                            <option><p className='h-2'>TreckPing Showroom</p> - No.04, Polgolla, Kandy</option>
                            <option>6/11, Badulla Rd, Bibila</option>
                        </Form.Select >
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
