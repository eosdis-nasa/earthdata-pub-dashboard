export const notePrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canReply: true,
      canAddUser: true,
      canAddGroup: true
    };
  } else if (privileges.NOTE) {
    return {
      canReply: privileges.NOTE.includes('REPLY'),
      canAddUser: privileges.NOTE.includes('ADDUSER'),
      canAddGroup: privileges.NOTE.includes('ADDGROUP')
    };
  }
  return {
    canReply: false,
    canAddUser: false,
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
      canAddPermission: true
    };
  } else if (privileges.USER) {
    return {
      canRead: privileges.USER.includes('READ'),
      canAddRole: privileges.USER.includes('ADDROLE'),
      canRemoveRole: privileges.USER.includes('REMOVEROLE'),
      canAddGroup: privileges.USER.includes('ADDGROUP'),
      canRemoveGroup: privileges.USER.includes('REMOVEGROUP'),
      canAddPermission: privileges.USER.includes('ADDPERMISSION')
    };
  }
  return {
    canRead: false,
    canAddRole: false,
    canAddGroup: false,
    canAddPermission: false
  };
};

export const requestPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canRead: true,
      canInitialize: true,
      canResume: true,
      canSubmit: true,
      canApply: true,
      canReview: true,
      canReassign: true,
      canLock: true,
      canUnlock: true
    };
  } else if (privileges.REQUEST) {
    return {
      canRead: !!privileges.REQUEST.find(a =>
        a === 'READ' || a === 'DAACREAD' || a === 'ADMINREAD'),
      canInitialize: privileges.REQUEST.includes('INITIALIZE'),
      canResume: privileges.REQUEST.includes('RESUME'),
      canSubmit: privileges.REQUEST.includes('SUBMIT'),
      canApply: privileges.REQUEST.includes('APPLY'),
      canReview: privileges.REQUEST.includes('REVIEW'),
      canReassign: privileges.REQUEST.includes('REASSIGN'),
      canLock: privileges.REQUEST.includes('LOCK'),
      canUnlock: privileges.REQUEST.includes('UNLOCK')
    };
  }
  return {
    canRead: false,
    canInitialize: false,
    canResume: false,
    canSubmit: false,
    canApply: false,
    canReview: false,
    canReassign: false,
    canLock: false,
    canUnlock: false
  };
};

export const formPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canEdit: true,
      canRead: true,
      canDelete: true
    };
  } else if (privileges.FORM) {
    return {
      canRead: !!privileges.FORM.find(a =>
        a === 'READ' || a === 'DAACREAD' || a === 'ADMINREAD'),
      canEdit: privileges.FORM.includes('RESUME'),
      canDelete: privileges.FORM.includes('SUBMIT')
    };
  }
  return {
    canEdit: false,
    canRead: false,
    canDelete: false
  };
};
