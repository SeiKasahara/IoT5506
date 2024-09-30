import { useState, useEffect } from 'react';
import api from '../../../libs/api';
import { emailRegex, pwRegex } from '../../../libs/regex';
import { Input } from '../input';
import { Button } from '../button';
import { checkUnique } from '../../../libs/checkUnique';

function isValidEmail(email) {
  return emailRegex.test(email);
}

const Account = () => {
  const [IoTshowModal, setIoTShowModal] = useState(false);
  const [EmailshowModal, setEmailShowModal] = useState(false);
  const [PasswordChange, setPasswordChange] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [buttonVariant, setButtonVariant] = useState('inactive');
  const [PWbuttonVariant, setPWbuttonVariant] = useState('inactive');
  const [oldPWbuttonVariant, setOldPWbuttonVariant] = useState('inactive');
  const [emailInputState, setEmailInputState] = useState('default');
  const [newPW, setNewPW] = useState('');
  const [oldPW, setOldPW] = useState('');


  const getEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      //console.log(token);
      const response = await api.get('/api/user/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userEmail = response.data.email;
      setUserEmail(userEmail);
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  };

  const handleEmailSubmit = async () => {
    try {
      const message = await checkUnique(newEmail, 'email');
      if (message) {
        setEmailInputState('error');
        setErrorMessage(message);
      } else {
        try {
          const response = await api.post('/api/user/update-email/', 
            { email: newEmail },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
  
          if (response.status !== 200) {
            throw new Error('Failed to update email');
          }
  
          const data = response.data;
          console.log('Email updated successfully', data);
          window.location.reload();
        } catch (error) {
          console.error('Error updating user email', error);
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  
  const handlePasswordSubmit = async () => {
    try {
      const response = await api.put('/api/user/change-password/', 
        {
          old_password: oldPW,
          new_password: newPW
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      if (response.status === 200) {
        const data = response.data;
        console.log('Password updated successfully', data);
        alert('Password updated successfully');
        window.location.reload();
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.log(error.response.data.old_password || error.response.data.detail || 'Error updating password');
      } else {
        console.error('Error updating user password', error);
        setPasswordErrorMessage('Error updating password');
      }
    }
  };
  

  useEffect(() => {
    getEmail();
  }, []);

  const handleEditIoTClick = () => {
    setIoTShowModal(true);
  };

  const handleCloseIoTModal = () => {
    setIoTShowModal(false);
  };

  const handleEditEmailClick = () => {
    setEmailShowModal(true);
  };

  const handleCloseEditEmail = () => {
    setEmailShowModal(false);
  };

  const handlePasswordChange = () => {
    setPasswordChange(true);
  }

  const handleClosePassword = () => {
    setPasswordChange(false);
  }

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setNewEmail(value);
    setButtonVariant(event.target.value ? 'default' : 'inactive');
    if (isValidEmail(value)) {
      setEmailInputState('default');
      setButtonVariant('default');
      setErrorMessage('');
    } else {
      setEmailInputState('error');
      setButtonVariant('inactive');
      setErrorMessage('Please enter correct email');
    }
  };

  const handlePasswordInputChange = (event) => {
    const value = event.target.value;
    setNewPW(value);
    setPWbuttonVariant(event.target.value ? 'default' : 'inactive');
    if (value.length < 8) {
      setPasswordErrorMessage(
        "This password is too short. It must contain at least 8 characters.",
      );
      setPWbuttonVariant("inactive");
      return false;
    } else if (pwRegex.test(value)) {
      setPasswordErrorMessage("This password is entirely numeric.");
      setPWbuttonVariant("inactive");
      return false;
    } else {
      setPasswordErrorMessage('');
      setPWbuttonVariant("default");
      return true;
    }
  };

  const handleOldPasswordInputChange = (event) => {
    const value = event.target.value;
    setOldPW(value);
    setOldPWbuttonVariant(event.target.value ? 'default' : 'inactive');
  };

  const PWVariant = PWbuttonVariant === 'default' && oldPWbuttonVariant === 'default' ? 'default' : 'inactive';

  return (
    <div className="p-6 bg-volt-background-light-mode w-[1000px] h-full rounded-md shadow-md">
      <p className="text-xl font-bold mb-4">Account and Password</p>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Account Settings</h2>
      </div>

      <div className="separator h-0.5 w-full mt-2 mb-5 bg-gray-300 mx-1 self-center"></div>

      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Bind IoT Device</span>
          <button className="text-blue-500" onClick={handleEditIoTClick}>Edit</button>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-semibold">Update Password</span>
          <button className="text-blue-500" onClick={handlePasswordChange}>Edit</button>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-semibold">Update Email</span>
          <button className="text-blue-500" onClick={handleEditEmailClick}>Edit</button>
        </div>
      </div>

      {/* Modal for editing information */}
      {IoTshowModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-md shadow-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Informations</h3>
            {/* Add your form for editing here */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">IoT Device Token</label>
              <input type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 bg-gray-300 rounded-md" 
                onClick={handleCloseIoTModal}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {EmailshowModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-md shadow-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Informations</h3>
            {/* Add your form for editing here */}
            <h3  className="text-lg font-semibold mb-4">User Email</h3>
            <h3 className="text-lg font-semibold mb-4 text-gray-400">{userEmail}</h3>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Email</label>
              <Input
                className="w-full"
                type='email'
                variant={emailInputState}
                value={newEmail}
                onChange={handleEmailChange}
                placeholder='Enter your new email address'
              ></Input>
              {errorMessage && <div style={{ color: '#f06292' }}>{errorMessage}</div>}
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={handleCloseEditEmail}>
                Cancel
              </button>
              <Button className="px-4 py-2 bg-blue-500 text-white rounded-md"
                variant={buttonVariant}
                onClick={handleEmailSubmit}
                disabled={buttonVariant === 'inactive'}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {PasswordChange && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-md shadow-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Informations</h3>
            {/* Add your form for editing here */}
            <h3  className="text-lg font-semibold mb-4">Change your password</h3>
            <div className="mb-4">
                <label className="block font-semibold mb-1">Old Password</label>
                <Input
                  className="w-full"
                  type='password'
                  value={oldPW}
                  onChange={handleOldPasswordInputChange}
                  placeholder='Enter your old password'
                ></Input>
              <label className="block font-semibold mb-1">New Password</label>
                <Input
                  className="w-full"
                  type='password'
                  value={newPW}
                  onChange={handlePasswordInputChange}
                  placeholder='Enter your new password'
                ></Input>
                {passwordErrorMessage && <div style={{ color: '#f06292' }}>{passwordErrorMessage}</div>}
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 bg-gray-300 rounded-md" 
                onClick={handleClosePassword}>
                Cancel
              </button>
              <Button className="px-4 py-2 bg-blue-500 text-white rounded-md"
                variant={PWVariant}
                onClick={handlePasswordSubmit}
                disabled={PWVariant === 'inactive'}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
