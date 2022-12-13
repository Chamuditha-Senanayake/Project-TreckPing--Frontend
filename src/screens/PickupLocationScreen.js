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
        rentCart: { deliveryAddress }
    } = state;

    const [pickupLocation, setPickupLocation] = useState(deliveryAddress.pickupLocation || '');
    const [returnLocation, setReturnLocation] = useState(deliveryAddress.returnLocation || '');

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/pickuplocation');
        }
    }, [userInfo, navigate]);


    const submitHandler = (e) => {
        e.preventDefault();

        ctxDispacth({
            type: 'SAVE_DELIVERY_ADDRESS',
            payload: {
                pickupLocation,
                returnLocation,
            }
        });
        localStorage.setItem(
            'deliveryAddress',
            JSON.stringify({
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
                        <Form.Select size="lg" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required >
                            <option value="TreckPing Showroom - No.04, Polgolla, Kandy">TreckPing Showroom - No.04, Polgolla, Kandy</option>
                            <option value="6/11, Badulla Rd, Bibila">6/11, Badulla Rd, Bibila</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className='mb-5' controlId='address'>
                        <Form.Label>Return Location</Form.Label>
                        <Form.Select size="lg" value={returnLocation} onChange={(e) => setReturnLocation(e.target.value)} required >
                            <option value="TreckPing Showroom - No.04, Polgolla, Kandy">TreckPing Showroom - No.04, Polgolla, Kandy</option>
                            <option value="6/11, Badulla Rd, Bibila">6/11, Badulla Rd, Bibila</option>
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
