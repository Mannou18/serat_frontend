import {
  FETCH_VOITURES_REQUEST,
  FETCH_VOITURES_SUCCESS,
  FETCH_VOITURES_FAILURE,
} from './actions';

const initialState = {
  voitures: [],
  loading: false,
};

export default function voituresReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_VOITURES_REQUEST:
      return { ...state, loading: true };
    case FETCH_VOITURES_SUCCESS:
      return { ...state, loading: false, voitures: action.payload };
    case FETCH_VOITURES_FAILURE:
      return { ...state, loading: false };
    default:
      return state;
  }
} 