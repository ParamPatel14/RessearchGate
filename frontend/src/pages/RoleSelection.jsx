import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateStudentProfile, updateMentorProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaBookOpen } from 'react-icons/fa';

const RoleSelection = () => {
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = async (role) => {
    setLoading(true);
    try {
      if (role === 'student') {
        await updateStudentProfile({});
      } else if (role === 'mentor') {
        await updateMentorProfile({});
      }
      await refreshUser();
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to update role", error);
      // Ideally show an error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome! Choose your path
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select how you want to use the platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Student Card */}
            <div 
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 cursor-pointer transition-all"
              onClick={() => !loading && handleRoleSelect('student')}
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaUser className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <a href="#" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    I am a Student
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Looking for research opportunities
                  </p>
                </a>
              </div>
            </div>

            {/* Mentor Card */}
            <div 
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-green-500 hover:ring-1 hover:ring-green-500 cursor-pointer transition-all"
              onClick={() => !loading && handleRoleSelect('mentor')}
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaBookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <a href="#" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    I am a Mentor
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Offering research projects
                  </p>
                </a>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Updating your profile...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
