import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import getError from '../utils';

//reducer for handle states
const reducer = (state, action) => {
    switch (action.type) {
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

        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true, errorUpload: '' };
        case 'UPLOAD_SUCCESS':
            return {
                ...state,
                loadingUpload: false,
                errorUpload: '',
            };
        case 'UPLOAD_FAIL':
            return { ...state, loadingUpload: false, errorUpload: action.payload };

        default:
            return state;
    }
};

//Product Edit Screen
const ProductEditScreen = () => {

    const navigate = useNavigate();
    const params = useParams();
    const { id: productId } = params;

    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [rent, setRent] = useState('');
    const [penalty, setPenalty] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [countInStockForRent, setCountInStockForRent] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                //get product by id
                const { data } = await axios.get(`/api/products/${productId}`);
                setName(data.name);
                setSlug(data.slug);
                setPrice(data.price);
                setRent(data.rent);
                setPenalty(data.penalty);
                setImage(data.image);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setCountInStockForRent(data.countInStockForRent);
                setBrand(data.brand);
                setDescription(data.description);
                dispatch({ type: 'FETCH_SUCCESS' });
            } catch (err) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err),
                });
            }
        };
        fetchData();
    }, [productId]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            //update product by id
            await axios.put(
                `/api/products/${productId}`,
                {
                    _id: productId,
                    name,
                    slug,
                    price,
                    rent,
                    penalty,
                    image,
                    category,
                    brand,
                    countInStock,
                    countInStockForRent,
                    description,
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }
            );
            dispatch({
                type: 'UPDATE_SUCCESS',
            });
            toast.success('Product updated successfully');
            navigate('/admin/products');
        } catch (err) {
            toast.error(getError(err));
            dispatch({ type: 'UPDATE_FAIL' });
        }
    };


    const uploadFileHandler = async (e, forImages) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
        try {
            dispatch({ type: 'UPLOAD_REQUEST' });
            //upload image for cloudinary
            const { data } = await axios.post('/api/upload', bodyFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authorization: `Bearer ${userInfo.token}`,
                },
            });
            dispatch({ type: 'UPLOAD_SUCCESS' });
            toast.success('Image uploaded successfully');
            setImage(data.secure_url);
        } catch (err) {
            toast.error(getError(err));
            dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
        }
    };

    return (
        <Container className="small-container">
            <Helmet>
                <title>Edit Product </title>
            </Helmet>
            <h2 className="mb-5">Edit Product </h2>

            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <Form onSubmit={submitHandler} >
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="slug">
                        <Form.Label>Slug</Form.Label>
                        <Form.Control
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Rent per day</Form.Label>
                        <Form.Control
                            value={rent}
                            onChange={(e) => setRent(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Penalty charges per day</Form.Label>
                        <Form.Control
                            value={penalty}
                            onChange={(e) => setPenalty(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="imageFile">
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control type="file"
                            onChange={uploadFileHandler}
                        />
                        {loadingUpload && <LoadingBox></LoadingBox>}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="category">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="brand">
                        <Form.Label>Brand</Form.Label>
                        <Form.Control
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="countInStock">
                        <Form.Label>Count In Stock</Form.Label>
                        <Form.Control
                            type='number'
                            value={countInStock}
                            onChange={(e) => setCountInStock(e.target.value)}
                            required
                        />

                    </Form.Group>
                    <Form.Group className="mb-3" controlId="countInStockForRent">
                        <Form.Label>Count In Stock For Rent</Form.Label>
                        <Form.Control
                            type='number'
                            value={countInStockForRent}
                            onChange={(e) => setCountInStockForRent(e.target.value)}
                            required
                        />

                    </Form.Group>
                    <Form.Group className="mb-5" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea"
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div className="mb-3">
                        <Button
                            disabled={loadingUpdate}
                            type="submit">
                            Save
                        </Button>
                        {loadingUpdate && <LoadingBox></LoadingBox>}
                    </div>
                </Form>
            )}
        </Container>
    )
}

export default ProductEditScreen
