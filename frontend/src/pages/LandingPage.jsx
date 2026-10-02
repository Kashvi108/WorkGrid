// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';

// const LandingPage = () => {
//   const features = [
//     {
//       title: 'Smart matching',
//       description: 'Automatically suggests the right employees for a project based on skills and availability.',
//     },
//     {
//       title: 'Over-allocation alerts',
//       description: 'Catches double-booked employees before it becomes a scheduling disaster.',
//     },
//     {
//       title: 'Live utilization',
//       description: "See who's free and who's stretched thin, updated in real time.",
//     },
//   ];

//   return (
//     <div className="relative bg-background min-h-screen overflow-hidden">
//       <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
//       <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-highlight/10 rounded-full blur-[150px]" />

//       <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
//         <span className="font-display text-xl font-bold text-white">
//           Resource<span className="text-primary-light">Flow</span>
//         </span>
//         <div className="flex items-center gap-4">
//           <Link to="/login" className="font-body text-sm text-muted hover:text-white transition-colors">
//             Log in
//           </Link>
//           <Link
//             to="/register"
//             className="font-body text-sm bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg transition-colors"
//           >
//             Get started
//           </Link>
//         </div>
//       </nav>

//       <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
//         <motion.span
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="font-mono text-xs uppercase tracking-widest text-primary-light bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 inline-block mb-6"
//         >
//           Smart resource allocation
//         </motion.span>

//         <motion.h1
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.1 }}
//           className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
//         >
//           Stop guessing who's free.
//           <br />
//           <span className="text-primary-light">Start allocating smart.</span>
//         </motion.h1>

//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//           className="font-body text-muted text-lg max-w-xl mx-auto mb-10"
//         >
//           ResourceFlow tracks employee capacity, matches skills to projects, and stops
//           over-allocation before it happens — automatically.
//         </motion.p>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.3 }}
//         >
//           <Link
//             to="/register"
//             className="inline-block bg-primary hover:bg-primary-light text-white font-body font-semibold px-8 py-4 rounded-lg shadow-glow transition-colors"
//           >
//             Get started free
//           </Link>
//         </motion.div>
//       </section>

//       <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
//         <motion.h2
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.3 }}
//           transition={{ duration: 0.6 }}
//           className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-16"
//         >
//           Everything you need, nothing you don't
//         </motion.h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {features.map((feature, i) => (
//             <motion.div
//               key={feature.title}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true, amount: 0.3 }}
//               transition={{ duration: 0.5, delay: i * 0.15 }}
//               className="bg-surface border border-border rounded-2xl p-7 hover:border-primary/40 transition-colors"
//             >
//               <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 mb-5" />
//               <h3 className="font-display text-lg font-semibold text-white mb-2">
//                 {feature.title}
//               </h3>
//               <p className="font-body text-sm text-muted leading-relaxed">
//                 {feature.description}
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       <section className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true, amount: 0.4 }}
//           transition={{ duration: 0.6 }}
//           className="bg-surface border border-border rounded-3xl px-10 py-16 shadow-glow"
//         >
//           <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
//             Ready to stop juggling spreadsheets?
//           </h2>
//           <p className="font-body text-muted mb-8">
//             Set up your team in minutes. No credit card required.
//           </p>
//           <Link
//             to="/register"
//             className="inline-block bg-primary hover:bg-primary-light text-white font-body font-semibold px-8 py-4 rounded-lg transition-colors"
//           >
//             Create free account
//           </Link>
//         </motion.div>
//       </section>

//       <footer className="relative z-10 border-t border-border">
//         <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
//           <span className="font-display text-sm font-bold text-white">
//             Resource<span className="text-primary-light">Flow</span>
//           </span>
//           <span className="font-body text-xs text-muted">
//             Built by Kashvi — MERN stack project
//           </span>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default LandingPage;
























