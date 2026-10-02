import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate} from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import { Copy, Check } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [myAllocations, setMyAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  

  const isEmployee = user?.role === 'employee';

  // ========== CREATE PROJECT STATES (Admin only) ==========
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiredSkills: '',
    startDate: '',
    endDate: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({ totalEmployees: 0, avgUtilization: 0 });
  const [copied, setCopied] = useState(false);

  // ========== FETCH DATA ==========
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEmployee) {
          // ✅ Employee: Only fetch allocations
          const res = await api.get(`/allocations/employee/${user.id}`);

          const allocations = res.data.allocations || [];

          const activeAllocations = allocations.filter(
            (alloc) =>
              alloc.projectId &&
              alloc.projectId.status === 'active'
          );
          
          // ✅ DEDUPLICATE: Remove duplicate projects
          const uniqueAllocations = [];
          const seenProjectIds = new Set();
          
          activeAllocations.forEach((alloc) => {
            const projectId = alloc.projectId._id.toString();
            if (!seenProjectIds.has(projectId)) {
              seenProjectIds.add(projectId);
              uniqueAllocations.push(alloc);
            }
          });
          
          setMyAllocations(uniqueAllocations);
        } else {
          // Admin: Fetch projects, employees, utilization
          const [projectsRes, employeesRes, utilizationRes] = await Promise.all([
            api.get('/projects'),
            api.get('/employees'),
            api.get('/analytics/utilization'),
          ]);

          setProjects(projectsRes.data);

          const avgUtil =
          utilizationRes.data.length > 0
            ? Math.round(
                utilizationRes.data.reduce(
                  (sum, e) => sum + e.utilizationPercent,
                  0
                ) / utilizationRes.data.length
              )
            : 0;

        setStats({
          totalEmployees: employeesRes.data.length,
          avgUtilization: avgUtil,
        });
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (user?.id) {
    fetchData();
  }
}, [user?.id, user?.role]);

  // ========== CREATE PROJECT (Admin only) ==========
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addResourceField = () => {
    setResources([...resources, { label: '', url: '' }]);
  };

  const updateResourceField = (index, field, value) => {
    const updated = [...resources];
    updated[index][field] = value;
    setResources(updated);
  };

  const removeResourceField = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        resources: resources.filter((r) => r.label.trim() && r.url.trim()),
      };

      const res = await api.post('/projects', payload);
      setProjects((prev) => [res.data, ...prev]);
      setShowModal(false);
      setFormData({ name: '', description: '', requiredSkills: '', startDate: '', endDate: '' });
      setResources([]);
      showToast('✅ Project created successfully!', 'success');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  // ========== TOAST ==========
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const statusStyles = {
    active: 'bg-primary/10 text-primary-light border-primary/30',
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    'on-hold': 'bg-accent/10 text-accent border-accent/30',
    archived: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isEmployee={isEmployee} />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isEmployee={isEmployee} />

      {/* TOAST */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-body text-sm border ${
              toast.type === 'success'
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {error && (
          <p className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
            {error}
          </p>
        )}

        {/* ===== ADMIN VIEW ===== */}
        {!isEmployee && (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="font-mono text-xs text-muted uppercase tracking-wide mb-1">Total Projects</p>
                <p className="font-display text-2xl font-bold text-white">{projects.length}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="font-mono text-xs text-muted uppercase tracking-wide mb-1">Active</p>
                <p className="font-display text-2xl font-bold text-primary-light">
                  {projects.filter((p) => p.status === 'active').length}
                </p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="font-mono text-xs text-muted uppercase tracking-wide mb-1">Team Size</p>
                <p className="font-display text-2xl font-bold text-white">{stats.totalEmployees}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="font-mono text-xs text-muted uppercase tracking-wide mb-1">Avg Utilization</p>
                <p className={`font-display text-2xl font-bold ${stats.avgUtilization > 85 ? 'text-accent' : 'text-primary-light'}`}>
                  {stats.avgUtilization}%
                </p>
              </div>
            </motion.div>


            {/* ORGANIZATION INFO */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
  <div className="bg-surface border border-border rounded-xl p-5">
    <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">
      Organization
    </p>

    <p className="font-display text-xl font-semibold text-white">
      {user?.organization?.name || 'Your Organization'}
    </p>

    <p className="text-sm text-muted mt-1">
      Your organization's workspace
    </p>
  </div>

  <div className="bg-surface border border-primary/20 rounded-xl p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">
          Invite Code
        </p>

        <p className="font-mono text-xl font-bold text-primary-light tracking-wider">
          {user?.organization?.code || 'Unavailable'}
        </p>

        <p className="text-sm text-muted mt-1">
          Share this code with employees joining your organization.
        </p>
      </div>

      {user?.organization?.code && (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                user.organization.code
              );
              setCopied(true);

              setTimeout(() => {
                setCopied(false);
              }, 2000);
            } catch (error) {
              console.error(
                'Failed to copy organization code',
                error
              );
            }
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted hover:text-white hover:border-primary/40 transition-colors text-sm"
        >
          {copied ? (
            <>
              <Check size={15} />
              Copied
            </>
          ) : (
            <>
              <Copy size={15} />
              Copy
            </>
          )}
        </button>
      )}
    </div>
  </div>
</div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                to="/projects"
                className="bg-primary hover:bg-primary-light text-white font-body font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                View All Projects
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="border border-border hover:border-primary/50 text-muted hover:text-white font-body font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                + Create New Project
              </button>
            </div>

            {/* Recent Projects */}
            <div className="bg-surface/50 border border-border rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold text-white mb-2">Recent Projects</h3>
              {projects.slice(0, 5).map((p) => (
                <div key={p._id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-white">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[p.status]}`}>
                    {p.status}
                  </span>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-muted">No projects yet.</p>
              )}
            </div>
          </>
        )}

        {/* ===== EMPLOYEE VIEW ===== */}
        {isEmployee && (
          <>
            <h1 className="font-display text-3xl font-bold text-white mb-2">My Work</h1>
            <p className="font-body text-muted mb-6">Projects you're currently allocated to</p>

            {myAllocations.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-body text-muted">You're not allocated to any active project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myAllocations.map((alloc, i) => {
                  return (
                    <motion.div
                      key={alloc.projectId._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/projects/${alloc.projectId._id}`)}
                      className="bg-surface border border-border rounded-2xl p-6 transition-all cursor-pointer hover:border-primary/50 hover:shadow-glow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-white">
                          {alloc.projectId?.name || 'Untitled project'}
                        </h3>
                        <span className={`text-xs font-mono uppercase px-2 py-1 rounded-md border ${statusStyles[alloc.projectId?.status] || statusStyles.active}`}>
                          {alloc.projectId?.status || 'active'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm font-body pt-3 border-t border-border">
                        <span className="text-muted">Your allocation</span>
                        <span className="text-white font-mono">{alloc.allocatedHours}h/week</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-body mt-2">
                        <span className="text-muted">Until</span>
                        <span className="text-white font-mono">{new Date(alloc.endDate).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* ===== CREATE PROJECT MODAL (Admin only) ===== */}
      {!isEmployee && (
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface border border-border rounded-2xl p-8 w-full max-w-lg shadow-glow max-h-[90vh] overflow-y-auto overscroll-contain modal-scroll"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`.modal-scroll::-webkit-scrollbar { display: none; }`}</style>

                <h2 className="font-display text-xl font-bold text-white mb-6">Create new project</h2>

                {formError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                    {formError}
                  </p>
                )}

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-wide">Project name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2.5 text-white font-body focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-wide">Description</label>
                    <textarea
                      name="description"
                      rows="2"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2.5 text-white font-body focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-wide">Required skills (comma separated)</label>
                    <input
                      type="text"
                      name="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={handleChange}
                      placeholder="React, Node.js"
                      className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2.5 text-white font-body focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-mono text-xs text-muted uppercase tracking-wide">Resource links</label>
                      <button
                        type="button"
                        onClick={addResourceField}
                        className="text-xs text-primary-light hover:underline"
                      >
                        + Add link
                      </button>
                    </div>

                    {resources.map((resource, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. GitHub Repo)"
                          value={resource.label}
                          onChange={(e) => updateResourceField(index, 'label', e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-primary"
                        />
                        <input
                          type="url"
                          placeholder="https://..."
                          value={resource.url}
                          onChange={(e) => updateResourceField(index, 'url', e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeResourceField(index)}
                          className="text-muted hover:text-red-400 px-2 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-xs text-muted uppercase tracking-wide">Start date</label>
                      <input
                        type="date"
                        name="startDate"
                        required
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2.5 text-white font-body focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-muted uppercase tracking-wide">End date</label>
                      <input
                        type="date"
                        name="endDate"
                        required
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2.5 text-white font-body focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 sticky bottom-0 bg-surface/90 backdrop-blur-sm py-3 -mb-3 border-t border-border/50 rounded-b-2xl">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 border border-border text-muted hover:text-white font-body py-2.5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-primary hover:bg-primary-light text-white font-body font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Create project'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Dashboard;