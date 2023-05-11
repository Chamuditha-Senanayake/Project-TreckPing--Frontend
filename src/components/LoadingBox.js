import React from 'react'
import { Spinner } from 'react-bootstrap'

//loading box component
const LoadingBox = () => {
    return (
        <Spinner animation='border' role='status'>
            <span className='visually-hidden'>Loading...</span>
        </Spinner>
    )
}

export default LoadingBox
