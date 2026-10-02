import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useDebounce } from '../hooks/useDebounce';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // ========== FILTER STATES ==========
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [utilizationRange, setUtilizationRange] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // ========== TOAST ==========
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // ========== FETCH DATA ==========
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, allocationsRes] = await Promise.all([
          api.get('/employees'),
          api.get('/allocations')
        ]);
        setEmployees(employeesRes.data);
        setAllocations(allocationsRes.data.allocations);
      } catch (err) {
        setError('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ========== COMPUTE UTILIZATION ==========
  const getEmployeeUtilization = (employeeId) => {
    const empAllocations = allocations.filter(
      a => a.employeeId === employeeId && a.status === 'active'
    );
    const totalHours = empAllocations.reduce((sum, a) => sum + a.allocatedHours, 0);
    const capacity = employees.find(e => e._id === employeeId)?.capacityHours || 40;
    return Math.min(Math.round((totalHours / capacity) * 100), 100);
  };

  const getAvailableHours = (employeeId) => {
    const emp = employees.find(e => e._id === employeeId);
    if (!emp) return 0;
    const empAllocations = allocations.filter(
      a => a.employeeId === employeeId && a.status === 'active'
    );
    const totalHours = empAllocations.reduce((sum, a) => sum + a.allocatedHours, 0);
    return Math.max(0, emp.capacityHours - totalHours);
  };

  // ========== DEPARTMENT AND SKILLS OPTIONS ==========
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return ['All', ...Array.from(depts)];
  }, [employees]);

  const allSkills = useMemo(() => {
    const skills = new Set();
    employees.forEach(e => e.skills?.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  }, [employees]);

  // ========== FILTER LOGIC ==========
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // 1. Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.email.toLowerCase().includes(searchLower) ||
        e.department?.toLowerCase().includes(searchLower) ||
        e.skills?.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    // 2. Department filter
    if (selectedDepartment && selectedDepartment !== 'All') {
      result = result.filter(e => e.department === selectedDepartment);
    }

    // 3. Skills filter (AND logic)
    if (selectedSkills.length > 0) {
      result = result.filter(e =>
        selectedSkills.every(skill => e.skills?.includes(skill))
      );
    }

    // 4. Utilization filter
    if (utilizationRange !== 'all') {
      result = result.filter(e => {
        const util = getEmployeeUtilization(e._id);
        switch (utilizationRange) {
          case 'low': return util < 50;
          case 'medium': return util >= 50 && util <= 70;
          case 'high': return util > 70 && util <= 90;
          case 'veryHigh': return util > 90;
          default: return true;
        }
      });
    }

    // 5. Availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(e => {
        const available = getAvailableHours(e._id);
        switch (availabilityFilter) {
          case 'available': return available > 0;
          case 'full': return available === 0;
          default: return true;
        }
      });
    }

    return result;
  }, [employees, debouncedSearch, selectedDepartment, selectedSkills, utilizationRange, availabilityFilter]);

  // ========== CLEAR ALL FILTERS ==========
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedSkills([]);
    setUtilizationRange('all');
    setAvailabilityFilter('all');
  };

  // ========== TOGGLE SKILL SELECTION ==========
  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
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
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Employees</h1>
            <p className="font-body text-muted mt-1">
              {filteredEmployees.length} employees found
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-muted hover:text-white border border-border hover:border-primary/50 px-4 py-2 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* ===== SEARCH BAR ===== */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search employees by name, email, department, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white font-body focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* ===== FILTERS ROW ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {/* Department Filter */}
          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-wide block mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value="">All Departments</option>
              {departments.filter(d => d !== 'All').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-wide block mb-1">Skills</label>
            <div className="relative">
              <button
                onClick={() => {
                  const dropdown = document.getElementById('skillsDropdown');
                  dropdown?.classList.toggle('hidden');
                }}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm flex items-center justify-between focus:outline-none focus:border-primary"
              >
                <span>{selectedSkills.length > 0 ? `${selectedSkills.length} selected` : 'Select skills'}</span>
                <span className="text-muted">▼</span>
              </button>
              <div
                id="skillsDropdown"
                className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg p-2 z-10 hidden max-h-48 overflow-y-auto"
              >
                {allSkills.map(skill => (
                  <label key={skill} className="flex items-center gap-2 px-2 py-1 hover:bg-background rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-white">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Utilization Filter */}
          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-wide block mb-1">Utilization</label>
            <select
              value={utilizationRange}
              onChange={(e) => setUtilizationRange(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">All</option>
              <option value="low">&lt; 50%</option>
              <option value="medium">50% – 70%</option>
              <option value="high">70% – 90%</option>
              <option value="veryHigh">&gt; 90%</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-wide block mb-1">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">All</option>
              <option value="available">Has Capacity</option>
              <option value="full">Full Capacity</option>
            </select>
          </div>
        </div>

        {/* ===== EMPLOYEE CARDS ===== */}
        {error && (
          <p className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">{error}</p>
        )}

        {filteredEmployees.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-muted">No employees match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-primary-light hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEmployees.map((emp, i) => {
              const utilization = getEmployeeUtilization(emp._id);
              const availableHours = getAvailableHours(emp._id);
              const isAvailable = availableHours > 0;

              return (
                <motion.div
                  key={emp._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                      <span className="font-mono text-sm font-bold text-primary-light">
                        {emp.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-body text-white font-semibold truncate">{emp.name}</h3>
                      <p className="font-body text-xs text-muted truncate">{emp.email}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        isAvailable
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {isAvailable ? 'Available' : 'Full'}
                      </span>
                      <span className="text-xs text-muted mt-0.5">
                        {availableHours}h free
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs mb-3">
                    <span className="text-muted">{emp.department || 'No department'}</span>
                    <span className={`px-2 py-0.5 rounded-full capitalize font-mono ${
                      emp.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      emp.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {emp.role}
                    </span>
                    <span className="text-muted">{emp.capacityHours}h/week</span>
                  </div>

                  {/* Skills */}
                  {emp.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {emp.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="font-mono text-[10px] text-primary-light bg-primary/10 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {emp.skills.length > 4 && (
                        <span className="font-mono text-[10px] text-muted">+{emp.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Utilization Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>Utilization</span>
                      <span className={utilization > 90 ? 'text-red-400' : utilization > 70 ? 'text-yellow-400' : 'text-green-400'}>
                        {utilization}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          utilization > 90 ? 'bg-red-500' :
                          utilization > 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Employees;