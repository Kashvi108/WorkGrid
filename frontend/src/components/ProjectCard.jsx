import React from 'react';
import { motion } from 'framer-motion';

const ProjectCard = React.memo(({ project, onClick, statusStyles }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-surface border border-border rounded-2xl p-6 transition-all cursor-pointer hover:border-primary/50 hover:shadow-glow relative group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-lg font-semibold text-white">{project.name}</h3>
        <span className={`text-xs font-mono uppercase px-2 py-1 rounded-md border ${statusStyles[project.status]}`}>
          {project.status}
        </span>
      </div>
      <p className="font-body text-sm text-muted line-clamp-2 mb-3">
        {project.description || 'No description'}
      </p>
      <div className="flex items-center justify-between text-xs font-body text-muted pt-3 border-t border-border">
        <span>{project.managerId?.name || 'Unassigned'}</span>
        <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No end date'}</span>
      </div>
    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;