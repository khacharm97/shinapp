/**
 * Role checking utilities
 * Use these functions instead of hardcoding role checks throughout the app
 */

export const isMaster = (roles?: string[]): boolean => {
  return roles?.includes('MASTER') ?? false;
};

export const isCompany = (roles?: string[]): boolean => {
  return roles?.includes('COMPANY') ?? false;
};

export const isCustomer = (roles?: string[]): boolean => {
  return roles?.includes('USER') ?? false;
};

export const isAdmin = (roles?: string[]): boolean => {
  return roles?.includes('ADMIN') ?? false;
};

/**
 * Checks if a user can have a portfolio (Master or Company)
 */
export const canHavePortfolio = (roles?: string[]): boolean => {
  return isMaster(roles) || isCompany(roles);
};

/**
 * Checks if a user has access to Brigades feature
 */
export const hasBrigadesAccess = (roles?: string[]): boolean => {
  return isMaster(roles); // Currently only masters can use brigades, adjust as needed
};
