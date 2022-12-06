import { useContext, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { Badge, Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CartScreen from './screens/CartScreen';
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from './screens/ProductScreen';
import SigninScreen from './screens/SigninScreen';
import { Store } from './Store';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import getError from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import AddProductScreen from './screens/AddProductScreen';


function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = 'signin';
  }

  //const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();

  }, [])

  return (

    <BrowserRouter>
      <div className='d-flex flex-column site-container'>
        <ToastContainer position='bottom-center' limit={1} />
        <header>
          <Navbar className='navbar-custom' variant='dark' expand='lg'>
            <Container>
              {/* logo */}
              {(userInfo == null || userInfo.isAdmin === "false") &&
                <LinkContainer to='/'>
                  <Navbar.Brand className='nav-brand'>TreckPing  </Navbar.Brand>
                </LinkContainer>
              }

              {(userInfo && userInfo.isAdmin === "true") &&
                <LinkContainer to='/admin/dashboard'>
                  <Navbar.Brand className='nav-brand'>TreckPing  </Navbar.Brand>
                </LinkContainer>
              }


              <Navbar.Toggle aria-controls='basic-navbar-nav' />
              <Navbar.Collapse id='basic-navbar-nav'>
                {(userInfo == null || userInfo.isAdmin === "false") && <div className='mx-5'><SearchBox /></div>}

                <Nav className='ms-auto w-100 justify-content-end '>

                  <NavDropdown title="Categories" className='mx-5'>

                    {/* select category dropdown */}
                    {categories.map((category) => (
                      <LinkContainer to={`/search?category=${category}`}>
                        <NavDropdown.Item>{category}</NavDropdown.Item>
                      </LinkContainer>
                    ))}
                  </NavDropdown>

                  {(userInfo == null || userInfo.isAdmin === "false") &&
                    <Link to='/cart' className='nav-link'>
                      <i className='fas fa-shopping-cart'></i>
                      {cart.cartItems.length > 0 && (
                        <Badge pill bg='danger'>
                          {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                        </Badge>
                      )}
                    </Link>}

                  {/* User Info */}
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basc-nav-dropdown">
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link className='dropdown-item' to='#signout' onClick={signoutHandler}>
                        Sign Out
                      </Link>
                    </NavDropdown>


                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  )}

                  {userInfo && userInfo.isAdmin === 'true' && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/productlist">
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orderlist">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/userlist">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

        </header>

        <main className={userInfo && userInfo.isAdmin === 'true' && 'dashboard pt-5 pt-3'}>
          <Container className='mt-3'>
            <Routes>
              <Route path='/product/:slug' element={<ProductScreen />} />
              <Route path='/signin' element={<SigninScreen />} />
              <Route path='/signup' element={<SignupScreen />} />
              <Route path='/profile' element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              } />

              <Route path='/shipping' element={<ShippingAddressScreen />} />
              <Route path='/payment' element={<PaymentMethodScreen />} />
              <Route path='/placeorder' element={<PlaceOrderScreen />} />
              <Route path='/order/:id' element={
                <ProtectedRoute>
                  <OrderScreen />
                </ProtectedRoute>
              } />
              <Route path='/orderhistory' element={
                <ProtectedRoute>
                  <OrderHistoryScreen />
                </ProtectedRoute>
              } />

              <Route path='/cart' element={<CartScreen />} />
              <Route path='/search' element={<SearchScreen />} />

              {/* Admin Routes */}
              <Route path='/admin/dashboard' element={
                <AdminRoute>
                  <DashboardScreen />
                </AdminRoute>
              } />

              <Route path='/admin/productlist' element={
                <AdminRoute>
                  <AddProductScreen />
                </AdminRoute>
              } />

              <Route path='/' element={<HomeScreen />} />
            </Routes>
          </Container>
        </main>
        {/* <footer>
          <div className='text-center'>All rights reserved</div>          
        </footer> */}

        <footer class="bg-dark text-center text-white">

          <div class="container p-4 pb-0">

            <section class="mb-4">

              <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-facebook-f"></i></a>

              <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-instagram"></i></a>

              <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-youtube"></i></a>

              <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"><i class="fab fa-google"></i></a>


            </section>

          </div>

          <div class="text-center p-3 footer-container" >
            © 2022 Copyright :
            <a class="text-white" href="http://localhost:3000/">TreckPing</a>
          </div>

        </footer>
      </div>
    </BrowserRouter >
  );
}

export default App;