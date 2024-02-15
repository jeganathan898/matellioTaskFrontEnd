import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import axios from 'axios'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { Formik,ErrorMessage } from 'formik'
import { updateAccessToken,updateLoggedUserDetails } from 'src/redux/slices/commonSlice'
import { useDispatch } from 'react-redux'
import * as Yup from "yup"

const schema = Yup.object().shape({
  email: Yup.string()
    .required("Email is a required field")
    .email("Invalid email format"),
  password: Yup.string()
    .required("Password is a required field")
    .min(8, "Password must be at least 8 characters"),
});



const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginErr, setLoginErr] = useState('');
  const submitLogin = (values) => {
    const url = process.env.REACT_APP_API_BASE_URL;
    let data = {
      email: values.email,
      password: values.password
    };
    axios.post(url+"/api/login", data)
    .then(response => {
      console.log('Request successful:', response.data);
      if(response.data.status) {
        localStorage.setItem("refreshToken", response.data.refresh);
        localStorage.setItem("userId", response.data.user.id);
        dispatch(updateAccessToken(response.data.access));
        dispatch(updateLoggedUserDetails(response.data.user));
        navigate('/dashboard');
      } 
      
    })
    .catch(error => {
      console.error('Request failed:', error);
    });
  }
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
            <Formik
              validationSchema={schema}
              initialValues={{ email: "", password: "" }}
              onSubmit={(values) => {
                submitLogin(values);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
              <form noValidate onSubmit={handleSubmit}>
                <CCard className="p-4">
                  <CCardBody>
                      <>
                      <h1>Login</h1>
                      <p className="text-medium-emphasis">Sign In to your account</p>
                      <p style={{ color: 'red' }}>{loginErr}</p>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput placeholder="Email ID" name='email' id='email' autoComplete="username" onChange={handleChange} onBlur={handleBlur} value={values.email} />
                        {/* <p className='error'>{errors.email && touched.email && errors.email}</p> */}
                        
                      </CInputGroup>
                      <ErrorMessage name="email" component="div" />
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Password"
                          name='password'
                          id='password'
                          autoComplete="current-password"
                        />
                        {/* <p className='error'>{errors.password && touched.password && errors.password}</p> */}
                      </CInputGroup>
                      <ErrorMessage name="password" component="div" />
                      <CRow>
                        <CCol xs={6}>
                          <CButton type='submit' color="primary" className="px-4">
                            Login
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-right">
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </CCol>
                      </CRow>
                      </>
                    
                  </CCardBody>
                </CCard>
                
              </form>
              
              )}
              </Formik>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
