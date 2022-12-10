import { React, useEffect, useReducer } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import { Row, Col } from 'react-bootstrap'
import RentProduct from '../components/rentProduct';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//import Hero from '../hero-1.png'
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

const RentHomeScreen = () => {

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
            <div className=' hero' ></div>

            {/* All Products */}

            <div className="products featured-products mb-4">
                <h2 className="mb-4 mt-5">All Products</h2>
                {loading ? (
                    <LoadingBox />
                ) : error ? (
                    <MessageBox variant='danger'>{error}</MessageBox>
                ) : (<Row>
                    {products.reverse().map((product) => (
                        <Col key={product.slug} sm={6} md={4} lg={3} className="mb-5">
                            <RentProduct product={product} ></RentProduct>
                        </Col>
                    ))}
                </Row>)
                }
            </div>
        </div >
    )
}

export default RentHomeScreen