import axios from 'axios';
import React, { useContext, useReducer, useState } from 'react'
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import getError from '../utils';


const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        default:
            return state;

    }
}

const ProfileScreen = () => {

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;
    const [name, setName] = useState(userInfo.name);
    const [email, setEmail] = useState(userInfo.email);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    //const navigate = useNavigate();
    const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
        loadingUpdate: false
    });

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(
                'api/users/profile',
                {
                    name,
                    email,
                    password
                },
                {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                }

            );
            dispatch({
                type: 'UPDATE_SUCCESS'
            });
            ctxDispatch({ type: 'USER_SIGNIN', payload: data });
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('User updated Successfully');
        } catch (err) {
            dispatch({
                type: 'FETCH_FAIL',
            });
            toast.error(getError(err));
        }
    }

    return (
        <div className='container small-container'>
            <Helmet>User Profile</Helmet>
            <h2 className="my-3">User Profile</h2>
            <form onSubmit={submitHandler}>

                <Form.Group className='mb-3' controlId='name'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                </Form.Group>

                <Form.Group className='mb-3' controlId='email'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>

                <Form.Group className='mb-3' controlId='password'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control value={password} type='password' onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>

                <Form.Group className='mb-3' controlId='confirmPassword'>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control value={confirmPassword} type='password' onChange={(e) => setConfirmPassword(e.target.value)} required />
                </Form.Group>

                <Button type='submit'>Update</Button>

            </form>

        </div>
    )
}

export default ProfileScreen
