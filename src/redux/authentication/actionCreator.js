import actions from './actions';
import authService from '../../config/api/auth.service';

const { loginBegin, loginSuccess, loginErr, logoutBegin, logoutSuccess } = actions;

const login = (phoneNumber, password) => {
  return async dispatch => {
    try {
      dispatch(loginBegin());
      const response = await authService.login(phoneNumber, password);
      if (response && response.token) {
        dispatch(loginSuccess(response));
        return response;
      }
      dispatch(loginErr('Identifiants incorrects'));
    } catch (err) {
      dispatch(loginErr(err?.response?.data?.message || 'Identifiants incorrects'));
    }
  };
};

const logOut = () => {
  return async dispatch => {
    try {
      dispatch(logoutBegin());
      authService.logout();
      dispatch(logoutSuccess());
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
};

export { login, logOut };
