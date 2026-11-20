import React, { useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteToken } from '../../actions';
import _config from '../../config/config';

const { basepath } = _config;

export const Logout = () => {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    let inside508 = false;
    try {
      inside508 = window.parent !== window && window.parent.__edpub508 === true;
    } catch (e) {
      inside508 = false;
    }
    if (inside508) return undefined;
    dispatch(deleteToken());
    const authPath = `${basepath}`.endsWith('/') ? `${basepath}auth` : `${basepath}/auth`;
    window.location.assign(authPath);
    return undefined;
  }, [dispatch]);

  return null;
};
