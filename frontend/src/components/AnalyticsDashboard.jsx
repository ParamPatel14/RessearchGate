import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../api';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getAnalytics();
        setData(result);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading Analytics...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Platform Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Stats */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800">Users</h3>
          <div className="mt-2">
            <p className="text-3xl font-bold text-blue-600">{data.users.students}</p>
            <p className="text-sm text-blue-500">Students</p>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-blue-600">{data.users.mentors}</p>
            <p className="text-sm text-blue-500">Mentors</p>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-lg font-semibold text-green-800">Engagement</h3>
          <div className="flex justify-between mt-2">
            <div>
              <p className="text-2xl font-bold text-green-600">{data.engagement.opportunities}</p>
              <p className="text-xs text-green-500">Opportunities</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{data.engagement.applications}</p>
              <p className="text-xs text-green-500">Applications</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-green-200">
             <p className="text-xl font-bold text-green-700">{data.engagement.certificates}</p>
             <p className="text-xs text-green-600">Certificates Issued</p>
          </div>
        </div>

        {/* Research Stats */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-800">Research Output</h3>
          <div className="mt-2">
            <p className="text-3xl font-bold text-purple-600">{data.research.published}</p>
            <p className="text-sm text-purple-500">Published Projects</p>
          </div>
          <div className="mt-1">
             <span className="text-sm font-medium text-purple-400">{data.research.active} Active</span>
          </div>
        </div>

        {/* Funding Stats */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-lg font-semibold text-yellow-800">Total Funding</h3>
          <div className="mt-2">
            <p className="text-3xl font-bold text-yellow-600">
              ${data.funding.total_committed.toLocaleString()}
            </p>
            <p className="text-sm text-yellow-500">Committed Grants</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
