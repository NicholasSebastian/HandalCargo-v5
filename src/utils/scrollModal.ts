// Scrolls the current modal to the top.
function scrollModalTop() {
  document.getElementsByClassName('ant-modal-body')[0].scrollTo({ top: 0, behavior: 'smooth' });
}

export default scrollModalTop;