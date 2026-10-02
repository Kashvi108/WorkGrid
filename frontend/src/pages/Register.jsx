// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Link, useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import { useAuth } from '../context/AuthContext';
// import { ArrowLeft } from 'lucide-react';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     department: '',
//     capacityHours: 40,
//     skills: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const payload = {
//         ...formData,
//         capacityHours: Number(formData.capacityHours),
//         skills: formData.skills
//           .split(',')
//           .map((s) => s.trim())
//           .filter((s) => s.length > 0),
//       };

//       const res = await api.post('/auth/register', payload);
//       login(res.data.token, res.data.employee);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fields = [
//     { name: 'name', type: 'text', label: 'Full name', placeholder: 'Priya Sharma' },
//     { name: 'email', type: 'email', label: 'Email', placeholder: 'you@company.com' },
//     { name: 'password', type: 'password', label: 'Password', placeholder: '••••••••' },
//     { name: 'department', type: 'text', label: 'Department', placeholder: 'Engineering' },
//     { name: 'capacityHours', type: 'number', label: 'Weekly capacity (hours)', placeholder: '40' },
//     { name: 'skills', type: 'text', label: 'Skills (comma separated)', placeholder: 'React, Node.js, MongoDB' },
//   ];

//   return (
//     <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden py-12">
//       <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
//       <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />

//       <motion.div
//         initial={{ opacity: 0, y: 24 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//         className="relative z-10 w-full max-w-md mx-4"
//       >

//         <Link to="/" className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors mb-6">
//     <ArrowLeft size={13} /> Back to home
//   </Link>
//         <Link to="/" className="block text-center mb-8">
//           <span className="font-display text-2xl font-bold text-white">
//             Resource<span className="text-primary-light">Flow</span>
//           </span>
//         </Link>

//         <div className="bg-surface border border-border rounded-2xl p-8 shadow-glow">
//           <h1 className="font-display text-2xl font-bold text-white mb-1">Create account</h1>
//           <p className="font-body text-muted text-sm mb-6">Start managing your team's workload</p>

//           {error && (
//             <motion.p
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4"
//             >
//               {error}
//             </motion.p>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {fields.map((field, i) => (
//               <motion.div
//                 key={field.name}
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 + i * 0.05 }}
//               >
//                 <label className="font-mono text-xs text-muted uppercase tracking-wide">
//                   {field.label}
//                 </label>
//                 <input
//                   type={field.type}
//                   name={field.name}
//                   required={field.name !== 'skills'}
//                   value={formData[field.name]}
//                   onChange={handleChange}
//                   className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-3 text-white font-body focus:outline-none focus:border-primary focus:shadow-glow transition-all"
//                   placeholder={field.placeholder}
//                 />
//               </motion.div>
//             ))}

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={loading}
//               className="w-full bg-primary hover:bg-primary-light text-white font-body font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 mt-2"
//             >
//               {loading ? 'Creating account...' : 'Create account'}
//             </motion.button>
//           </form>

//           <p className="text-center text-sm text-muted mt-6 font-body">
//             Already have an account? <Link to="/login" className="text-primary-light hover:underline">Log in</Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Register;
















