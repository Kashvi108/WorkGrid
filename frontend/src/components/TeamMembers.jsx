import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const TeamMembers = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/team`);
        setTeamMembers(res.data.teamMembers);
        setLoading(false);
      } catch (err) {
        setError('Failed to load team members');
        setLoading(false);
      }
    };

    if (projectId) {
      fetchTeam();
    }
  }, [projectId]);

  const displayedMembers = showAll ? teamMembers : teamMembers.slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm py-4">{error}</div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-muted text-sm py-4">
        No employees allocated to this project yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            Team Members
            <span className="text-sm font-normal text-muted ml-2">
              ({teamMembers.length})
            </span>
          </h3>
        </div>
        {teamMembers.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary-light hover:underline"
          >
            {showAll ? 'Show less' : `View all (${teamMembers.length})`}
          </button>
        )}
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedMembers.map((member, index) => (
          <motion.div
            key={member.employeeId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-surface/50 border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-primary-light">
                      {member.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-white truncate">
                      {member.name}
                    </p>
                    <p className="font-body text-xs text-muted truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted">Department</p>
                    <p className="text-white font-medium truncate">
                      {member.department || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Role</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono capitalize
                      ${member.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                        member.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'}`}
                    >
                      {member.role || 'employee'}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted">Allocated</p>
                    <p className="text-white font-medium">
                      {member.allocatedHours}h/week
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Until</p>
                    <p className="text-white font-medium">
                      {new Date(member.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {member.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="font-mono text-[10px] text-primary-light bg-primary/10 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="font-mono text-[10px] text-muted">
                        +{member.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;