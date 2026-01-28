import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyCertificate } from '../api';

const CertificateVerification = () => {
  const { uuid } = useParams(); // URL param if accessed directly
  const [certId, setCertId] = useState(uuid || '');
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (uuid) {
        handleVerify(uuid);
    }
  }, [uuid]);

  const handleVerify = async (idToVerify) => {
    if (!idToVerify) return;
    setLoading(true);
    setError('');
    setCertificate(null);
    try {
      const data = await verifyCertificate(idToVerify);
      setCertificate(data);
    } catch (err) {
      setError('Invalid Certificate ID or Certificate not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Verify Certificate</h2>
      
      <div className="flex gap-2 mb-6">
        <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter Certificate UUID"
            className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <button 
            onClick={() => handleVerify(certId)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Verify
        </button>
      </div>

      {loading && <p className="text-center text-gray-500">Verifying...</p>}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">
            {error}
        </div>
      )}

      {certificate && (
        <div className="border-t pt-4">
            <div className="text-center mb-4">
                <div className="inline-block p-3 bg-green-100 rounded-full text-green-600 text-2xl mb-2">✓</div>
                <h3 className="text-xl font-bold text-green-800">Valid Certificate</h3>
            </div>
            
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Student ID:</span>
                    <span className="font-medium">{certificate.student_id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Issued By (Mentor ID):</span>
                    <span className="font-medium">{certificate.mentor_id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Opportunity ID:</span>
                    <span className="font-medium">{certificate.opportunity_id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Date Issued:</span>
                    <span className="font-medium">{new Date(certificate.issue_date).toLocaleDateString()}</span>
                </div>
                <div className="mt-4 pt-2 text-center">
                     <a href={certificate.pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Download PDF</a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CertificateVerification;
