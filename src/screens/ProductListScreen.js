import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import swal from 'sweetalert';
import { Store } from '../Store';
import getError from '../utils';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                products: action.payload.products,
                page: action.payload.page,
                pages: action.payload.pages,
                loading: false,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'CREATE_REQUEST':
            return { ...state, loadingCreate: true };
        case 'CREATE_SUCCESS':
            return {
                ...state,
                loadingCreate: false,
            };
        case 'CREATE_FAIL':
            return { ...state, loadingCreate: false };


        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_SUCCESS':
            return {
                ...state,
                loadingDelete: false,
                successDelete: true,
            };
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false, successDelete: false };

        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false };
        default:
            return state;
    }
};

const ProductListScreen = () => {

    const [
        {
            loading,
            error,
            products,
            pages,
            loadingCreate,
            loadingDelete,
            successDelete,
        },
        dispatch,
    ] = useReducer(reducer, {
        loading: true,
        error: '',
    });


    //pagination
    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1;

    const { state } = useContext(Store);
    const { userInfo } = state;


    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(`/api/products/admin?page=${page} `, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });

                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) { }
        };

        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [page, userInfo, successDelete]);


    const createHandler = async () => {
        if (true) {
            try {
                dispatch({ type: 'CREATE_REQUEST' });
                const { data } = await axios.post(
                    '/api/products',
                    {},
                    {
                        headers: { Authorization: `Bearer ${userInfo.token}` },
                    }
                );
                dispatch({ type: 'CREATE_SUCCESS' });
                navigate(`/admin/product/${data.product._id}`);
            } catch (err) {
                toast.error(getError(error));
                dispatch({
                    type: 'CREATE_FAIL',
                });
            }
        }
    };

    const deleteHandler = async (product) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover these details !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willDelete) => {
                if (willDelete) {
                    try {
                        await axios.delete(`/api/products/${product._id}`, {
                            headers: { Authorization: `Bearer ${userInfo.token}` },
                        });
                        dispatch({ type: 'DELETE_SUCCESS' });
                    } catch (err) {
                        toast.error(getError(error));
                        dispatch({
                            type: 'DELETE_FAIL',
                        });
                    }

                    swal("Product has been removed!", {
                        icon: "success",
                    });

                }
            })

    };


    return (
        <div>

            <Row>
                <Col>
                    <h2 className="mb-5">Products</h2>
                </Col>
                <Col className="col text-end">
                    <div>
                        {userInfo.isAdmin == "true" &&
                            <Button type="button" onClick={createHandler}>
                                Create Product
                            </Button>
                        }
                    </div>
                </Col>
            </Row>

            {loadingCreate && <LoadingBox></LoadingBox>}
            {loadingDelete && <LoadingBox></LoadingBox>}

            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    <table className="table product-tbl">
                        <thead>
                            <tr>
                                {/* <th>ID</th> */}
                                <th></th>
                                <th>NAME</th>
                                <th>PRICE</th>
                                <th>QUANTITY</th>
                                <th>CATEGORY</th>
                                <th>BRAND</th>
                                {userInfo.isAdmin == "true" && <th>ACTIONS</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    {/* <td>{product._id}</td> */}
                                    <td>{product.countInStock <= 10 ? (product.countInStock <= 5 ? <i className='fas fa-exclamation-circle danger'></i> : <i className='fas fa-exclamation-circle warning'></i>) : <></>}</td>
                                    <td>{product.name}</td>
                                    <td>{product.price}</td>
                                    <td>{product.countInStock}</td>
                                    <td>{product.category}</td>
                                    <td>{product.brand}</td>
                                    {userInfo.isAdmin == "true" &&
                                        <td>
                                            <Button
                                                type="button"
                                                variant="light"
                                                onClick={() => navigate(`/admin/product/${product._id}`)}
                                            >
                                                Edit
                                            </Button>
                                            &nbsp;
                                            <Button
                                                type="button"
                                                variant="light"
                                                onClick={() => { deleteHandler(product) }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        {[...Array(pages).keys()].map((x) => (
                            <Link
                                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                                key={x + 1}
                                to={`/admin/products?page=${x + 1}`}
                            >
                                {x + 1}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div >
    )

}


export default ProductListScreen
