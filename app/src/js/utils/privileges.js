export const notePrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canReply: true,
      canAddUser: true,
      canRemoveUser: true
    };
  } else if (privileges.NOTE) {
    return {
      canReply: privileges.NOTE.includes('REPLY'),
      canAddUser: privileges.NOTE.includes('ADDUSER'),
      canRemoveUser: privileges.NOTE.includes('REMOVEUSER')
    };
  }
  return {
    canReply: false,
    canAddUser: false,
    canRemoveUser: false
  };
};

export const userPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canRead: true,
      canAddRole: true,
      canRemoveRole: true,
      canAddGroup: true,
      canRemoveGroup: true,
      canCreate: true,
      canUpdateWorkflow: true
    };
  } else if (privileges.USER) {
    return {
      canRead: privileges.USER.includes('READ'),
      canAddRole: privileges.USER.includes('ADDROLE'),
      canRemoveRole: privileges.USER.includes('REMOVEROLE'),
      canAddGroup: privileges.USER.includes('ADDGROUP'),
      canRemoveGroup: privileges.USER.includes('REMOVEGROUP'),
      canCreate: false,
      canUpdateWorkflow: false
    };
  }
  return {
    canRead: false,
    canAddRole: false,
    canAddGroup: false,
    canCreate: false,
    canUpdateWorkflow: false
  };
};

export const groupPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canUpload: true,
    };
  } else if (privileges.GROUP) {
    return {
      canUpload: privileges.GROUP.includes('UPLOAD'),
    };
  }
  return {
    canUpload: false
  };
};

export const requestPrivileges = (privileges, stepName) => {
  if (privileges.ADMIN) {
    return {
      canRead: true,
      canInitialize: true,
      canSubmit: true,
      canReview: true,
      canReassign: true,
      canWithdraw: true,
      canAddUser: true,
      canRemoveUser: true,
      canAssignDaac: true
    };
  } else if (privileges.REQUEST) {
    return {
      canRead: !!privileges.REQUEST.find(a =>
        a === 'READ' || a === 'DAACREAD'),
      canInitialize: privileges.REQUEST.includes('INITIALIZE'),
      canSubmit: privileges.REQUEST.includes('SUBMIT'),
      canReview: requestCanReview(privileges, stepName),
      canReassign: privileges.REQUEST.includes('REASSIGN'),
      canWithdraw: privileges.REQUEST.includes('DAACREAD'),
      canAddUser: privileges.REQUEST.includes('ADDUSER'),
      canRemoveUser: privileges.REQUEST.includes('REMOVEUSER'),
      canAssignDaac: privileges.REQUEST.includes('ASSIGNDAAC')
    };
  }
  return {
    canRead: false,
    canInitialize: false,
    canSubmit: false,
    canReview: false,
    canReassign: false,
    canWithdraw: false,
    canAddUser: false,
    canRemoveUser: false,
    canAssignDaac: false
  };
};

/**
 * Determines if the user has privileges to review the request.
 * Allows for more granular privilege checking based on the step name.
 */
export const requestCanReview = (privileges, stepName) => {
  if (stepName && stepName.match(/management_review/g)) {
    return privileges.REQUEST.includes("REVIEW_MANAGER");
  }
  else if (stepName && stepName.match(/esdis_final_review/g)) {
    const user = JSON.parse(window.localStorage.getItem('auth-user'));
    return privileges.REQUEST.includes('REVIEW_ESDIS') && user.user_groups.some((group) => group.short_name === 'root_group');
  }

  return privileges.REQUEST.includes("REVIEW") || privileges.REQUEST.includes("REVIEW_MANAGER");
}

export const formPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canCreate: true,
      canEdit: true,
      canRead: true
    };
  }
  return {
    canCreate: false,
    canEdit: false,
    canRead: false
  };
};

export const questionPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canCreate: true,
      canRead: true,
      canEdit: true
    };
  }
  return {
    canCreate: false,
    canRead: false,
    canEdit: false
  };
};

export const daacPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canRead: true,
    };
  } else if (privileges.DAAC) {
    return {
      canRead: privileges.DAAC.includes('READ'),
    };
  }
  return {
    canRead: false
  };
};

/**
 * given an array of privileges (strings), return an object with keys as the type of privilege and values as an array of actions
 * 
 * @example given an array of privileges ['USER_READ', 'GROUP_READ', 'GROUP_CREATE'], will return { USER: ['READ'], GROUP: ['READ', 'CREATE'] }
 */
export const getPrivilegesByType = (privileges) => {
    return privileges.reduce((acc, privilege) => {
        const [type, action] = privilege.split(/_(.+)/);
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(action);
        return acc;
    }, {});
}