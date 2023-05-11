import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { Store } from '../Store'

//Restrict non authenticated users from user routes
const ProtectedRoute = ({ children }) => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo ? children : <Navigate to="/signin" />
}

export default ProtectedRoute