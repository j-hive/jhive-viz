// uiinteractions.js


// Detail Panel 

function closeDetailPanel() {
    // Function to Close the details panel:

    const detailsPanel = document.getElementById("detailpanel");

    detailsPanel.classList.remove("details-on");
    detailsPanel.classList.add("details-off");

}

function openDetailPanel() {
    // Function to Close the details panel:

    const detailsPanel = document.getElementById("detailpanel");

    detailsPanel.classList.remove("details-off");
    detailsPanel.classList.add("details-on");

}



function selectMouseFunction(event) {
    // Function to select mouse function:

    let button = event.target;

    let selectButton = document.getElementById("mouse-select-button");
    let zoomButton = document.getElementById("mouse-zoom-button");

    if (button.id === 'mouse-zoom-button') {

        if (!zoomButton.classList.contains('selected')) {
            zoomButton.classList.add('selected')
        }

        if (selectButton.classList.contains('selected')) {
            selectButton.classList.remove('selected')
        }

    }

    if (button.id === 'mouse-select-button') {

        if (zoomButton.classList.contains('selected')) {
            zoomButton.classList.remove('selected')
        }

        if (!selectButton.classList.contains('selected')) {
            selectButton.classList.add('selected')
        }


    }


}



// Main Starting Function
export function startUIInteractions() {

    // Add Close to Details Panel
    const closeDetailButton = document.getElementById("closedetailbutton");
    closeDetailButton.addEventListener("click", closeDetailPanel);

    // Add selectMouseFunction to Interaction Panel Buttons
    const mouseZoomButton = document.getElementById("mouse-zoom-button");
    const mouseSelectButton = document.getElementById("mouse-select-button")

    mouseZoomButton.addEventListener("click", selectMouseFunction);
    mouseSelectButton.addEventListener("click", selectMouseFunction);


}


