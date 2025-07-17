import carService from '../../config/api/car.service';

export const FETCH_VOITURES_REQUEST = 'FETCH_VOITURES_REQUEST';
export const FETCH_VOITURES_SUCCESS = 'FETCH_VOITURES_SUCCESS';
export const FETCH_VOITURES_FAILURE = 'FETCH_VOITURES_FAILURE';

export const fetchVoitures = (params) => async (dispatch) => {
  dispatch({ type: FETCH_VOITURES_REQUEST });
  try {
    // Support for search and deleted filter
    let queryString = '';
    if (params) {
      const { deleted, search, page = 1, limit = 10 } = params;
      const queryArr = [`page=${page}`, `limit=${limit}`];
      if (typeof deleted !== 'undefined') queryArr.push(`deleted=${deleted}`);
      if (search) queryArr.push(`search=${encodeURIComponent(search)}`);
      queryString = queryArr.join('&');
    }
    const data = await carService.getAllCarsWithQuery(queryString);
    dispatch({ type: FETCH_VOITURES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_VOITURES_FAILURE });
  }
};

export const addVoiture = (voiture) => async (dispatch) => {
  await carService.addCar(voiture);
  dispatch(fetchVoitures());
};

export const updateVoiture = (id, voiture) => async (dispatch) => {
  await carService.updateCar(id, voiture);
  dispatch(fetchVoitures());
};

export const deleteVoiture = (id) => async (dispatch) => {
  await carService.deleteCar(id);
  dispatch(fetchVoitures());
}; 