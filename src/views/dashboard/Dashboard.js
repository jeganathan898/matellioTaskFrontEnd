import React, { useState, useEffect } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { RadioButton } from 'primereact/radiobutton'
import { Dialog } from 'primereact/dialog'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { storeSelectedUser } from 'src/redux/slices/commonSlice'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { userData } from 'src/utills/data'
import CustomFetch from 'src/utills/axiosCustomFetch'
import moment from 'moment'

const Dashboard = () => {
  const customAxios = CustomFetch()
  const [users, setusers] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [displayModal, setDisplayModal] = useState(false)
  const [editUser, setEditUser] = useState(false)
  const [genter, setGender] = useState('')
  const [address, setAddress] = useState([
    { street: '', city: '', postalCode: '', country: '', state: '' },
  ])
  const router = useNavigate()
  const dispatch = useDispatch()
  const baseUrl = process.env.REACT_APP_BASE_URL

  const addAddress = () => {
    setAddress([...address, { street: '', city: '', postalCode: '', country: '', state: '' }])
  }

  const editUserHandle = (rowData) => {
    setDisplayModal(true)
    setEditUser(true)
    setSelectedUser(rowData)
    setAddress(rowData?.address)
  }

  const hideModal = () => {
    setDisplayModal(false)
    setEditUser(false)
  }

  const deleteAddress = (index) => {
    const updatedAddresses = [...address]
    updatedAddresses.splice(index, 1)
    setAddress(updatedAddresses)
  }

  const deleteIconColumn = (rowData) => {
    console.log('reoData', rowData)
    return (
      <div style={{ display: 'flex', gap: '20px' }}>
        <button className="option_btn" onClick={() => handleUser(rowData, 'view-user')}>
          View
        </button>
        <button className="option_btn" onClick={() => editUserHandle(rowData)}>
          Edit
        </button>
      </div>
    )
  }

  const handleUser = (data, route) => {
    dispatch(storeSelectedUser(data))
    router(`/${route}`)
    console.log('data', data)
  }

  console.log('Selecteduser', selectedUser)

  useEffect(() => {
    customAxios.get('/api/users').then((response) => {
      setusers(response.data?.data)
      console.log('Addre', response?.data?.data?.address)
    })
  }, [])
  const handleAddressValueChange = (e, index, type) => {
    setAddress(prevAddress => {
      const updatedAddress = [...prevAddress];
      if (type === 'street') {
        updatedAddress[index].street = e.target.value;
      } else if (type === 'city') {
        updatedAddress[index].city = e.target.value;
      } else if (type === 'state') {
        updatedAddress[index].state = e.target.value;
      } else if (type === 'country') {
        updatedAddress[index].country = e.target.value;
      } else if (type === 'postalcode') {
        updatedAddress[index].postalCode = e.target.value;
      }
      return updatedAddress;
    });
  };
  return (
    <>
      <div className="card user_manage_header">
        <Card className="flex justify-content-between align-items-center user_manage_header">
          <h4 className="m-0">User Management</h4>
          <div className="position-relative add_button">
            <Button
              className="border-0 flex justify-content-center align-items-center position-relative gap-2 add_user_button"
              type="button"
              label="Add User"
              onClick={() => setDisplayModal(true)}
              // size="small"
            />
            <i
              className="position-absolute plus_icon"
              style={{ cursor: 'pointer' }}
              onClick={() => setDisplayModal(true)}
            ></i>
          </div>
        </Card>
      </div>

      <div>
        <div className="card userTableListContainer">
          <DataTable
            value={users}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: '50rem' }}
            className="userTableList"
            size="small"
            selection={selectedUser}
            onSelectionChange={(e) => setSelectedUser(e.value)}
          >
            <Column field="id" header="Id" sortable style={{ width: '5%' }}></Column>
            <Column field="firstName" header="FirstName" sortable style={{ width: '10%' }}></Column>
            <Column field="lastName" header="LastName" sortable style={{ width: '10%' }}></Column>
            <Column field="email" header="Email" sortable style={{ width: '12%' }}></Column>
            <Column field="phoneNo" header="PhoneNo" sortable style={{ width: '12%' }}></Column>
            <Column field="dob" header="DOB" sortable style={{ width: '12%' }}></Column>
            <Column field="gender" header="Gender" sortable style={{ width: '12%' }}></Column>
            <Column header="Actions" body={deleteIconColumn} style={{ width: '12%' }}></Column>
          </DataTable>
        </div>
        <Dialog visible={displayModal} onHide={hideModal}>
          <Formik
            initialValues={{
              firstName: selectedUser ? selectedUser.firstName : '',
              lastName: selectedUser ? selectedUser.lastName : '',
              email: selectedUser ? selectedUser.email : '',
              phoneNo: selectedUser ? selectedUser.phoneNo : '',
              dob: selectedUser ? selectedUser.dob : '',
              gender: selectedUser ? selectedUser.gender : '',
            }}
            validationSchema={Yup.object({
              firstName: Yup.string().required('Required'),
              lastName: Yup.string().required('Required'),
              email: Yup.string().email('Invalid email address').required('Required'),
              phoneNo: Yup.string().required('Required'),
              dob: Yup.date().max(new Date(), 'Date of birth must be in the past').nullable(),
              gender: Yup.string().required('Required'),
            })}
            onSubmit={(values) => {
              
             if(editUser) {
                values.id = localStorage.getItem('userId');
                values.address = address;
                alert(JSON.stringify(values));
                customAxios
                  .put('/api/users', values)
                  .then((response) => {
                    // Handle successful post request
                    console.log('Post request successful')
                    console.log(response.data) // Response data from the server
                    hideModal() // Close the modal after successful post
                  })
                  .catch((error) => {
                    // Handle error
                    console.error('Error posting data:', error)
                    // Optionally, you can handle errors by displaying an error message to the user
                  })
             } else {
              console.log('values', values);
              values.address = address;
              alert(JSON.stringify(values));
              customAxios
                .post('/api/users', values)
                .then((response) => {
                  // Handle successful post request
                  console.log('Post request successful')
                  console.log(response.data) // Response data from the server
                  hideModal() // Close the modal after successful post
                })
                .catch((error) => {
                  // Handle error
                  console.error('Error posting data:', error)
                  // Optionally, you can handle errors by displaying an error message to the user
                })
             }
                
             
             
            }}
          >
            {({ isSubmitting, setFieldValue  }) => (
              <Form>
                {editUser ? (
                  <h5 className="pb-4">Update User</h5>
                ) : (
                  <h5 className="pb-4">New User</h5>
                )}
                <div className="flexBox">
                  <Field type="text" name="firstName" placeholder="firstName" as={InputText} />
                  <ErrorMessage name="firstName" component="div" className="error" />
                  <Field type="text" name="lastName" placeholder="lastName" as={InputText} />
                  <ErrorMessage name="lastName" component="div" className="error" />
                </div>
                <div className="flexBox">
                  <Field type="email" name="email" placeholder="Email" as={InputText} />
                  <ErrorMessage name="email" component="div" className="error" />
                  <Field type="text" name="phoneNo" placeholder="PhoneNo" as={InputText} />
                  <ErrorMessage name="phoneNo" component="div" className="error" />
                </div>
                <div className="flexBox">
                  <Field
                    type="date"
                    name="dob"
                    placeholder="DOB"
                    as={Calendar}
                    value={selectedUser ? new Date(selectedUser.dob) : null}
                    dateFormat="mm/dd/yy"
                    onChange={(e) => {
                      // Convert the selected date to the appropriate format and set it in Formik state
                      setFieldValue('dob', moment(e.value).format('YYYY-MM-DD'))
                    }}
                  />
                  <ErrorMessage name="dob" component="div" className="error" />
                  <div className="">
                    <label>Select a gender</label> <br />
                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex align-items-center">
                        <Field type="radio" name="gender" value="male" as={RadioButton} />
                        <label htmlFor="male" className="ml-2">
                          Male
                        </label>
                      </div>
                      <div className="flex align-items-center">
                        <Field type="radio" name="gender" value="female" as={RadioButton} />
                        <label htmlFor="female" className="ml-2">
                          Female
                        </label>
                      </div>
                    </div>
                    <ErrorMessage name="gender" component="div" className="error" />
                  </div>
                </div>
                <div>
                  <Button type="button" label="Add Address" onClick={addAddress} />
                  {address.map((addr, index) => (
                    <div key={index} className="pt-3">
                      <h5>Address{index + 1}</h5>
                      <div className="flexBox">
                        <Field
                          type="text"
                          name={addr?.street}
                          placeholder="Street Address"
                          as={InputText}
                          value={addr?.street}
                          onChange={(e)=>{ handleAddressValueChange(e, index, 'street') }}
                        />
                        <Field
                          type="text"
                          name={addr?.city}
                          placeholder="City"
                          as={InputText}
                          value={addr?.city}
                          onChange={(e)=>{ handleAddressValueChange(e, index, 'city') }}
                        />
                        <Field
                          type="text"
                          name={addr?.postalCode}
                          placeholder="Postal Code"
                          as={InputText}
                          value={addr?.postalCode}
                          onChange={(e)=>{ handleAddressValueChange(e, index, 'postalcode') }}
                        />

                        <Field
                          type="text"
                          name={addr?.state}
                          placeholder="State"
                          as={InputText}
                          value={addr?.state}
                          onChange={(e)=>{ handleAddressValueChange(e, index, 'state') }}
                        />
                        <Field
                          type="text"
                          name={addr?.country}
                          placeholder="Country"
                          as={InputText}
                          value={addr?.country}
                          onChange={(e)=>{ handleAddressValueChange(e, index, 'country') }}
                        />
                        <Button
                          type="button"
                          label="Delete"
                          className="p-button-danger"
                          onClick={() => deleteAddress(index)}
                          
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="submit" label="Save" disabled={isSubmitting} />
              </Form>
            )}
          </Formik>
        </Dialog>
      </div>
    </>
  )
}

export default Dashboard
