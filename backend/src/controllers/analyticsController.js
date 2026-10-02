
// 'use strict';

// const Allocation = require('../models/Allocation');
// const Employee = require('../models/Employee');
// const Project = require('../models/Project');

// // ============================================
// // 1. GET UTILIZATION DATA
// // ============================================
// exports.getUtilization = async (req, res, next) => {
//   try {
//     const [employees, allocationTotals] = await Promise.all([
//       Employee.find()
//         .select('name capacityHours')
//         .lean(),

//       Allocation.aggregate([
//         {
//           $match: {
//             status: 'active'
//           }
//         },
//         {
//           $group: {
//             _id: '$employeeId',
//             totalHours: {
//               $sum: '$allocatedHours'
//             }
//           }
//         }
//       ])
//     ]);

//     const allocationMap = new Map(
//       allocationTotals.map((item) => [
//         item._id.toString(),
//         item.totalHours
//       ])
//     );

//     const utilizationData = employees.map((employee) => {
//       const totalHours =
//         allocationMap.get(employee._id.toString()) || 0;

//       const capacityHours = employee.capacityHours || 0;

//       const utilizationPercent =
//         capacityHours > 0
//           ? Math.round((totalHours / capacityHours) * 100)
//           : 0;

//       return {
//         employeeId: employee._id,
//         name: employee.name,
//         totalHours,
//         capacityHours,
//         utilizationPercent: Math.min(utilizationPercent, 100)
//       };
//     });

//     res.status(200).json(utilizationData);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 2. GET PROJECT STATS
// // ============================================
// exports.getProjectStats = async (req, res, next) => {
//   try {
//     const [totalProjects, activeProjects, completedProjects, onHoldProjects] =
//       await Promise.all([
//         Project.countDocuments(),
//         Project.countDocuments({ status: 'active' }),
//         Project.countDocuments({ status: 'completed' }),
//         Project.countDocuments({ status: 'on-hold' })
//       ]);

//     res.status(200).json({
//       total: totalProjects,
//       active: activeProjects,
//       completed: completedProjects,
//       onHold: onHoldProjects
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 3. GET ALLOCATION STATS
// // ============================================
// exports.getAllocationStats = async (req, res, next) => {
//   try {
//     const [
//       totalAllocations,
//       activeAllocations,
//       completedAllocations,
//       totalHours
//     ] = await Promise.all([
//       Allocation.countDocuments(),
//       Allocation.countDocuments({ status: 'active' }),
//       Allocation.countDocuments({ status: 'completed' }),

//       Allocation.aggregate([
//         {
//           $group: {
//             _id: null,
//             total: {
//               $sum: '$allocatedHours'
//             }
//           }
//         }
//       ])
//     ]);

//     res.status(200).json({
//       total: totalAllocations,
//       active: activeAllocations,
//       completed: completedAllocations,
//       totalAllocatedHours: totalHours[0]?.total || 0
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 4. GET SKILL DISTRIBUTION
// // ============================================
// exports.getSkillDistribution = async (req, res, next) => {
//   try {
//     const skillData = await Employee.aggregate([
//       {
//         $unwind: '$skills'
//       },
//       {
//         $group: {
//           _id: '$skills',
//           count: {
//             $sum: 1
//           }
//         }
//       },
//       {
//         $sort: {
//           count: -1
//         }
//       },
//       {
//         $limit: 10
//       },
//       {
//         $project: {
//           _id: 0,
//           name: '$_id',
//           count: 1
//         }
//       }
//     ]);

//     res.status(200).json(skillData);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 5. GET DEPARTMENT STATS
// // ============================================
// exports.getDepartmentStats = async (req, res, next) => {
//   try {
//     const departments = await Employee.aggregate([
//       {
//         $group: {
//           _id: '$department',
//           count: {
//             $sum: 1
//           }
//         }
//       },
//       {
//         $sort: {
//           count: -1
//         }
//       }
//     ]);

//     res.status(200).json(departments);
//   } catch (error) {
//     next(error);
//   }
// };













'use strict';

const Allocation = require('../models/Allocation');
const Employee = require('../models/Employee');
const Project = require('../models/Project');

const getOrganizationId = (req, res) => {
  const organizationId =
    req.organizationId || req.user?.organizationId;

  if (!organizationId) {
    res.status(403).json({
      message: 'No organization assigned to this account.'
    });

    return null;
  }

  return organizationId;
};

// ============================================
// 1. GET UTILIZATION DATA
// ============================================
exports.getUtilization = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const [employees, allocationTotals] = await Promise.all([
      Employee.find({
        organizationId
      })
        .select('name capacityHours')
        .lean(),

      Allocation.aggregate([
        {
          $match: {
            organizationId,
            status: 'active'
          }
        },
        {
          $group: {
            _id: '$employeeId',
            totalHours: {
              $sum: '$allocatedHours'
            }
          }
        }
      ])
    ]);

    const allocationMap = new Map(
      allocationTotals.map((item) => [
        item._id.toString(),
        item.totalHours
      ])
    );

    const utilizationData = employees.map((employee) => {
      const totalHours =
        allocationMap.get(employee._id.toString()) || 0;

      const capacityHours =
        employee.capacityHours || 0;

      const utilizationPercent =
        capacityHours > 0
          ? Math.round(
              (totalHours / capacityHours) * 100
            )
          : 0;

      return {
        employeeId: employee._id,
        name: employee.name,
        totalHours,
        capacityHours,
        utilizationPercent: Math.min(
          utilizationPercent,
          100
        )
      };
    });

    res.status(200).json(utilizationData);
  } catch (error) {
    next(error);
  }
};

// ============================================
// 2. GET PROJECT STATS
// ============================================
exports.getProjectStats = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects
    ] = await Promise.all([
      Project.countDocuments({
        organizationId
      }),

      Project.countDocuments({
        organizationId,
        status: 'active'
      }),

      Project.countDocuments({
        organizationId,
        status: 'completed'
      }),

      Project.countDocuments({
        organizationId,
        status: 'on-hold'
      })
    ]);

    res.status(200).json({
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      onHold: onHoldProjects
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 3. GET ALLOCATION STATS
// ============================================
exports.getAllocationStats = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const [
      totalAllocations,
      activeAllocations,
      completedAllocations,
      totalHours
    ] = await Promise.all([
      Allocation.countDocuments({
        organizationId
      }),

      Allocation.countDocuments({
        organizationId,
        status: 'active'
      }),

      Allocation.countDocuments({
        organizationId,
        status: 'completed'
      }),

      Allocation.aggregate([
        {
          $match: {
            organizationId
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$allocatedHours'
            }
          }
        }
      ])
    ]);

    res.status(200).json({
      total: totalAllocations,
      active: activeAllocations,
      completed: completedAllocations,
      totalAllocatedHours:
        totalHours[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 4. GET SKILL DISTRIBUTION
// ============================================
exports.getSkillDistribution = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const skillData =
      await Employee.aggregate([
        {
          $match: {
            organizationId
          }
        },
        {
          $unwind: '$skills'
        },
        {
          $group: {
            _id: '$skills',
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        },
        {
          $limit: 10
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            count: 1
          }
        }
      ]);

    res.status(200).json(skillData);
  } catch (error) {
    next(error);
  }
};

// ============================================
// 5. GET DEPARTMENT STATS
// ============================================
exports.getDepartmentStats = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const departments =
      await Employee.aggregate([
        {
          $match: {
            organizationId
          }
        },
        {
          $group: {
            _id: '$department',
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]);

    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

