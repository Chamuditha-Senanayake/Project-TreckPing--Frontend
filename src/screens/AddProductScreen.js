import React, { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom';

const AddProductScreen = () => {

    const navigate = useNavigate();
    const [productName, setProductName] = useState('');
    const [slug, setSlug] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    const submitHandler = (e) => {
        e.preventDefault();

        // ctxDispacth({
        //     type: 'SAVE_SHIPPING_ADDRESS',
        //     payload: {
        //         fullName,
        //         address,
        //         city,
        //         postalCode
        //     }
        // });

        navigate('/payment');
    }

    return (
        <div>
            <Helmet>
                <title>Add New Product</title>
            </Helmet>
            <div className='container medium-container'>
                <h2 className='my-3'>Add New Product</h2>
                <Form onSubmit={submitHandler}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className='mb-3' controlId='productName'>
                                <Form.Label>Product Name</Form.Label>
                                <Form.Control value={productName} onChange={(e) => setProductName(e.target.value)} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className='mb-3' controlId='slug'>
                                <Form.Label>Slug</Form.Label>
                                <Form.Control value={slug} onChange={(e) => setSlug(e.target.value)} required />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className='mb-3' controlId='brand'>
                                <Form.Label>Brand</Form.Label>
                                <Form.Control value={brand} onChange={(e) => setBrand(e.target.value)} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className='mb-3' controlId='slug'>
                                <Form.Label>Category</Form.Label>
                                <Form.Control value={category} onChange={(e) => setCategory(e.target.value)} required />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <Form.Group className='mb-3' controlId='brand'>
                                <Form.Label>Brand</Form.Label>
                                <Form.Control value={brand} onChange={(e) => setBrand(e.target.value)} required />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className='mb-3' controlId='image'>
                                <Form.Label>Image</Form.Label>
                                <Form.Control onChange={(e) => setCategory(e.target.value)} required />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className='mb-3' controlId='price'>
                                <Form.Label>Price</Form.Label>
                                <Form.Control value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className='mb-3' controlId='description'>
                                <Form.Label>Description</Form.Label>
                                <textarea className='form-control' value={description} onChange={(e) => setDescription(e.target.value)} required />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className='mb-3'>
                        <Button variant='primary' type='submit'>Continue</Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default AddProductScreen