import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Skill-based matching',
      description:
        'Find employees whose skills match project requirements without manually scanning every profile.'
    },
    {
      icon: BarChart3,
      title: 'Capacity visibility',
      description:
        'Track allocated hours, available capacity, and utilization before assigning new work.'
    },
    {
      icon: ShieldCheck,
      title: 'Conflict prevention',
      description:
        'Catch overlapping allocations and capacity overages before they turn into scheduling problems.'
    },
    {
      icon: BellRing,
      title: 'Deadline awareness',
      description:
        'Keep teams informed with project deadline alerts and automatic notifications.'
    },
    {
      icon: MessageSquare,
      title: 'Real-time collaboration',
      description:
        'Discuss project work through real-time chat with room-level access controls.'
    },
    {
      icon: Users,
      title: 'Organization workspaces',
      description:
        'Keep multiple organizations separate with organization-level data isolation and role-based access.'
    }
  ];

  const workflow = [
    {
      number: '01',
      title: 'Create your workspace',
      text: 'Create an organization or join an existing one with its invite code.'
    },
    {
      number: '02',
      title: 'Build the project',
      text: 'Define dates, skills, resources, and the manager responsible for the work.'
    },
    {
      number: '03',
      title: 'Find the right people',
      text: 'Compare skill matches and available capacity before making an allocation.'
    },
    {
      number: '04',
      title: 'Track the work',
      text: 'Monitor utilization, deadlines, notifications, and team conversations from one place.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white overflow-hidden selection:bg-violet-500/30">

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,92,255,0.12),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(45,212,191,0.08),transparent_28%),radial-gradient(circle_at_55%_80%,rgba(99,102,241,0.07),transparent_30%)]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '52px 52px'
          }}
        />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-30 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(124,92,255,0.22)]">
              <Zap size={17} className="text-white" fill="currentColor" />
            </div>

            <span className="font-display text-xl font-bold tracking-tight">
              Work<span className="text-violet-400">Grid</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              How it works
            </a>

            <a
              href="#security"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Security
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-950 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Get started
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-28 md:pb-36">
          <div className="max-w-4xl">

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-violet-400/15 bg-violet-400/[0.06] mb-7"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-violet-300">
                Smarter resource planning
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl xl:text-[78px] font-bold leading-[0.98] tracking-[-0.045em]"
            >
              Put the right people
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                on the right work.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14 }}
              className="mt-7 max-w-2xl text-lg md:text-xl leading-relaxed text-slate-400"
            >
              Plan projects, match people to work, monitor capacity,
              prevent allocation conflicts, and keep your team aligned
              from one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="flex flex-wrap items-center gap-3 mt-9"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_12px_35px_rgba(99,102,241,0.25)] transition-all"
              >
                Create your workspace
                <ArrowRight size={17} />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/[0.09] bg-white/[0.025] hover:bg-white/[0.05] text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                Explore features
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-9 text-sm text-slate-500"
            >
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Role-based access
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Organization isolation
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Real-time collaboration
              </span>
            </motion.div>
          </div>
        </section>

        {/* FEATURE INTRO */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-start mb-12">

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet-400">
                What it handles
              </p>

              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-3">
                Less coordination.
                <br />
                More clarity.
              </h2>
            </div>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl">
              ResourceFlow brings the operational side of project staffing
              into one workflow so teams can make allocation decisions with
              better visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.06
                  }}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] hover:border-violet-400/20 p-7 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl border border-violet-400/15 bg-violet-400/[0.07] flex items-center justify-center mb-8">
                    <Icon size={18} className="text-violet-300" />
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm md:text-[15px] leading-7 text-slate-400">
                    {feature.description}
                  </p>

                  <div className="mt-7 inline-flex items-center gap-1 text-xs font-medium text-violet-300 opacity-70 group-hover:opacity-100 transition-opacity">
                    Learn more
                    <ChevronRight size={13} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

              <div className="p-8 md:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/[0.07]">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal-300">
                  How it works
                </p>

                <h2 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-3">
                  A cleaner path from
                  <br />
                  project to people.
                </h2>

                <p className="text-base text-slate-400 leading-7 mt-6 max-w-md">
                  Start with the project requirements, compare the available
                  talent, make a validated allocation, and keep the work visible
                  as it moves forward.
                </p>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 mt-9 text-sm font-semibold text-teal-300 hover:text-teal-200 transition-colors"
                >
                  Build your workspace
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="p-8 md:p-12 lg:p-14">
                <div className="space-y-7">
                  {workflow.map((step) => (
                    <div key={step.number} className="flex gap-5">
                      <span className="font-mono text-xs text-violet-300 pt-1.5 w-7 shrink-0">
                        {step.number}
                      </span>

                      <div className="flex-1 pb-7 border-b border-white/[0.07] last:border-0">
                        <h3 className="text-lg font-semibold text-white">
                          {step.title}
                        </h3>

                        <p className="text-sm md:text-[15px] text-slate-400 leading-7 mt-2">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section id="security" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet-400">
              Built with boundaries
            </p>

            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-3">
              Your organization's
              <br />
              data stays yours.
            </h2>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed mt-6">
              ResourceFlow is designed around organization-level isolation,
              role-based permissions, authenticated APIs, and protected
              project collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-12">

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7">
              <ShieldCheck className="text-violet-300 mb-6" size={21} />

              <h3 className="text-lg font-semibold">
                Organization isolation
              </h3>

              <p className="text-sm text-slate-400 leading-7 mt-3">
                Employees, projects, allocations, analytics, notifications,
                and chat are scoped to their organization.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7">
              <Users className="text-teal-300 mb-6" size={21} />

              <h3 className="text-lg font-semibold">
                Role-based access
              </h3>

              <p className="text-sm text-slate-400 leading-7 mt-3">
                Admin, manager, and employee roles receive different
                permissions and workflows.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7">
              <Zap className="text-amber-300 mb-6" size={21} />

              <h3 className="text-lg font-semibold">
                Fast operations
              </h3>

              <p className="text-sm text-slate-400 leading-7 mt-3">
                Efficient MongoDB queries, aggregation, lean reads,
                pagination, and indexed access patterns support the backend.
              </p>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.10] via-white/[0.025] to-teal-300/[0.05] px-8 py-16 md:px-16 md:py-20 text-center"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-64 bg-violet-500/15 blur-[100px] rounded-full" />

            <div className="relative">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet-300">
                Ready when you are
              </p>

              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-4">
                Make your next allocation
                <br />
                a little less complicated.
              </h2>

              <p className="max-w-xl mx-auto text-base text-slate-400 leading-relaxed mt-5">
                Create your organization, bring your team in, and start
                managing project capacity from one place.
              </p>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-9 px-7 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-colors"
              >
                Get started
                <ArrowRight size={17} />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.07] bg-[#08090d]">
        <div className="max-w-7xl mx-auto px-6 py-14">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12">

            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Zap size={15} className="text-white" fill="currentColor" />
                </div>

                <span className="font-display text-lg font-bold">
                  Resource<span className="text-violet-400">Flow</span>
                </span>
              </Link>

              <p className="text-sm leading-6 text-slate-500 mt-4 max-w-xs">
                A workforce resource management platform for
                planning projects and allocating people with clarity.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Product
              </p>

              <div className="flex flex-col gap-3 mt-4">
                <a href="#features" className="text-sm text-slate-500 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#workflow" className="text-sm text-slate-500 hover:text-white transition-colors">
                  How it works
                </a>
                <a href="#security" className="text-sm text-slate-500 hover:text-white transition-colors">
                  Security
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Account
              </p>

              <div className="flex flex-col gap-3 mt-4">
                <Link to="/login" className="text-sm text-slate-500 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="text-sm text-slate-500 hover:text-white transition-colors">
                  Create account
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Project
              </p>

              <div className="flex flex-col gap-3 mt-4">
                <span className="text-sm text-slate-500">
                  MERN stack
                </span>
                <span className="text-sm text-slate-500">
                  Real-time collaboration
                </span>
                <span className="text-sm text-slate-500">
                  Multi-tenant architecture
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} ResourceFlow. All rights reserved.
            </p>

            <div className="flex items-center gap-5">
              <span className="text-xs text-slate-600">
                Built by Kashvi
              </span>

              <span className="w-1 h-1 rounded-full bg-slate-700" />

              <span className="text-xs text-slate-600">
                MERN stack project
              </span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


