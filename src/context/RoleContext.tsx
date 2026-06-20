"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "Super Admin" | "Finance Manager" | "Accountant" | "Billing Staff" | "Auditor";

interface RoleContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  hasPermission: (module: string, action: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Permission mapping based on section 3.2 Permission Matrix in PDF spec
const PERMISSIONS: Record<Role, Record<string, string[]>> = {
  "Super Admin": {
    invoices: ["read", "create", "update", "cancel", "send", "credit-note"],
    payments: ["read", "record", "refund", "reconcile"],
    expenses: ["read", "create", "approve", "reject"],
    reports: ["read", "export"],
    config: ["manage"],
  },
  "Finance Manager": {
    invoices: ["read", "create", "update", "cancel", "send", "credit-note"],
    payments: ["read", "record", "refund", "reconcile"],
    expenses: ["read", "approve", "reject"],
    reports: ["read", "export"],
    config: ["manage"], // PDF says: "Tax Configuration: Manage"
  },
  Accountant: {
    invoices: ["read", "create", "update", "send"], // PDF: Invoice Management = Full
    payments: ["read", "record"], // PDF: Record
    expenses: ["read", "create"], // PDF: Create
    reports: ["read"], // PDF: View
    config: [],
  },
  "Billing Staff": {
    invoices: ["read", "create", "send"], // PDF: Create/Send
    payments: ["read", "record"], // PDF: Record
    expenses: ["read"],
    reports: [],
    config: [],
  },
  Auditor: {
    invoices: ["read"], // PDF: Read
    payments: ["read"], // PDF: Read
    expenses: ["read"], // PDF: Read
    reports: ["read"], // PDF: Full
    config: [],
  },
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setRoleState] = useState<Role>("Super Admin");

  // Load from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("lti_selected_role");
    if (saved) {
      setRoleState(saved as Role);
    }
  }, []);

  const setCurrentRole = (role: Role) => {
    setRoleState(role);
    localStorage.setItem("lti_selected_role", role);
  };

  const hasPermission = (module: string, action: string): boolean => {
    const rolePermissions = PERMISSIONS[currentRole];
    if (!rolePermissions) return false;
    const moduleActions = rolePermissions[module];
    return moduleActions ? moduleActions.includes(action) : false;
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, hasPermission }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
