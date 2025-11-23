import React, { useState } from 'react';
import { BsFillCalendarFill, BsFillPersonFill, BsClockFill, BsKeyFill } from 'react-icons/bs';

const CustomerHandover = () => {
  const [otp, setOtp] = useState('');

  const handleGenerateOtp = () => {
    // This will generate a 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000);
    setOtp(generatedOtp);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-gray-100 min-h-screen">
      
      {/* Form Section */}
      <main className="container mx-auto mt-8 px-6">
        <section className="bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Customer Handover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side */}
            <div>
              <label htmlFor="flatId" className="block1 text-gray-700 flex items-center mb-4">
                <BsFillPersonFill className="mr-2" /> Flat ID
              </label>
              <input
                type="text"
                id="flatId"
                className="w-full border border-gray-300 p-2 rounded-md"
                placeholder="Enter Flat ID"
              />

              <label htmlFor="appointmentDate" className="block2 text-gray-700 flex items-center mt-4 mb-4">
                <BsFillCalendarFill className="mr-2" /> Appointment Date
              </label>
              <input
                type="date"
                id="appointmentDate"
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            {/* Right Side */}
            <div>
              <label htmlFor="customer" className="block3 text-gray-700 flex items-center mb-4">
                <BsFillPersonFill className="mr-2" /> Customer
              </label>
              <input
                type="text"
                id="customer"
                className="w-full border border-gray-300 p-2 rounded-md"
                placeholder="Enter Customer Name"
              />

              <label htmlFor="appointmentTime" className="block4 text-gray-700 flex items-center mt-4 mb-4">
                <BsClockFill className="mr-2" /> Appointment Time
              </label>
              <input
                type="time"
                id="appointmentTime"
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>
          </div>

          {/* OTP Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <label htmlFor="otp" className="block5 text-gray-700 flex items-center mb-4">
                <BsKeyFill className="mr-2" /> OTP
              </label>
              <input
                type="text"
                id="otp"
                className="w-full border border-gray-300 p-2 rounded-md"
                value={otp}
                readOnly
                placeholder="OTP will be displayed here"
              />
            </div>
            <div>
              <label htmlFor="generateOtp" className="block6 text-gray-700 flex items-center mb-4">
                <BsKeyFill className="mr-2" /> Generate OTP
              </label>
              <button
                id="generateOtp"
                className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-md w-full flex items-center justify-center"
                onClick={handleGenerateOtp}
              >
                <BsKeyFill className="mr-2" /> Generate OTP
              </button>
            </div>
          </div>

          {/* Schedule Handover Button */}
          <div className="flex justify-center mt-8">
            <button className="bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-md">
              Schedule Handover
            </button>
          </div>
        </section>

        {/* Table Section */}
        <section className="mt-8 bg-white shadow p-6 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="py-2 px-4">Flat ID</th>
                <th className="py-2 px-4">Customer</th>
                <th className="py-2 px-4">Appointment</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 px-4">101</td>
                <td className="py-2 px-4">John Doe</td>
                <td className="py-2 px-4">20th Sep, 2024 10:00 AM</td>
                <td className="py-2 px-4 text-green-500">Scheduled</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 px-4">102</td>
                <td className="py-2 px-4">Jane Smith</td>
                <td className="py-2 px-4">20th Sep, 2024 11:00 AM</td>
                <td className="py-2 px-4 text-red-500">Completed</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      
    </div>
  );
};

export default CustomerHandover;
