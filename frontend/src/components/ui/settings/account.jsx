import { useState } from 'react';

const Account = () => {
  const [IoTshowModal, setIoTShowModal] = useState(false);

  const handleEditIoTClick = () => {
    setIoTShowModal(true);
  };

  const handleCloseIoTModal = () => {
    setIoTShowModal(false);
  };

  return (
    <div className="p-6 bg-volt-background-light-mode w-[1000px] h-full rounded-md shadow-md">
      <p className="text-xl font-bold mb-4">Account and Password</p>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Account Settings</h2>
      </div>

      <div className="separator h-0.5 w-full mt-2 mb-5 bg-gray-300 mx-1 self-center"></div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Password</span>
          <button className="text-blue-500" onClick={handleEditIoTClick}>Edit</button>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Bind IoT Device</span>
          <button className="text-blue-500" onClick={handleEditIoTClick}>Edit</button>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Bind Email</span>
          <button className="text-blue-500" onClick={handleEditIoTClick}>Edit</button>
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
    </div>
  );
};

export default Account;
