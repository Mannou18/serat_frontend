import actions from './actions';

const { LOGIN_BEGIN, LOGIN_SUCCESS, LOGIN_ERR, LOGOUT_BEGIN, LOGOUT_SUCCESS, LOGOUT_ERR } = actions;

const getInitialState = () => {
  const token = localStorage.getItem('token');
  return {
    login: token ? { token } : null,
    loading: false,
    error: null,
  };
};

/**
 *
 * @todo impure state mutation/explaination
 */
const AuthReducer = (state = getInitialState(), action) => {
  const { type, data, err } = action;
  switch (type) {
    case LOGIN_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        login: data,
        loading: false,
        error: null,
      };
    case LOGIN_ERR:
      return {
        ...state,
        error: err,
        loading: false,
        login: null,
      };
    case LOGOUT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LOGOUT_SUCCESS:
      localStorage.removeItem('token');
      return {
        ...state,
        login: null,
        loading: false,
        error: null,
      };
    case LOGOUT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
};

export default AuthReducer;
