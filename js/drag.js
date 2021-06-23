'use strict';

const elmnt = document.getElementById('drag_div');

function enableDrag() {
  if (elmnt && elmnt.class !== 'qb_modal draggable_modal') {
    app.helpers.setAppState({ maximized: false });
    // elmnt.onmousedown = dragMouseDown;
    // elmnt.style.bottom = '0';
    // elmnt.style.right = '0';

    // let pos1 = 0,
    //   pos2 = 0,
    //   pos3 = 0,
    //   pos4 = 0;

    // const margin = 20;
    // const inner_Width = window.innerWidth - 350;
    // const inner_Height = window.innerHeight - 500;

    // function dragMouseDown(e) {
    //   e = e || window.event;
    //   e.preventDefault();
    //   // get the mouse cursor position at startup:
    //   pos3 = e.clientX;
    //   pos4 = e.clientY;
    //   document.onmouseup = closeDragElement;
    //   // call a function whenever the cursor moves:
    //   document.onmousemove = elementDrag;
    // }

    // function elementDrag(e) {
    //   e = e || window.event;
    //   e.preventDefault();
    //   // calculate the new cursor position:
    //   pos1 = pos3 - e.clientX;
    //   pos2 = pos4 - e.clientY;
    //   pos3 = e.clientX;
    //   pos4 = e.clientY;

    //   const topOffSet = elmnt.offsetTop - pos2;
    //   const leftOffSet = elmnt.offsetLeft - pos1;

    //   // set the element's new position:
    //   if (
    //     inner_Height >= topOffSet &&
    //     inner_Width >= leftOffSet &&
    //     topOffSet >= 0 &&
    //     leftOffSet >= 0
    //   ) {
    //     elmnt.style.top = topOffSet + 'px';
    //     elmnt.style.left = leftOffSet + 'px';
    //   }
    // }

    // function closeDragElement() {
    //   // stop moving when mouse button is released:
    //   document.onmouseup = null;
    //   document.onmousemove = null;
    // }

    return true;
  } else {
    return false;
  }
}

function disableDrag() {
  if (elmnt && elmnt.class !== 'qb_modal non_draggable_modal') {
    app.helpers.setAppState({ maximized: true });
    // elmnt.onmousedown = null;
    // elmnt.style.top = '0';
    // elmnt.style.left = '0';

    return true;
  } else {
    return false;
  }
}

// Create a condition that targets viewports at least 768px wide
const mediaQuery = window.matchMedia('(min-width: 481px)');

function handleTabletChange(e) {
  // Check if the media query is true
  if (e.matches) {
    enableDrag();
  } else {
    disableDrag();
  }
}

// Register event listener
mediaQuery.addListener(handleTabletChange);

// Initial check
handleTabletChange(mediaQuery);
