import { deleteToken } from '../../utils/auth';
import _config from '../../config/config';


const { basepath } = _config;

export const Logout = () => {
    const clearCacheAndRedirect = () => {
        deleteToken();
        window.location.href = `${basepath}auth`;
        return null;
    }
    return clearCacheAndRedirect();
};