import React, { useState, useEffect } from 'react';
import { getMyImprovementPlans, updatePlanItem } from '../api';
import { FiClock, FiCalendar, FiCheckCircle, FiTarget, FiArrowRight, FiBook, FiCode, FiFileText, FiAward } from 'react-icons/fi';

const ImprovementPlanBoard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getMyImprovementPlans();
      setPlans(data);
      if (data.length > 0 && !activePlanId) {
        setActivePlanId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      // Optimistic update
      setPlans(prevPlans => prevPlans.map(plan => {
        if (plan.id === activePlanId) {
          return {
            ...plan,
            items: plan.items.map(item => 
              item.id === itemId ? { ...item, status: newStatus } : item
            )
          };
        }
        return plan;
      }));

      await updatePlanItem(itemId, { status: newStatus });
      fetchPlans(); // Refresh to ensure sync
    } catch (err) {
      console.error("Failed to update item", err);
      fetchPlans(); // Revert on error
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-indigo-50 p-6 rounded-full mb-6">
          <FiTarget className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
        <p className="text-gray-600 max-w-md mb-8">
          You haven't generated any improvement plans yet. Visit the Opportunities page and click "Improve My Chances" to get a personalized AI-powered roadmap.
        </p>
        <a href="/opportunities" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl">
          Browse Opportunities
        </a>
      </div>
    );
  }

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0];
  const completedCount = activePlan.items.filter(i => i.status === 'completed').length;
  const totalCount = activePlan.items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate overall deadline (max deadline of items)
  const deadlines = activePlan.items
    .map(i => i.deadline ? new Date(i.deadline) : null)
    .filter(Boolean);
  const finalDeadline = deadlines.length > 0 
    ? new Date(Math.max(...deadlines)) 
    : new Date(new Date().setDate(new Date().getDate() + 30));
  
  const daysRemaining = Math.ceil((finalDeadline - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Header */}
      <div className="bg-indigo-900 text-white pt-12 pb-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Learning Roadmap</h1>
              <p className="text-indigo-200 text-lg">Master the skills for: <span className="text-white font-semibold">{activePlan.opportunity_title}</span></p>
            </div>
            
            {/* Plan Selector (if multiple) */}
            {plans.length > 1 && (
              <select 
                value={activePlanId}
                onChange={(e) => setActivePlanId(Number(e.target.value))}
                className="bg-indigo-800 text-white border border-indigo-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.opportunity_title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-indigo-800/50 backdrop-blur rounded-xl p-6 border border-indigo-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{progress}%</div>
                  <div className="text-indigo-200 text-sm">Completed</div>
                </div>
              </div>
              <div className="w-full bg-indigo-900/50 rounded-full h-2 mt-4">
                <div className="bg-green-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="bg-indigo-800/50 backdrop-blur rounded-xl p-6 border border-indigo-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{daysRemaining} Days</div>
                  <div className="text-indigo-200 text-sm">Remaining</div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-800/50 backdrop-blur rounded-xl p-6 border border-indigo-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <FiTarget className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalCount - completedCount}</div>
                  <div className="text-indigo-200 text-sm">Tasks Left</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-12">
        <div className="space-y-8">
          {activePlan.items.map((item, index) => (
            <RoadmapItem 
              key={item.id} 
              item={item} 
              index={index} 
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const RoadmapItem = ({ item, index, onStatusUpdate }) => {
  const isCompleted = item.status === 'completed';
  const isInProgress = item.status === 'in_progress';
  
  const getIcon = () => {
    switch(item.type) {
      case 'skill_gap': return <FiCode className="w-6 h-6" />;
      case 'mini_project': return <FiTarget className="w-6 h-6" />;
      case 'reading_list': return <FiBook className="w-6 h-6" />;
      case 'sop': return <FiFileText className="w-6 h-6" />;
      default: return <FiAward className="w-6 h-6" />;
    }
  };

  const getTypeLabel = () => {
    switch(item.type) {
      case 'skill_gap': return 'Skill Builder';
      case 'mini_project': return 'Real World Project';
      case 'reading_list': return 'Research & Reading';
      case 'sop': return 'Application Prep';
      default: return 'Task';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`relative flex gap-6 ${isCompleted ? 'opacity-75' : ''}`}>
      {/* Timeline Line */}
      <div className="hidden md:flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 
          ${isCompleted ? 'bg-green-500 border-green-100 text-white' : 
            isInProgress ? 'bg-indigo-600 border-indigo-100 text-white' : 
            'bg-white border-gray-200 text-gray-400'}`}>
          {isCompleted ? <FiCheckCircle /> : <span>{index + 1}</span>}
        </div>
        <div className="h-full w-0.5 bg-gray-200 -my-2"></div>
      </div>

      {/* Card */}
      <div className={`flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300
        ${isInProgress ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
        
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getPriorityColor(item.priority)}`}>
                {item.priority || 'Medium'} Priority
              </span>
              <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                <FiClock className="w-4 h-4" /> {item.estimated_hours || '2-4 hours'}
              </span>
              {item.deadline && (
                <span className="text-orange-600 text-sm font-medium flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded">
                  <FiCalendar className="w-4 h-4" /> Due {new Date(item.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 rounded text-indigo-600">
                {getIcon()}
              </span>
              {item.title}
            </h3>
            
            <p className="text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="flex md:flex-col gap-2 shrink-0">
            {item.status === 'pending' && (
              <button 
                onClick={() => onStatusUpdate(item.id, 'in_progress')}
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
              >
                Start Task <FiArrowRight />
              </button>
            )}
            
            {item.status === 'in_progress' && (
              <button 
                onClick={() => onStatusUpdate(item.id, 'completed')}
                className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-sm flex items-center gap-2"
              >
                Complete <FiCheckCircle />
              </button>
            )}

            {isCompleted && (
              <span className="px-6 py-2.5 bg-gray-100 text-gray-500 font-semibold rounded-lg flex items-center gap-2 cursor-default">
                Completed <FiCheckCircle />
              </span>
            )}
          </div>
        </div>

        {/* Real World Context Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-3">
          <div className="mt-1">
            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
          </div>
          <p className="text-sm text-gray-500 italic">
            <span className="font-semibold text-gray-700 not-italic">Why this matters: </span>
            This task directly builds the {getTypeLabel()} skills required for the role. Completing this will demonstrate your ability to handle real-world challenges.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImprovementPlanBoard;
