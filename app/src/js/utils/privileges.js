export const notePrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canReply: true,
      canAddUser: true,
      canRemoveUser: true,
      canAddGroup: true
    };
  } else if (privileges.NOTE) {
    return {
      canReply: privileges.NOTE.includes('REPLY'),
      canAddUser: privileges.NOTE.includes('ADDUSER'),
      canRemoveUser: privileges.NOTE.includes('REMOVEUSER'),
      canAddGroup: privileges.NOTE.includes('ADDGROUP')
    };
  }
  return {
    canReply: false,
    canAddUser: false,
    canRemoveUser: false,
    canAddGroup: false
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
      canAddPermission: true,
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
      canAddPermission: privileges.USER.includes('ADDPERMISSION'),
      canCreate: privileges.USER.includes('CREATE'),
      canDelete: privileges.USER.includes('DELETE'),
      canUpdateWorkflow: false
    };
  }
  return {
    canRead: false,
    canAddRole: false,
    canAddGroup: false,
    canAddPermission: false,
    canCreate: false,
    canDelete: false,
    canUpdateWorkflow: false
  };
};

export const groupPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canCreate: true,
      canRead: true,
      canEdit: true,
      canDelete: true,
      canAddPermission: true,
      canUpload: true,
    };
  } else if (privileges.GROUP) {
    return {
      canCreate: privileges.GROUP.includes('GROUP_CREATE'),
      canRead: privileges.GROUP.includes('GROUP_READ'),
      canEdit: privileges.GROUP.includes('GROUP_UPDATE'),
      canDelete: privileges.GROUP.includes('GROUP_DELETE'),
      canAddPermission: privileges.GROUP.includes('GROUP_ADDPERMISSION'),
      canUpload: privileges.GROUP.includes('UPLOAD'),
    };
  }
  return {
    canCreate: false,
    canRead: false,
    canEdit: false,
    canDelete: false,
    canAddPermission: false,
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
      canRemoveUser: true
    };
  } else if (privileges.REQUEST) {
    return {
      canRead: !!privileges.REQUEST.find(a =>
        a === 'REQUEST_READ' || a === 'REQUEST_DAACREAD'),
      canInitialize: privileges.REQUEST.includes('REQUEST_INITIALIZE'),
      canSubmit: privileges.REQUEST.includes('REQUEST_SUBMIT'),
      canReview: requestCanReview(privileges, stepName),
      canReassign: privileges.REQUEST.includes('REQUEST_REASSIGN'),
      canWithdraw: privileges.REQUEST.find(a => a === 'REQUEST_DAACREAD'),
      canAddUser: privileges.REQUEST.includes('REQUEST_ADDUSER'),
      canRemoveUser: privileges.REQUEST.includes('REQUEST_REMOVEUSER'),
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
    canRemoveUser: false
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

  return privileges.REQUEST.includes("REVIEW");
}

export const formPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canCreate: true,
      canEdit: true,
      canRead: true
    };
  } else if (privileges.FORM) {
    return {
      canRead: !!privileges.FORM.find(a =>
        a === 'READ' || a === 'DAACREAD' || a === 'ADMINREAD'),
      canEdit: privileges.FORM.includes('UPDATE'),
      canCreate: privileges.FORM.includes('CREATE'),
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
      canEdit: true,
      canDelete: true
    };
  } else if (privileges.QUESTION) {
    return {
      canCreate: privileges.QUESTION.includes('CREATE'),
      canRead: privileges.QUESTION.includes('READ'),
      canEdit: privileges.QUESTION.includes('UPDATE'),
      canDelete: privileges.QUESTION.includes('DELETE')
    };
  }
  return {
    canCreate: false,
    canRead: false,
    canEdit: false,
    canDelete: false
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
 * @example given an array of privileges ['USER_READ', 'GROUP_READ', 'GROUP_CREATE'], will return { USER: ['READ', 'CREATE'], GROUP: ['READ', 'CREATE'] }
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