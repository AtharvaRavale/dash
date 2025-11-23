import React, { useState } from 'react';
import { FaCheck, FaTimes, FaKey, FaArrowRight, FaHome, FaFileDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // For navigation
import Modal from 'react-modal'; // For modal popup


const CustomerHandover = ({ savedForm }) => {
  
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [details] = useState({
    project: 'Project A',
    floor: '16th floor',
    unit: '1603',
  });
  const [feedback, setFeedback] = useState({
    questions: [
      { question: "Is the flat construction up to the expected standard?", yes: false, no: false, remarks: '', picture: null },
      { question: "Is the plumbing system functioning properly?", yes: false, no: false, remarks: '', picture: null },
      { question: "Is the electrical wiring and outlets functioning as expected?", yes: false, no: false, remarks: '', picture: null },
      { question: "Are all windows and doors properly installed and operable?", yes: false, no: false, remarks: '', picture: null },
      { question: "Are the walls painted and free from damage?", yes: false, no: false, remarks: '', picture: null },
      { question: "Is the flooring properly installed and free from damage?", yes: false, no: false, remarks: '', picture: null },
      { question: "Are all bathroom fixtures working properly?", yes: false, no: false, remarks: '', picture: null },
      { question: "Is the kitchen cabinetry and appliances in good condition?", yes: false, no: false, remarks: '', picture: null },
      { question: "Are the balconies and outdoor spaces in good condition?", yes: false, no: false, remarks: '', picture: null },
      { question: "Is the overall cleanliness and finishing satisfactory?", yes: false, no: false, remarks: '', picture: null }
    ]
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleTokenChange = (e) => setToken(e.target.value);

  const handleTokenSubmit = () => {
    if (token === '123') {
      setStep(2);
    } else {
      alert('Enter a correct token number.');
    }
  };


    const [formData, setFormData] = useState({});
  
    const handleInputChange = (index, type, value) => {
      setFormData({ ...formData, [index]: value });
    };

  const handleFeedbackChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    if (dataset.index !== undefined) {
      const index = parseInt(dataset.index);
      setFeedback(prev => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [name]: type === 'checkbox' ? checked : value,
        };
        return { ...prev, questions: updatedQuestions };
      });
    }
  };

  const handlePictureUpload = (e, index) => {
    const files = Array.from(e.target.files);
    const pictureUrls = files.map(file => URL.createObjectURL(file));
    setFeedback(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index].picture = pictureUrls[0];
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSubmit = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg">
      {step === 1 && (
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-8 mt-8 p-8">
            <FaKey className="inline-block mb-1 mr-2" /> Welcome to the Customer Handover Form
          </h1>
          <p className="mb-6">Please enter your allotted token number to proceed.</p>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={token}
              onChange={handleTokenChange}
              placeholder="Token Number"
              className="border border-gray-300 p-3 rounded-lg w-full mr-3"
            />
            <button
              onClick={handleTokenSubmit}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors duration-300 flex items-center"
            >
              Submit <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Confirm the Handover Details</h1>
          <p className="mb-2"><strong>Project:</strong> {details.project}</p>
          <p className="mb-2"><strong>Floor:</strong> {details.floor}</p>
          <p className="mb-4"><strong>Unit:</strong> {details.unit}</p>
          <button
            onClick={() => setStep(3)}
            className="bg-blue-600 text-white px-6 py-2 mb-2 rounded-lg hover:bg-blue-500 transition-colors duration-300 flex items-center"
          >
            Proceed to CHIF Form <FaArrowRight className="ml-2" />
          </button>
          <button
            onClick={() => setStep(1)}
            className="bg-gray-500 text-white px-6 py-2 mt-1 rounded-lg hover:bg-gray-400 transition-colors duration-300 ml-4 flex items-center"
          >
            <FaTimes className="mr-2" /> Back
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Kindly Share Your Feedback to Confirm Possession</h1>
          <div className="space-y-6">
            {feedback.questions.map((q, index) => (
              <div key={index} className="p-4 border border-gray-300 rounded-lg mb-4 bg-white shadow-md">
                <h2 className="text-xl font-semibold mb-2 text-blue-600">{q.question}</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="yes"
                      checked={q.yes}
                      onChange={handleFeedbackChange}
                      data-index={index}
                      className="mr-2"
                    />
                    <FaCheck className="text-green-500" /> <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="no"
                      checked={q.no}
                      onChange={handleFeedbackChange}
                      data-index={index}
                      className="mr-2"
                    />
                    <FaTimes className="text-red-500" /> <span>No</span>
                  </label>
                </div>
                <textarea
                  name="remarks"
                  value={q.remarks}
                  onChange={handleFeedbackChange}
                  data-index={index}
                  placeholder="Remarks"
                  className="border border-gray-300 p-3 rounded-lg w-full mb-4"
                />
                <div className="mb-4">
                  <label className="block mb-2">Upload Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePictureUpload(e, index)}
                    className="mb-2"
                  />
                  {q.picture && (
                    <img src={q.picture} alt={`Uploaded ${index}`} className="w-32 h-32 object-cover rounded-lg" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors duration-300 flex items-center"
            >
              Submit <FaCheck className="ml-2" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors duration-300 flex items-center"
            >
              <FaHome className="mr-2" /> Home
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Submission Confirmation"
        className="w-full max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Submission Confirmation</h2>
        <p className="mb-4">Thanks for your response. Our team will guide you further.</p>
        <div className="flex space-x-4">
          <a
            href="/path/to/form"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors duration-300 flex items-center"
          >
            <FaFileDownload className="mr-2" /> Download Form
          </a>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 text-white px-10 py-3 rounded-lg hover:bg-gray-400 transition-colors duration-300 flex items-center"
          >
            <FaHome className="mr-2" /> Home
          </button>
          <button
            onClick={closeModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors duration-300 flex items-center"
          >
            Close <FaTimes className="ml-2" />
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerHandover;
