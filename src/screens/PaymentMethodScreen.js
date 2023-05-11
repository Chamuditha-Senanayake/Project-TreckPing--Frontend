import React, { useContext, useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import CheckoutSteps from '../components/CheckoutSteps'
import { Store } from '../Store'

//Payment Method Selection Screen
const PaymentMethodScreen = () => {

    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart: { shippingAddress, paymentMethod } } = state;
    const [paymentMethodName, setPaymentMethod] = useState(paymentMethod || 'Visa');

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);

    //set payment method in local storage
    const submitHandler = (e) => {
        e.preventDefault();
        ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
        localStorage.setItem('paymentMethod', paymentMethodName);
        navigate('/placeorder')
    }
    return (
        <div>
            <CheckoutSteps step1 step2 step3></CheckoutSteps>
            <div className='container small-container'>
                <Helmet><title>Payment Method</title></Helmet>
                <h2 className='mt-5 mb-4'>Payment Method</h2>
                <Form onSubmit={submitHandler}>
                    <div className='mb-3'>
                        <Form.Check type='radio' id='Visa' label='Visa' value='Visa' checked={paymentMethodName === 'Visa'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    </div>
                    <div className='mb-3'>
                        <Form.Check type='radio' id='Master' label='Master' value='Master' checked={paymentMethodName === 'Master'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    </div>
                    <div className='mb-3'>
                        <Button type='submit'>Continue</Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default PaymentMethodScreen
