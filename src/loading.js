const loading_box = document.getElementById("loadingbox");
const loading_button = document.getElementById("loadingclosebutton");
const loading_spinner = document.getElementById("loadingspinner");

function close_loading_box() {
  loading_box.style.display = "None";
}

export function hideLoadingSpinnerShowButton() {
  loading_spinner.style.display = "None";
  loading_button.style.display = "block";
}

export function initializeLoadingMessage() {
  loading_button.addEventListener("click", close_loading_box);
}
