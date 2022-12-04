import { React, useEffect, useReducer } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import { Row, Col } from 'react-bootstrap'
import Product from '../components/product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//import data from '../data';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, products: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

const HomeScreen = () => {

    const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
        products: [],
        loading: true,
        error: ''
    })
    //const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ _type: 'FETCH_REQUEST' })
            try {
                const result = await axios.get('/api/products');
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data })
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
            //setProducts(result.data);
        };
        fetchData();
    }, [])

    return (
        <div>
            <Helmet>
                <title>TreckPing</title>
            </Helmet>

            <div className="products mb-4">
                <h2 className="mb-4 mt-5">Newly Arrived</h2>
                {loading ? (
                    <LoadingBox />
                ) : error ? (
                    <MessageBox variant='danger'>{error}</MessageBox>
                ) : (<Row>
                    {products.map((product, index) => (
                        // if(index==4){ }
                        <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                            <Product product={product} ></Product>

                        </Col>
                    ))}
                </Row>)
                }
            </div>
            <hr />

            <div className="products featured-products mb-4">
                <h2 className="mb-4 mt-5">Featured Products</h2>
                {loading ? (
                    <LoadingBox />
                ) : error ? (
                    <MessageBox variant='danger'>{error}</MessageBox>
                ) : (<Row>
                    {products.map((product) => (
                        <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                            <Product product={product} ></Product>
                        </Col>
                    ))}
                </Row>)
                }
            </div>
        </div >
    )
}

export default HomeScreen