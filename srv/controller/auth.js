const checkUserRoles = async (req) => {
    const allowedRoles = ['EHAdmin', 'Dept1', 'Dept2', 'Dept3'];

    let userRoles = req.user?.roles || [];
    if (userRoles && typeof userRoles === 'object' && !Array.isArray(userRoles)) {
        userRoles = Object.keys(userRoles);
    }

    if (!userRoles || userRoles.length === 0) {
        req.reject(403, 'Access denied.');
        return null;
    }

    if (userRoles.includes('EHAdmin')) {
        return ['EHAdmin'];
    }

    const matchedRoles = userRoles.filter(role => allowedRoles.includes(role));

    if (matchedRoles.length === 0) {
        req.reject(403, 'You do not have the required authorization to access Error Logs.');
        return null;
    }

    return matchedRoles;
}

const checkUserRolesKPIs = async (req) => {
    const allowedRoles = ['EHAdmin', 'Dept1', 'Dept2', 'Dept3'];

  let userRoles = req.user?.roles || [];
  if (userRoles && typeof userRoles === 'object' && !Array.isArray(userRoles)) {
    userRoles = Object.keys(userRoles);
  }

  if (!userRoles || userRoles.length === 0) {
    return null;
  }

  if (userRoles.includes('EHAdmin')) {
    return ['EHAdmin'];
  }

  const matched = userRoles.filter(role => allowedRoles.includes(role));
  return matched.length > 0 ? matched : null;
}


module.exports = {
    checkUserRoles,
    checkUserRolesKPIs
}