import React from 'react';
import { Role } from '../types';

interface RoleBasedAccessProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ children }) => {
  return <>{children}</>;
};
