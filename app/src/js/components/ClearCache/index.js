import { deleteToken } from '../../utils/auth';


export const ClearCache = () => {

    const clearCacheAndRedirect = () => {
        deleteToken();
        window.location.href = '/auth'
        return null;
    }
    return clearCacheAndRedirect();
}