import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const [organizationMode, setOrganizationMode] = useState('create');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    capacityHours: 40,
    skills: '',
    organizationName: '',
    organizationCode: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleModeChange = (mode) => {
    setOrganizationMode(mode);
    setError('');

    setFormData((prev) => ({
      ...prev,
      organizationName: '',
      organizationCode: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        capacityHours: Number(formData.capacityHours),
        skills: formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)
      };

      if (organizationMode === 'create') {
        payload.organizationName =
          formData.organizationName.trim();
      } else {
        payload.organizationCode =
          formData.organizationCode.trim().toUpperCase();
      }

      const res = await api.post(
        '/auth/register',
        payload
      );

      login(
        res.data.token,
        res.data.employee
      );

      // Show the generated organization code
      // to the creator so it can be shared with teammates.
      if (
        organizationMode === 'create' &&
        res.data.organization?.code
      ) {
        alert(
          `Organization created successfully!\n\nOrganization Code: ${res.data.organization.code}\n\nShare this code with your teammates so they can join your organization.`
        );
      }

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: 'name',
      type: 'text',
      label: 'Full name',
      placeholder: 'Priya Sharma'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'you@company.com'
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: '••••••••'
    },
    {
      name: 'department',
      type: 'text',
      label: 'Department',
      placeholder: 'Engineering'
    },
    {
      name: 'capacityHours',
      type: 'number',
      label: 'Weekly capacity (hours)',
      placeholder: '40'
    },
    {
      name: 'skills',
      type: 'text',
      label: 'Skills (comma separated)',
      placeholder: 'React, Node.js, MongoDB'
    }
  ];

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden py-12">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{
          opacity: 0,
          y: 24
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={13} />
          Back to home
        </Link>

        <Link
          to="/"
          className="block text-center mb-8"
        >
          <span className="font-display text-2xl font-bold text-white">
            Work
            <span className="text-primary-light">
              Grid
            </span>
          </span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-glow">
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Create account
          </h1>

          <p className="font-body text-muted text-sm mb-6">
            Start managing your team's workload
          </p>

          {error && (
            <motion.p
              initial={{
                opacity: 0,
                height: 0
              }}
              animate={{
                opacity: 1,
                height: 'auto'
              }}
              className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4"
            >
              {error}
            </motion.p>
          )}

          {/* ORGANIZATION MODE */}
          <div className="mb-6">
            <label className="font-mono text-xs text-muted uppercase tracking-wide">
              Organization
            </label>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() =>
                  handleModeChange('create')
                }
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  organizationMode === 'create'
                    ? 'bg-primary/10 text-primary-light border-primary/40'
                    : 'bg-background text-muted border-border hover:text-white'
                }`}
              >
                Create new
              </button>

              <button
                type="button"
                onClick={() =>
                  handleModeChange('join')
                }
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  organizationMode === 'join'
                    ? 'bg-primary/10 text-primary-light border-primary/40'
                    : 'bg-background text-muted border-border hover:text-white'
                }`}
              >
                Join existing
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {organizationMode === 'create' ? (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
              >
                <label className="font-mono text-xs text-muted uppercase tracking-wide">
                  Organization name
                </label>

                <input
                  type="text"
                  name="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-3 text-white font-body focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                  placeholder="Acme Technologies"
                />

                <p className="text-xs text-muted mt-1.5">
                  You will become the organization admin.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
              >
                <label className="font-mono text-xs text-muted uppercase tracking-wide">
                  Organization code
                </label>

                <input
                  type="text"
                  name="organizationCode"
                  required
                  value={formData.organizationCode}
                  onChange={handleChange}
                  className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-3 text-white font-body uppercase focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                  placeholder="1WKXOWKR"
                />

                <p className="text-xs text-muted mt-1.5">
                  Ask your organization's admin for the invite code.
                </p>
              </motion.div>
            )}

            {fields.map((field, i) => (
              <motion.div
                key={field.name}
                initial={{
                  opacity: 0,
                  x: -10
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: 0.1 + i * 0.05
                }}
              >
                <label className="font-mono text-xs text-muted uppercase tracking-wide">
                  {field.label}
                </label>

                <input
                  type={field.type}
                  name={field.name}
                  required={
                    field.name !== 'skills'
                  }
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-3 text-white font-body focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                  placeholder={field.placeholder}
                />
              </motion.div>
            ))}

            <motion.button
              whileHover={{
                scale: 1.02
              }}
              whileTap={{
                scale: 0.98
              }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-body font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {loading
                ? 'Creating account...'
                : organizationMode === 'create'
                ? 'Create organization & account'
                : 'Join organization'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted mt-6 font-body">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-light hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

