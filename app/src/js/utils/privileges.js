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
      canAddPermission: true,
      canCreate: true
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
      canDelete: privileges.USER.includes('DELETE')
    };
  }
  return {
    canRead: false,
    canAddRole: false,
    canAddGroup: false,
    canAddPermission: false,
    canCreate: false,
    canDelete: false
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
      canUnlock: true,
      canWithdraw: true,
      canRestore: true,
      canAddUser: true,
      canRemoveUser: true
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
      canUnlock: privileges.REQUEST.includes('UNLOCK'),
      canWithdraw: privileges.REQUEST.find(a =>
        a === 'DAACREAD' || a === 'ADMINREAD'),
      canRestore: privileges.REQUEST.find(a =>
        a === 'DAACREAD' || a === 'ADMINREAD'),
      canAddUser: privileges.REQUEST.includes('ADDUSER'),
      canRemoveUser: privileges.REQUEST.includes('REMOVEUSER'),
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
    canUnlock: false,
    canWithdraw: false,
    canRestore: false,
    canAddUser: false,
    canRemoveUser: false
  };
};

export const formPrivileges = (privileges) => {
  if (privileges.ADMIN) {
    return {
      canEdit: true,
      canRead: true
    };
  } else if (privileges.FORM) {
    return {
      canRead: !!privileges.FORM.find(a =>
        a === 'READ' || a === 'DAACREAD' || a === 'ADMINREAD'),
      canEdit: privileges.FORM.includes('UPDATE')
    };
  }
  return {
    canEdit: false,
    canRead: false
  };
};
