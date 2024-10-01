import { useState, useEffect } from 'react';
import api from '../../../libs/api';

const Message = () => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const fetchMailAlertStatus = async () => {
            try {
                const response = await api.get('/api/user/update-active/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.status === 200) {
                    setIsActive(response.data.mail_alert);
                } else {
                    throw new Error('Failed to fetch mail alert status');
                }
            } catch (error) {
                console.error('Error fetching mail alert status:', error);
            }
        };

        fetchMailAlertStatus();
    }, []);

    const handleToggleChange = async () => {
        const newIsActive = !isActive;
        setIsActive(newIsActive);
        try {
            const response = await api.put('/api/user/update-active/', 
                {
                    mail_alert: newIsActive,
                },
                {
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            if (response.status !== 200) {
                throw new Error('Failed to update alert status');
            }
            alert('Alert status updated successfully');
        } catch (error) {
            console.error('Error updating alert status:', error);
        }
    };

    return (
        <div className="p-6 bg-volt-background-light-mode w-[1000px] h-full rounded-md shadow-md">
            <p className="text-xl font-bold mb-4">Message and Mail</p>
            <div className="mb-6">
                <h2 className="text-lg font-semibold">Set the email alert</h2>
            </div>

            <div className="separator h-0.5 w-full mt-2 mb-5 bg-gray-300 mx-1 self-center"></div>

            <div className="space-y-10">
                <div className="flex justify-between items-center">
                    <span className="font-semibold">Change Email Alert</span>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={isActive}
                            onChange={handleToggleChange}
                        />
                        <div className={`w-11 h-6 rounded-full ${isActive ? 'bg-blue-400' : 'bg-gray-200'} relative`}>
                            <div className={`w-5 h-6 bg-white rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Message;
