// BigPicture.js | license MIT | henrygd.me/bigpicture
// mangled for site's limited purposes
var
  // assign window object to variable
  global = window,
  // trigger element used to open popup
  el,
  // set to true after first interaction
  initialized,
  // container element holding html needed for script
  container,
  // currently active display element (image, video, youtube / vimeo iframe container)
  displayElement,
  // popup image element
  displayImage,
  // Save bytes in the minified version
  doc = document,
  appendEl = 'appendChild',
  createEl = 'createElement',
  removeEl = 'removeChild',
  text = 'innerHTML',
  pointerEventsAuto = 'pointer-events:auto',
  cHeight = 'clientHeight',
  cWidth = 'clientWidth',
  timeout = global.setTimeout;


module.exports = function(opts) {

  // called on initial open to create elements / style / add event handlers
  initialized || initialize();

  // set trigger element
  el = opts.el;

  // local image
  displayElement = displayImage;
  displayElement.src = el.src;

  container[appendEl](displayElement);
  doc.body[appendEl](container);
};


// create all needed methods / store dom elements on first use
function initialize() {
  var closeIcon;

  // add style
  var style = doc[createEl]('STYLE');
  style[text] = '#bp_container{bottom:0;left:0;right:0;position:fixed;opacity:0}#bp_img,.bp-x{position:absolute;right:0}#bp_container{top:0;z-index:9999;background:rgba(0,0,0,.7);opacity:0;pointer-events:none;transition:opacity .35s}#bp_img{max-height:96%;max-width:96%;top:0;bottom:0;left:0;margin:auto;box-shadow:0 0 3em rgba(0,0,0,.4);z-index:-1}.bp-x{font-family:Arial;top:0;cursor:pointer;opacity:.8;font-size:3em;padding:0 .3em;color:#fff}.bp-x:hover{opacity:1!important}';
  doc.head[appendEl](style);

  // create container element
  container =  doc[createEl]('DIV');
  container.id = 'bp_container';
  closeIcon = doc[createEl]('DIV');
  closeIcon.className = 'bp-x';
  closeIcon.innerHTML = '&#215;'
  container[appendEl](closeIcon);

  // create display image element
  displayImage = doc[createEl]('IMG');
  displayImage.id = 'bp_img';

  // click bindings for open / closing of image
  container.onclick = close;

  // display image bindings for image load and error
  displayImage.onload = open;
  displayImage.onerror = open.bind(null, 'image');

  // all done
  initialized = true;
}


// calculate size and position of initial element relative to full size media
function getRect() {
  var rect = el.getBoundingClientRect();
  var leftOffset = rect.left - (container[cWidth] - rect.width) / 2;
  var centerTop = rect.top - (container[cHeight] - rect.height) / 2;
  var scaleWidth = el[cWidth] / displayElement[cWidth];
  var scaleHeight = el[cHeight] / displayElement[cHeight];
  return webkitify('transform:', 'translate3D(' + leftOffset + 'px, ' +
    centerTop + 'px, 0) scale3D(' + scaleWidth + ', ' + scaleHeight + ', 0);');
}


// animate open of image / video; display caption if needed
function open(err) {
  // check if we have an error string instead of normal event
  if (typeof(err) === 'string') {
    removeContainer();
    return alert('Error: The requested ' + err + ' could not be displayed.');
  }

  // transform displayEl to match trigger el
  changeCSS(displayElement, getRect());

  // fade in container
  changeCSS(container, 'opacity:1;' + pointerEventsAuto);

  // enlarge displayEl, fade in caption if hasCaption
  timeout(
    changeCSS.bind(null, displayElement, webkitify('transition:', 'transform .35s;') + webkitify('transform:', 'none;')
  ), 60);
}


// close active display element
function close() {
  // animate closing
  displayElement.style.cssText += getRect();
  changeCSS(container, pointerEventsAuto);

  // timeout to remove els from dom; use variable to avoid calling more than once
  timeout(removeContainer, 350);
}


// remove container from DOM & clear inline style
function removeContainer() {
  doc.body[removeEl](container);
  container[removeEl](displayElement);
  changeCSS(container, '');
}


// style helper functions
function changeCSS(element, newStyle) {
  element.style.cssText = newStyle;
}
function webkitify(prop, val) {
  var webkit = '-webkit-';
  var propVal = prop + val;
  return webkit + propVal + prop + webkit + val + propVal;
}
