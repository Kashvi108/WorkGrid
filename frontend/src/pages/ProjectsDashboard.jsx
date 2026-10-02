import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useDebounce } from '../hooks/useDebounce';

const ProjectsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEmployee = user?.role === 'employee';
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);


  // ========== TOAST ==========
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // ========== MODALS ==========
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivingProject, setArchivingProject] = useState(null);
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');


  // ========== FETCH PROJECTS ==========
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedProjects = async () => {
    try {
      const res = await api.get('/projects/archived');
      setArchivedProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch archived:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (showArchived) {
      fetchArchivedProjects();
    }
  }, [showArchived]);

  // ========== HANDLERS ==========
  const handleArchive = async () => {
    setArchiveSubmitting(true);
    try {
      await api.delete(`/projects/${archivingProject._id}`, {
        data: { deletionReason: archiveReason || 'Archived by admin' }
      });
      setProjects(prev => prev.filter(p => p._id !== archivingProject._id));
      setShowArchiveModal(false);
      showToast('✅ Project archived successfully', 'success');
      if (showArchived) fetchArchivedProjects();
    } catch (err) {
      showToast('❌ Failed to archive project', 'error');
    } finally {
      setArchiveSubmitting(false);
      setArchivingProject(null);
    }
  };

  const handleRestore = async (project) => {
    try {
      await api.put(`/projects/${project._id}/restore`);
      setProjects(prev => [...prev, { ...project, status: 'active' }]);
      setArchivedProjects(prev => prev.filter(p => p._id !== project._id));
      showToast('✅ Project restored successfully', 'success');
    } catch (err) {
      showToast('❌ Failed to restore project', 'error');
    }
  };

  const handleDelete = async () => {
    setDeleteSubmitting(true);
    try {
      await api.delete(`/projects/${deletingProject._id}/permanent`, {
        data: { deletionReason: deletionReason || 'Permanently deleted' }
      });
      setProjects(prev => prev.filter(p => p._id !== deletingProject._id));
      setArchivedProjects(prev => prev.filter(p => p._id !== deletingProject._id));
      setShowDeleteModal(false);
      showToast('🗑️ Project permanently deleted', 'success');
    } catch (err) {
      showToast('❌ Failed to delete project', 'error');
    } finally {
      setDeleteSubmitting(false);
      setDeletingProject(null);
    }
  };

  //  const filteredProjects = useMemo(() => {
  //   if (!debouncedSearch) return projects;
  //   return projects.filter(p => 
  //     p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
  //     p.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  //   );
  // }, [projects, debouncedSearch]);

  const filteredProjects = useMemo(() => {
    let allProjects = [...projects];
  if (showArchived) {
    allProjects = [...allProjects, ...archivedProjects];
  }
  const search = debouncedSearch.trim().toLowerCase();

  if (!search) {
    return allProjects;
  }

  return allProjects.filter(project => {
    const name = project.name?.toLowerCase() || '';
    const description = project.description?.toLowerCase() || '';

    return name.includes(search) || description.includes(search);
  });
}, [projects, archivedProjects, debouncedSearch, showArchived]);



  const statusStyles = {
    active: 'bg-primary/10 text-primary-light border-primary/30',
    'on-hold': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    archived: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
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

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-white">All Projects</h1>
        </div>

        {/* Show Archived Toggle */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-3">
            <label className="font-body text-sm text-muted">Show archived</label>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                showArchived ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                showArchived ? 'translate-x-4' : ''
              }`} />
            </button>
          </div>
        </div>

        {/* Search Input */}
<div className="mb-4">
  <input
    type="text"
    placeholder="Search projects by name or description..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white font-body focus:outline-none focus:border-primary"
  />
</div>

         

        {error && (
          <p className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>
        )}

        {!error && projects.length === 0 && archivedProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-muted">No projects yet. Create your first project!</p>
          </div>
        )}


      {/* ===== ALL PROJECTS (Filtered) ===== */}
{filteredProjects.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {filteredProjects.map((project, i) => {
      const isArchived = project.status === 'archived';
      
      return (
        <motion.div
          key={project._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          whileHover={!isArchived ? { y: -4 } : {}}
          onClick={() => {
            if (!isArchived) {
              navigate(`/projects/${project._id}`);
            }
          }}
          className={`bg-surface border border-border rounded-2xl p-6 transition-all cursor-pointer relative group ${
            isArchived ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/50 hover:shadow-glow'
          }`}
        >
          {/* Archived Badge */}
          {isArchived && (
            <div className="absolute top-3 left-3">
              <span className="text-xs font-mono uppercase px-2 py-1 rounded-md border bg-gray-500/10 text-gray-400 border-gray-500/30">
                Archived
              </span>
            </div>
          )}

          {/* Project Content */}
          <div className={`${isArchived ? 'mt-4' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-display text-lg font-semibold ${isArchived ? 'text-gray-500' : 'text-white'}`}>
                {project.name}
              </h3>
              <span className={`text-xs font-mono uppercase px-2 py-1 rounded-md border ${statusStyles[project.status]}`}>
                {project.status}
              </span>
            </div>
            <p className={`font-body text-sm ${isArchived ? 'text-gray-600' : 'text-muted'} line-clamp-2 mb-3`}>
              {project.description || 'No description'}
            </p>
            <div className="flex items-center justify-between text-xs font-body text-muted pt-3 border-t border-border">
              <span>{project.managerId?.name || 'Unassigned'}</span>
              <span>{isArchived ? 'Archived' : (project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No end date')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {isArchived ? (
              // ✅ Show Restore for archived
              <button
                onClick={(e) => { e.stopPropagation(); handleRestore(project); }}
                className="p-1.5 bg-surface border border-border hover:border-green-500/50 rounded-lg text-muted hover:text-green-400 transition-colors"
                title="Restore"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            ) : (
              // ✅ Show Archive for active
              <button
                onClick={(e) => { e.stopPropagation(); setArchivingProject(project); setShowArchiveModal(true); }}
                className="p-1.5 bg-surface border border-border hover:border-yellow-500/50 rounded-lg text-muted hover:text-yellow-400 transition-colors"
                title="Archive"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
            )}
            {/* ✅ Show Delete for all */}
            <button
              onClick={(e) => { e.stopPropagation(); setDeletingProject(project); setShowDeleteModal(true); }}
              className="p-1.5 bg-surface border border-border hover:border-red-500/50 rounded-lg text-muted hover:text-red-400 transition-colors"
              title="Delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </motion.div>
      );
    })}
  </div>
) : (
  <div className="text-center py-20">
    <p className="font-body text-muted">No projects match your search.</p>
  </div>
)}
</main>






      {/* Archive Modal */}
      <AnimatePresence>
        {showArchiveModal && archivingProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setShowArchiveModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-yellow-500/30 rounded-2xl p-8 w-full max-w-md"
            >
              <h2 className="font-display text-xl font-bold text-yellow-400 mb-4">Archive Project</h2>
              <p className="text-muted mb-4">Are you sure you want to archive <span className="text-white font-semibold">"{archivingProject.name}"</span>?</p>
              <input
                type="text"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Reason for archiving (optional)"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowArchiveModal(false)} className="flex-1 border border-border text-muted hover:text-white py-2.5 rounded-lg">Cancel</button>
                <button onClick={handleArchive} disabled={archiveSubmitting} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg">
                  {archiveSubmitting ? 'Archiving...' : 'Archive'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && deletingProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-red-500/30 rounded-2xl p-8 w-full max-w-md"
            >
              <h2 className="font-display text-xl font-bold text-red-400 mb-4">⚠️ Permanently Delete</h2>
              <p className="text-muted mb-2">Are you sure you want to permanently delete <span className="text-white font-semibold">"{deletingProject.name}"</span>?</p>
              <p className="text-sm text-red-400/80 mb-4">🔴 This action CANNOT be undone!</p>
              <input
                type="text"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Reason for deletion (optional)"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-border text-muted hover:text-white py-2.5 rounded-lg">Cancel</button>
                <button onClick={handleDelete} disabled={deleteSubmitting} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg">
                  {deleteSubmitting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsDashboard;