import React from 'react'
import { Button, Container, Form } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import { Link, useLocation } from 'react-router-dom'

const SigninScreen = () => {
    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

    return (
        <Container className='small-container'>
            <Helmet>
                <title>Sign In</title>
            </Helmet>
            <Form>
                <Form.Group className='mb-3' controlId='email'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type='email' required></Form.Control>
                </Form.Group>
                <Form.Group className='mb-3' controlId='password'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type='password' required></Form.Control>
                </Form.Group>
                <div className='mb-3'>
                    <Button type='submit'>Sign In</Button>
                </div>
                <div className='mb-3'>
                    Don't have an account? {' '}
                    <Link to={`/signup?redirect=${redirect}`}>Get Started</Link>
                </div>
            </Form>
        </Container>
    )
}

export default SigninScreen
