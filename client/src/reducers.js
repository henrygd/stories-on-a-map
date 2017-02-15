// number of links that can fit on the main navbar

// stories
export const stories = (state, action) => {
	switch(action.type) {
		case 'UPDATE_STORIES':
			return action.data || [];
		default:
			return state || [];
	}
};

// user bookmarks
export const bookmarks = (state, action) => {
	switch(action.type) {
		case 'UPDATE_BOOKMARKS':
			return action.data
		default:
			return state || [];
	}
}

// popup state
export const popupContent = (state, action) => {
	switch(action.type) {
		case 'SHOW_POPUP':
			return action.data || false;
		case 'HIDE_POPUP':
			return false;
		default:
			return state || false;
	}
}

// Pathname link for closed modal
export const returnTo = (state, action) => {
	switch(action.type) {
		case 'SET_RETURN_TO':
			return action.data || '/';
		default:
			return state || '/';
	}
}

export const authToken = (state, action) => {
	switch(action.type) {
		case 'UPDATE_AUTH_TOKEN':
			return action.data
		default:
			return state || null
	}
}

// PAGE LOAD STATE
export const pageLoading = (state, action) => {
	switch(action.type) {
		case 'SET_LOAD_STATE':
			return action.data
		default:
			return state || false
	}
}

export const hideNav = (state, action) => {
	switch(action.type) {
		case 'SET_HIDE_NAV':
			return action.data
		default:
			return state || false
	}
}

// NIGHT MODE
export const nightMode = (state, action) => {
	switch(action.type) {
		case 'TOGGLE_NIGHT_MODE':
			return !state
		default:
			return state || false
	}
}

// CUSTOM FONT OPTIONS
export const customFont = (state, action) => {
	switch(action.type) {
		case 'SET_FONT':
			return Object.assign({}, state, action.data);
		default:
			return state || {}
	}
}
