import React from 'react'
import { Alert } from 'react-bootstrap'

//message box component
const MessageBox = (props) => {
    return (
        <Alert variant={props.variant || 'info'}>{props.children}</Alert>
    )
}

export default MessageBox
