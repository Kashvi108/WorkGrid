import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import TeamMembers from '../components/TeamMembers';
import Navbar from '../components/Navbar';

const formatDateInput = (date) => {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().split('T')[0];
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isEmployee = user?.role === 'employee';
  const canManageProject =
    user?.role === 'admin' || user?.role === 'manager';

  const [project, setProject] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Allocation modal
  const [allocationModal, setAllocationModal] = useState({
    open: false,
    employee: null
  });

  const [allocationForm, setAllocationForm] = useState({
    allocatedHours: 8,
    startDate: '',
    endDate: ''
  });

  const [allocationError, setAllocationError] = useState('');
  const [allocating, setAllocating] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: '',
        type: 'success'
      });
    }, 3500);
  };

  // ========== FETCH PROJECT ==========
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // ========== FETCH SUGGESTIONS ==========
  const fetchSuggestions = async () => {
    try {
      setSuggestionsLoading(true);

      const res = await api.get(
        `/projects/${id}/suggested-employees`
      );

      setSuggestions(res.data);
    } catch (err) {
      console.error(
        'Failed to fetch suggestions:',
        err
      );

      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    if (canManageProject && activeTab === 'suggestions') {
      fetchSuggestions();
    }
  }, [id, canManageProject, activeTab]);

  // ========== OPEN ALLOCATION MODAL ==========
  const openAllocationModal = (employee) => {
    if (!employee) return;

    setAllocationError('');

    setAllocationForm({
      allocatedHours: Math.min(
        8,
        Math.max(employee.availableHours || 1, 1)
      ),
      startDate: formatDateInput(project?.startDate),
      endDate: formatDateInput(project?.endDate)
    });

    setAllocationModal({
      open: true,
      employee
    });
  };

  const closeAllocationModal = () => {
    if (allocating) return;

    setAllocationModal({
      open: false,
      employee: null
    });

    setAllocationError('');
  };

  // ========== HANDLE ALLOCATION ==========
  const handleAllocate = async (e) => {
    e.preventDefault();

    const employee = allocationModal.employee;

    if (!employee) return;

    setAllocationError('');
    setAllocating(true);

    try {
      const allocatedHours = Number(
        allocationForm.allocatedHours
      );

      if (!Number.isFinite(allocatedHours) || allocatedHours < 1) {
        setAllocationError(
          'Allocated hours must be at least 1 hour.'
        );
        setAllocating(false);
        return;
      }

      if (allocatedHours > employee.availableHours) {
        setAllocationError(
          `Only ${employee.availableHours}h is currently available for this employee.`
        );
        setAllocating(false);
        return;
      }

      if (
        !allocationForm.startDate ||
        !allocationForm.endDate
      ) {
        setAllocationError(
          'Please select both start and end dates.'
        );
        setAllocating(false);
        return;
      }

      if (
        new Date(allocationForm.endDate) <=
        new Date(allocationForm.startDate)
      ) {
        setAllocationError(
          'End date must be after start date.'
        );
        setAllocating(false);
        return;
      }

      await api.post('/allocations', {
        employeeId: employee.employeeId,
        projectId: id,
        allocatedHours,
        startDate: allocationForm.startDate,
        endDate: allocationForm.endDate
      });

      showToast(
        `${employee.name} allocated successfully!`,
        'success'
      );

      closeAllocationModal();

      // Refresh suggestions so available hours/matches update.
      await fetchSuggestions();
    } catch (err) {
      setAllocationError(
        err.response?.data?.message ||
          'Failed to allocate employee.'
      );
    } finally {
      setAllocating(false);
    }
  };

  const statusStyles = {
    active:
      'bg-primary/10 text-primary-light border-primary/30',
    completed:
      'bg-green-500/10 text-green-400 border-green-500/30',
    'on-hold':
      'bg-accent/10 text-accent border-accent/30',
    archived:
      'bg-gray-500/10 text-gray-400 border-gray-500/30'
  };

  // ========== TABS ==========
  const tabs = [
    {
      id: 'overview',
      label: '📋 Overview'
    },
    {
      id: 'team',
      label: '👥 Team'
    },
    {
      id: 'chat',
      label: '💬 Chat'
    },
    ...(canManageProject
      ? [
          {
            id: 'suggestions',
            label: '🎯 Suggested Employees'
          }
        ]
      : [])
  ];

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

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isEmployee={isEmployee} />

        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">
            {error || 'Project not found'}
          </p>
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
            initial={{
              opacity: 0,
              y: -20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -20
            }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-xl font-body text-sm border ${
              toast.type === 'success'
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          to={
            isEmployee
              ? '/dashboard'
              : '/projects'
          }
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
        >
          ← Back to{' '}
          {isEmployee ? 'My Work' : 'Projects'}
        </Link>

        {/* Project Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-white">
                {project.name}
              </h1>

              <span
                className={`text-xs font-mono uppercase px-2 py-1 rounded-md border ${
                  statusStyles[project.status]
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="font-body text-muted mt-1">
              {project.description}
            </p>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted">
              <span>
                Manager:{' '}
                <span className="text-white">
                  {project.managerId?.name ||
                    'Unassigned'}
                </span>
              </span>

              <span>
                Ends:{' '}
                <span className="text-white">
                  {new Date(
                    project.endDate
                  ).toLocaleDateString()}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-primary-light border-b-2 border-primary'
                  : 'text-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            transition={{
              duration: 0.2
            }}
          >
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted uppercase tracking-wide">
                      Status
                    </p>

                    <p className="text-lg font-semibold text-white capitalize mt-1">
                      {project.status}
                    </p>
                  </div>

                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted uppercase tracking-wide">
                      Manager
                    </p>

                    <p className="text-lg font-semibold text-white mt-1">
                      {project.managerId?.name ||
                        'Unassigned'}
                    </p>
                  </div>

                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted uppercase tracking-wide">
                      End Date
                    </p>

                    <p className="text-lg font-semibold text-white mt-1">
                      {new Date(
                        project.endDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {project.requiredSkills?.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted uppercase tracking-wide mb-2">
                      Required Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.requiredSkills.map(
                        (skill, i) => (
                          <span
                            key={i}
                            className="font-mono text-xs text-primary-light bg-primary/10 px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {project.resources?.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted uppercase tracking-wide mb-2">
                      Resources
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {project.resources.map(
                        (resource, i) => (
                          <a
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-light hover:underline"
                          >
                            {resource.label} ↗
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TEAM */}
            {activeTab === 'team' && (
              <div className="bg-surface/50 border border-border rounded-xl p-6">
                <TeamMembers projectId={id} />
              </div>
            )}

            {/* CHAT */}
            {activeTab === 'chat' && (
              <div className="bg-surface/50 border border-border rounded-xl p-6">
                <ChatBox projectId={id} />
              </div>
            )}

            {/* SUGGESTIONS */}
            {activeTab === 'suggestions' &&
              canManageProject && (
                <div className="bg-surface/50 border border-border rounded-xl p-6">
                  {suggestionsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="font-body text-muted">
                        No suitable employees found
                        for this project.
                      </p>

                      <p className="text-xs text-muted mt-2">
                        Matching employees must have
                        required skills and available
                        capacity.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h2 className="font-display text-xl font-semibold text-white">
                          Suggested Employees
                        </h2>

                        <p className="text-sm text-muted mt-1">
                          Employees ranked by skill match
                          and available capacity.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestions.map(
                          (employee) => (
                            <div
                              key={
                                employee.employeeId
                              }
                              onClick={() =>
                                openAllocationModal(
                                  employee
                                )
                              }
                              className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:shadow-glow transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                    <span className="font-mono text-sm font-bold text-primary-light">
                                      {employee.name
                                        ?.split(' ')
                                        .map(
                                          (name) =>
                                            name[0]
                                        )
                                        .join('')
                                        .slice(
                                          0,
                                          2
                                        )
                                        .toUpperCase()}
                                    </span>
                                  </div>

                                  <div>
                                    <h3 className="font-body text-white font-semibold">
                                      {employee.name}
                                    </h3>

                                    <p className="text-xs text-muted mt-0.5">
                                      {employee.availableHours}
                                      h available
                                    </p>
                                  </div>
                                </div>

                                <span className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary-light whitespace-nowrap">
                                  {employee.matchScore}{' '}
                                  skill
                                  {employee.matchScore !==
                                  1
                                    ? 's'
                                    : ''}{' '}
                                  matched
                                </span>
                              </div>

                              {employee.matchedSkills
                                ?.length >
                                0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {employee.matchedSkills.map(
                                    (skill) => (
                                      <span
                                        key={skill}
                                        className="font-mono text-xs text-primary-light bg-primary/10 px-2.5 py-1 rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-muted">
                                    Available capacity
                                  </p>

                                  <p className="text-sm font-semibold text-green-400 mt-1">
                                    {
                                      employee.availableHours
                                    }
                                    h
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    openAllocationModal(
                                      employee
                                    );
                                  }}
                                  className="bg-primary hover:bg-primary-light text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                  Allocate
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ALLOCATION MODAL */}
      <AnimatePresence>
        {allocationModal.open &&
          allocationModal.employee && (
            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
              }}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
              onClick={closeAllocationModal}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: 10
                }}
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-glow"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Allocate Employee
                    </h2>

                    <p className="text-sm text-muted mt-1">
                      {allocationModal.employee.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeAllocationModal}
                    className="text-muted hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">
                      Available capacity
                    </span>

                    <span className="font-mono text-green-400">
                      {
                        allocationModal.employee
                          .availableHours
                      }
                      h
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {allocationModal.employee.matchedSkills?.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="font-mono text-xs text-primary-light bg-primary/10 px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {allocationError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                    {allocationError}
                  </p>
                )}

                <form
                  onSubmit={handleAllocate}
                  className="space-y-4"
                >
                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-wide">
                      Allocated hours
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={
                        allocationModal.employee
                          .availableHours
                      }
                      step="1"
                      value={
                        allocationForm.allocatedHours
                      }
                      onChange={(e) =>
                        setAllocationForm({
                          ...allocationForm,
                          allocatedHours:
                            e.target.value
                        })
                      }
                      className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-xs text-muted uppercase tracking-wide">
                        Start date
                      </label>

                      <input
                        type="date"
                        required
                        min={formatDateInput(
                          project.startDate
                        )}
                        max={formatDateInput(
                          project.endDate
                        )}
                        value={
                          allocationForm.startDate
                        }
                        onChange={(e) =>
                          setAllocationForm({
                            ...allocationForm,
                            startDate:
                              e.target.value
                          })
                        }
                        className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-xs text-muted uppercase tracking-wide">
                        End date
                      </label>

                      <input
                        type="date"
                        required
                        min={formatDateInput(
                          project.startDate
                        )}
                        max={formatDateInput(
                          project.endDate
                        )}
                        value={
                          allocationForm.endDate
                        }
                        onChange={(e) =>
                          setAllocationForm({
                            ...allocationForm,
                            endDate:
                              e.target.value
                          })
                        }
                        className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={
                        closeAllocationModal
                      }
                      disabled={allocating}
                      className="flex-1 border border-border text-muted hover:text-white py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={allocating}
                      className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {allocating
                        ? 'Allocating...'
                        : 'Confirm Allocation'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;