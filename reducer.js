const initialState = [];
const ADD_NOTE = "ADD_NOTE";

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case ADD_NOTE:
      return [...state, action.note];
    default:
      return state;    
  }
};
