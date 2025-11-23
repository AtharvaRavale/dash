// import React, { useState } from "react";
// import {
//   FaCogs,
//   FaUsers,
//   FaCalendarAlt,
//   FaTasks,
//   FaHandshake,
//   FaFileSignature,
// } from "react-icons/fa";
// import SiteConfig from "./SiteConfig";
// import UserHome from "./UserHome";
// import SlotConfig from "./SlotConfig";
// import RequestManagement from "./RequestManagement";
// import CoustemerHandover from "./CoustemerHandover";
// import Chif from "./Chif";
// import Checklist from "./Checklist";
// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

// const SiteConfiguration = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("SiteConfig");
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const goToChifSetup = () => {
//     navigate("/ChifSetup");
//   };

//   const navItems = [
//     {
//       id: "SiteConfig",
//       name: "Site Config",
//       icon: <FaCogs className="text-sm" />,
//       fullName: "Site Configuration",
//     },
//     {
//       id: "UserHome",
//       name: "Users",
//       icon: <FaUsers className="text-sm" />,
//       fullName: "User Management",
//     },
//     {
//       id: "SlotConfig",
//       name: "Slots",
//       icon: <FaCalendarAlt className="text-sm" />,
//       fullName: "Slot Configuration",
//     },
//     {
//       id: "RequestManagement",
//       name: "Requests",
//       icon: <FaTasks className="text-sm" />,
//       fullName: "Request Management",
//     },
//     {
//       id: "CustomerHandover",
//       name: "Handover",
//       icon: <FaHandshake className="text-sm" />,
//       fullName: "Customer Handover",
//     },
//     {
//       id: "Chif",
//       name: "CHIF",
//       icon: <FaFileSignature className="text-sm" />,
//       fullName: "CHIF Form",
//     },
//     {
//       id: "Checklist",
//       name: "Checklist",
//       icon: <FaTasks className="text-sm" />,
//       fullName: "Checklist",
//     },
//   ];

//   const handleTabClick = (tabId) => {
//     setActiveTab(tabId);
//     setMobileMenuOpen(false);
//   };

//   const renderContent = () => {
//     switch (activeTab) {
//       case "SiteConfig":
//         return <SiteConfig />;
//       case "UserHome":
//         return <UserHome />;
//       case "SlotConfig":
//         return <SlotConfig />;
//       case "RequestManagement":
//         return <RequestManagement />;
//       case "CustomerHandover":
//         return <CoustemerHandover />;
//       case "Chif":
//         return <Chif />;
//       case "Checklist":
//         return <Checklist />;
//       default:
//         return <SiteConfig />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       {/* Header Navigation */}
//       <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
//         <div className="w-full px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-20">
//             {/* Logo/Brand */}
//             <div className="flex items-center space-x-3 flex-shrink-0 min-w-0">
//               <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">P</span>
//               </div>
//               <div>
//                 <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   Property Management
//                 </h1>
//                 <p className="text-xs text-gray-500">System Dashboard</p>
//               </div>
//             </div>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center overflow-x-auto">
//               <div className="flex items-center space-x-1 min-w-max">
//                 {navItems.map((item) => (
//                   <button
//                     key={item.id}
//                     onClick={() => handleTabClick(item.id)}
//                     className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
//                       activeTab === item.id
//                         ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
//                         : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//                     }`}
//                   >
//                     {item.icon}
//                     <span className="text-xs">{item.name}</span>
//                     {activeTab === item.id && (
//                       <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </nav>

//             {/* Action Button & Mobile Menu */}
//             <div className="flex items-center space-x-3">
//               {/* Project Configuration Button */}
//               <button
//                 onClick={goToChifSetup}
//                 className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
//               >
//                 <FaCogs className="text-sm" />
//                 <span className="whitespace-nowrap">Project Config</span>
//               </button>

//               {/* Mobile menu button */}
//               <div className="lg:hidden">
//                 <button
//                   type="button"
//                   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                   className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
//                 >
//                   <svg
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d={
//                         mobileMenuOpen
//                           ? "M6 18L18 6M6 6l12 12"
//                           : "M4 6h16M4 12h16M4 18h16"
//                       }
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {mobileMenuOpen && (
//           <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md animate-in slide-in-from-top-5 duration-200">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               {navItems.map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => handleTabClick(item.id)}
//                   className={`block w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
//                     activeTab === item.id
//                       ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
//                       : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//                   }`}
//                 >
//                   <span className="text-lg">{item.icon}</span>
//                   <span>{item.fullName}</span>
//                 </button>
//               ))}
//               <div className="pt-2 border-t border-gray-200">
//                 <button
//                   onClick={goToChifSetup}
//                   className="w-full flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:shadow-lg transition-all duration-200"
//                 >
//                   <FaCogs className="text-lg" />
//                   <span>Project Configuration</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Content Area */}
//       <div className="pt-24 px-4 sm:px-6 lg:px-8">
//         <div className="w-full">
//           <div className="bg-white rounded-2xl shadow-sm min-h-96">
//             {renderContent()}
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 mt-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="flex items-center space-x-3 mb-4 md:mb-0">
//               <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold">P</span>
//               </div>
//               <div>
//                 <h3 className="font-bold text-lg">
//                   Property Management System
//                 </h3>
//                 <p className="text-gray-400 text-sm">
//                   Professional Property Solutions
//                 </p>
//               </div>
//             </div>
//             <nav className="flex space-x-6">
//               <a
//                 href="#"
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 Home
//               </a>
//               <a
//                 href="#"
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 Contact Us
//               </a>
//               <Link
//                 to="/login"
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 Login
//               </Link>
//             </nav>
//           </div>
//           <div className="border-t border-gray-700 mt-6 pt-6 text-center">
//             <p className="text-gray-400">
//               &copy; 2024 Property Management System. All rights reserved.
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default SiteConfiguration;

import React, { useState } from 'react';
import { FaCogs, FaUsers, FaCalendarAlt, FaTasks, FaHandshake, FaFileSignature } from 'react-icons/fa';
import SiteConfig from './SiteConfig';
import UserHome from './UserHome';
import SlotConfig from './SlotConfig';
import RequestManagement from './RequestManagement';
import CoustemerHandover from './CoustemerHandover';
import Chif from './Chif';
import Checklist from './Checklist';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const SiteConfiguration = () => {
  const navigate = useNavigate();
  const goToChifSetup = () => {
    navigate("/ChifSetup"); // Navigate to the ChifSetup page
  };

  const [activeTab, setActiveTab] = useState('SiteConfig');

  const renderContent = () => {
    switch (activeTab) {
      case 'SiteConfig':
        return <SiteConfig />;
      case 'UserHome':
        return <UserHome />;
      case 'SlotConfig':
        return <SlotConfig />;
      case 'RequestManagement':
        return <RequestManagement />;
      case 'CustomerHandover':
        return <CoustemerHandover />;
      case 'Chif':
        return <Chif />;
        case 'Checklist':
        return <Checklist />;
      default:
        return <SiteConfig />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-gray-800 text-white py-8">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="flex items-center space-x-2">
            <img src="/path/to/your/logo.png" alt="Logo" className="w-12 h-12" />
            <h1 className="text-2xl font-bold">Property Management System</h1>
          </div>

          <nav className="space-x-4">
            <a href="#" className="hover:text-gray-400 text-lg">Home</a>
            <a href="#" className="hover:text-gray-400 text-lg">Contact Us</a>

<Link to="/login" className="hover:text-gray-400 text-lg">Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center bg-white px-0 rounded-lg">
          <ul className="flex w-full">
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('SiteConfig')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'SiteConfig' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaCogs className="text-xl mr-2" />
                <span>Site Configuration</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('UserHome')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'UserHome' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaUsers className="text-xl mr-2" />
                <span>User Management</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('SlotConfig')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'SlotConfig' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaCalendarAlt className="text-xl mr-2" />
                <span>Slot Configuration</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('RequestManagement')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'RequestManagement' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaTasks className="text-xl mr-2" />
                <span>Request Management</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('CustomerHandover')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'CustomerHandover' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaHandshake className="text-xl mr-2" />
                <span>Customer Handover</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('Chif')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'Chif' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaFileSignature className="text-xl mr-2" />
                <span>CHIF Form</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('Checklist')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'Checklist' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaTasks className="text-xl mr-2" />
                <span>Checklist</span>
              </button>
            </li>
             <li className="flex-1">

              <button
              onClick={goToChifSetup}
              className="bg-green-500 hover:bg-green-700 mt-2 ml-5 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >

                <span>Project Configuration</span>

            </button>

            </li>
          </ul>
        </div>

        {/* Content Section */}
        <div className="bg-gray-100 rounded-lg">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Property Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SiteConfiguration;
