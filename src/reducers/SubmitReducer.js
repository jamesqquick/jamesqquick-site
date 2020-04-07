export const SUBMIT_ACTIONS = {
  SUBMITTING: "SUBMITTING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  DEFAULT: "DEFAULT",
  FIELD: "FIELD",
};

export default (state, action) => {
  switch (action.type) {
    case SUBMIT_ACTIONS.SUBMITTING: {
      return {
        ...state,
        loading: true,
      };
    }
    case SUBMIT_ACTIONS.ERROR: {
      return {
        ...state,
        errMsg: action.msg,
        loading: false,
      };
    }
    case SUBMIT_ACTIONS.SUCCESS: {
      return {
        ...state,
        successMsg: action.msg,
        loading: false,
      };
    }
    case SUBMIT_ACTIONS.FIELD: {
      return {
        ...state,
        [action.target]: action.value,
      };
    }
    default: {
      return state;
    }
  }
};
