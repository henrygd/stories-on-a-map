export const updateStories = stories => ({ type: 'UPDATE_STORIES' , data: stories });

export const showPopup = popupContent => ({ type: 'SHOW_POPUP', data: popupContent });

export const hidePopup = () => ({ type: 'HIDE_POPUP' });

export const setReturnTo = pathname => ({ type: 'SET_RETURN_TO', data: pathname});

export const updateAuthToken = token => ({ type: 'UPDATE_AUTH_TOKEN', data: token});

export const updateBookmarks = bookmarks => ({ type: 'UPDATE_BOOKMARKS', data: bookmarks });

export const setLoadState = bool => ({ type: 'SET_LOAD_STATE', data: bool });

export const setHideNav = bool => ({ type: 'SET_HIDE_NAV', data: bool });

export const toggleNightMode = () => ({ type: 'TOGGLE_NIGHT_MODE' });

export const setCustomFont = fontOption => ({ type: 'SET_FONT', data: fontOption })
