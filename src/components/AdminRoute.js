import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { Store } from '../Store'

//Restrict other users from admin routes
const AdminRoute = ({ children }) => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo && userInfo.isAdmin === 'true' ? children : <Navigate to="/signin" />
}

export default AdminRoute