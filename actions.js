const handleClick = () => {
  store.dispatch({
    type: "ADD_NOTE", 
    note: document.getElementById('input-text').value
  });
  document.getElementById('input-text').value = '';
};