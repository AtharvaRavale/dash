import React, { useState } from 'react'; 
import { ClockIcon, CalendarIcon, XCircleIcon,CheckCircleIcon, PauseIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';

const SlotConfiguration = () => {
  const [slots, setSlots] = useState([]);
  const [slotData, setSlotData] = useState({
    startTime: '',
    breakStartTime: '',
    breakEndTime: '',
    endTime: '',
    slotBy: '45 Minutes',
    wrapTime: '',
    bookingBeforeDay: '',
    advanceBookingDay: '',
    cancelBeforeDay: '',
    rmUser: '',
    startDate: '',
    endDate: '',
    blockDates: '',
    days: {
      MON: 0,
      TUE: 0,
      WED: 0,
      THU: 0,
      FRI: 0,
      SAT: 0,
      SUN: 0,
    }
  });

  const handleChange = (e) => {
    setSlotData({
      ...slotData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDayChange = (day) => {
    setSlotData({
      ...slotData,
      days: {
        ...slotData.days,
        [day]: slotData.days[day] === 1 ? 0 : 1,
      },
    });
  };

  const addSlot = () => {
    setSlots([...slots, slotData]);
    setSlotData({
      startTime: '',
      breakStartTime: '',
      breakEndTime: '',
      endTime: '',
      slotBy: '45 Minutes',
      wrapTime: '',
      bookingBeforeDay: '',
      advanceBookingDay: '',
      cancelBeforeDay: '',
      rmUser: '',
      startDate: '',
      endDate: '',
      blockDates: '',
      days: {
        MON: 0,
        TUE: 0,
        WED: 0,
        THU: 0,
        FRI: 0,
        SAT: 0,
        SUN: 0,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          Slot Configuration
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Start Time */}
          <div className="flex flex-col w-full">
            <label className="flex items-center mb-2 text-gray-700 font-semibold">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={slotData.startTime}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            />
          </div>

          {/* Break Time Start */}
          <div className="flex flex-col w-full">
            <label className="flex items-center mb-2 text-gray-700 font-semibold">
              <PauseIcon className="h-5 w-5 mr-2 text-blue-500" />
              Break Time Start
            </label>
            <input
              type="time"
              name="breakStartTime"
              value={slotData.breakStartTime}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            />
          </div>

          {/* Break Time End */}
          <div className="flex flex-col w-full">
            <label className="flex items-center mb-2 text-gray-700 font-semibold">
              <PlayIcon className="h-5 w-5 mr-2 text-blue-500" />
              Break Time End
            </label>
            <input
              type="time"
              name="breakEndTime"
              value={slotData.breakEndTime}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            />
          </div>

          {/* End Time */}
          <div className="flex flex-col w-full">
            <label className="flex items-center mb-2 text-gray-700 font-semibold">
              <StopIcon className="h-5 w-5 mr-2 text-blue-500" />
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={slotData.endTime}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            />
          </div>

          {/* Slot By */}
          <div className="flex flex-col w-full">
            <label className="flex items-center mb-2 text-gray-700 font-semibold">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
              Slot By
            </label>
            <select
              name="slotBy"
              value={slotData.slotBy}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            >
              <option>45 Minutes</option>
              <option>1 Hour</option>
              <option>1 Hour 30 min</option>
              <option>2 Hours</option>
            </select>
          </div>

          {/* Wrap Time */}
          <div className="flex flex-col w-full">
            <label className="flex items-center mb-2 text-gray-700 font-semibold">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
              Wrap Time
            </label>
            <input
              type="text"
              name="wrapTime"
              value={slotData.wrapTime}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              placeholder="Wrap Time in Mins"
            />
          </div>

          {/* Booking Allowed Before */}
<div className="flex flex-col">
  <label className="flex items-center mb-1">
    <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
    Booking Allowed 7 Days Ahed
  </label>
  <div className="flex space-x-2">
    <input
      type="text"
      name="bookingBeforeDays"
      value={slotData.bookingBeforeDays}
      onChange={handleChange}
      onInput={(e) => e.target.value = e.target.value.replace(/\D/, '')}
      placeholder="Days"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
    <input
      type="text"
      name="bookingBeforeHours"
      value={slotData.bookingBeforeHours}
      onChange={handleChange}
      onInput={(e) => {
        let value = e.target.value.replace(/\D/, '');
        if (value > 24) value = 24; // Limit to 24 hours
        e.target.value = value;
      }}
      placeholder="0 to 24 Hours"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
    <input
      type="text"
      name="bookingBeforeMinutes"
      value={slotData.bookingBeforeMinutes}
      onChange={handleChange}
      onInput={(e) => {
        let value = e.target.value.replace(/\D/, '');
        if (value > 60) value = 60; // Limit to 60 minutes
        e.target.value = value;
      }}
      placeholder="0 to 60 Minutes"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
  </div>
</div>

{/* Advance Booking */}
<div className="flex flex-col mt-1">
  <label className="flex items-center mb-1">
    <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
    Advance Booking Upto 30 Days
  </label>
  <div className="flex space-x-2">
    <input
      type="text"
      name="advanceBookingDays"
      value={slotData.advanceBookingDays}
      onChange={handleChange}
      onInput={(e) => e.target.value = e.target.value.replace(/\D/, '')}
      placeholder="Days"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
    <input
      type="text"
      name="advanceBookingHours"
      value={slotData.advanceBookingHours}
      onChange={handleChange}
      onInput={(e) => {
        let value = e.target.value.replace(/\D/, '');
        if (value > 24) value = 24; // Limit to 24 hours
        e.target.value = value;
      }}
      placeholder="0 to 24 Hours"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
    <input
      type="text"
      name="advanceBookingMinutes"
      value={slotData.advanceBookingMinutes}
      onChange={handleChange}
      onInput={(e) => {
        let value = e.target.value.replace(/\D/, '');
        if (value > 60) value = 60; // Limit to 60 minutes
        e.target.value = value;
      }}
      placeholder="0 to 60 Minutes"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
  </div>
</div>

{/* Can Cancel Before Schedule */}
<div className="flex flex-col mt-1">
  <label className="flex items-center mb-1">
    <XCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
    Can Cancel 1 Day Before Schedule
  </label>
  <div className="flex space-x-2">
    <input
      type="text"
      name="cancelBeforeDays"
      value={slotData.cancelBeforeDays}
      onChange={handleChange}
      onInput={(e) => e.target.value = e.target.value.replace(/\D/, '')}
      placeholder="Days"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
    <input
      type="text"
      name="cancelBeforeHours"
      value={slotData.cancelBeforeHours}
      onChange={handleChange}
      onInput={(e) => {
        let value = e.target.value.replace(/\D/, '');
        if (value > 24) value = 24; // Limit to 24 hours
        e.target.value = value;
      }}
      placeholder="0 to 24 Hours"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
    <input
      type="text"
      name="cancelBeforeMinutes"
      value={slotData.cancelBeforeMinutes}
      onChange={handleChange}
      onInput={(e) => {
        let value = e.target.value.replace(/\D/, '');
        if (value > 60) value = 60; // Limit to 60 minutes
        e.target.value = value;
      }}
      placeholder="0 to 60 Minutes"
      className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out w-1/3"
    />
  </div>
</div>



          
      {/* RM User */}
<div className="flex flex-col w-full">
  <label className="flex items-center mb-1">
    <CheckCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
    Select RM User
  </label>
  <select
    name="rmUser"
    value={slotData.rmUser}
    onChange={handleChange}
    className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-outw-full"
  >
    <option value="">Select RM User</option>
    <option value="RM1">RM User 1</option>
    <option value="RM2">RM User 2</option>
    <option value="RM3">RM User 3</option>
  </select>
</div>

          {/* Start Date */}
          <div className="flex flex-col">
            <label className="flex items-center mb-1">
              <CalendarIcon className="h-5 w-4 mr-2 text-gray-600" />
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={slotData.startDate}
              onChange={handleChange}
              className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="flex items-center mb-1">
              <CalendarIcon className="h-5 w-4 mr-2 text-gray-600" />
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={slotData.endDate}
              onChange={handleChange}
              className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            />
          </div>

          {/* Block Dates */}
          <div className="flex flex-col">
            <label className="flex items-center mb-1">
              <CalendarIcon className="h-5 w-4 mr-2 text-gray-600" />
              Block Dates
            </label>
            <input
              type="date"
              name="blockDates"
              value={slotData.blockDates}
              onChange={handleChange}
              className="border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            />
          </div>

{/* Weekday Selection */}
<div className="flex flex-wrap xl:flex-nowrap gap-8 items-end">
  {Object.keys(slotData.days).map((day) => (
    <label key={day} className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={slotData.days[day] === 1}
        onChange={() => handleDayChange(day)}
        className="mr-1"
      />
      <span>{day}</span>
    </label>
  ))}
</div>

        </form>

        <button
          onClick={addSlot}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded flex items-center"
        >
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Add Slot
        </button>

        

        {/* Display Added Slots */}
        <table className="mt-8 w-full border border-gray-300 text-center">
          <thead>
            <tr>
              <th>RM User</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>MON</th>
              <th>TUE</th>
              <th>WED</th>
              <th>THU</th>
              <th>FRI</th>
              <th>SAT</th>
              <th>SUN</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, index) => (
              <tr key={index}>
                <td>{slot.rmUser}</td>
                <td>{slot.startDate}</td>
                <td>{slot.endDate}</td>
                <td>{slot.startTime}</td>
                <td>{slot.endTime}</td>
                <td>{slot.days.MON}</td>
                <td>{slot.days.TUE}</td>
                <td>{slot.days.WED}</td>
                <td>{slot.days.THU}</td>
                <td>{slot.days.FRI}</td>
                <td>{slot.days.SAT}</td>
                <td>{slot.days.SUN}</td>
              </tr>
            ))}
          </tbody>
        </table> 
      </div>
    </div>
  );
};


export default SlotConfiguration;
