/** @format */

import { SavedStateActionTypes } from './saved-state.types';

const INITIAL_STATE = {
    currentSavedState: null,
};

const savedStateReducer = (state = INITIAL_STATE, { type, payload }) => {
    switch (type) {
        case SavedStateActionTypes.SET_CURRENT_SAVEDSTATE:
            return {
                ...state,
                currentSavedState: payload,
            };

        default:
            return state;
    }
};

export default savedStateReducer;
