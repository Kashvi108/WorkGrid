const calculateAllocatedHours = (employeeId, allocations) => {
  const employeeAllocations = allocations.filter(
    (a) => a.employeeId.toString() === employeeId.toString()
  );

  return employeeAllocations.reduce(
    (sum, a) => sum + a.allocatedHours,
    0
  );
};

module.exports = { calculateAllocatedHours };