import React from 'react';
import {Link} from 'react-router';
import { store } from './index';
import { showPopup, setLoadState, updateStories, updateBookmarks } from './actions';

// return page title
export const setTitle = title => {
	const site = 'Stories on a Map';
	return title ? `${title} | ${site}` : site;
};

const alertFetchErr = e => alert('Error: failed to fetch data from server');

// fetch data
export const fetchData = (url, cb) => {
	fetch(url)
		.then(res => res.json())
		.then(data => cb(data))
		.catch(alertFetchErr)
};

export const sendData = (url, data, cb) => {
	fetch(url, {
		method: 'POST',
		body: data
	}).then(res => res.json())
		.then(resJSON => cb(resJSON));
};

const LoginPopup = ({msg}) => (
	<div className="pu-body">
		<p>Please <Link to="/login">login</Link> or <Link to="/signup">sign up</Link> to {msg || 'perform this action'}.</p>
	</div>
);

export const showLoginPopup = msg => {
	store.dispatch(showPopup(['Not logged in', 'warning', <LoginPopup msg={msg}/>, true]));
}

// fetch with authenticated token
export const fetchAuthenticated = (url, cb) => {
	const authToken = localStorage.auth_token;
	if (!authToken) {
		showLoginPopup();
		store.dispatch(setLoadState(false));
	} else {
		fetch(url, {
			headers: {
				authorization: authToken
			}
		}).then(res => res.json())
			.then(resJSON => cb(resJSON))
			.catch(alertFetchErr)
	}
};

// send with authenticated token
export const sendAuthenticated = (url, payload, cb) => {
	const authToken = localStorage.auth_token;
	if (!authToken) {
		showLoginPopup();
		store.dispatch(setLoadState(false));
	} else {
		let data = new FormData();
		Object.keys(payload).forEach(key => {
			const keyData = payload[key];
			if (Array.isArray(keyData)) {
				// picture passed in as array, send w/ filename
				data.append(key, keyData[0], keyData[1]);
			} else {
				data.append(key, keyData);
			}
		});
		fetch(url, {
			method: 'POST',
			body: data,
			headers: {
				authorization: authToken
			}
		}).then(res => res.json())
			.then(resJSON => cb(resJSON));
	}
};

// add google maps script if not loaded & intitiate either new story / home page map
export const loadMap = mapName => {
	const fnName = `init${mapName}Map`;
	if (!window.google) {
		const script = document.createElement('script');
		// personal api key url
		script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBoUCPaLN5G-9vCe0uzwdayzIFQt4_ssDo&callback=${fnName}`
		// non api key url
		// script.src = `https://maps.googleapis.com/maps/api/js?v=3&callback=${fnName}`;
		document.body.appendChild(script);
	} else {
		window[fnName]();
	}
}

// decode JWT token
export const parseJWT = token => {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace('-', '+').replace('_', '/');
	return JSON.parse(window.atob(base64));
};

// returns url of random unsplash image to fit screen size
export const unsplashImage = (width, height, collection) => {
	return `https://source.unsplash.com/collection/${collection || 437316}/${width || window.innerWidth}x${height || window.innerHeight}/daily`;
}

export const confirmAlert = (msg, cb) => {
	if (confirm(msg) === false)
		return false
	cb();
}

// convert base64 new story image to file for form upload
export const dataURItoBlob = dataURI => {
	const byteString = atob(dataURI.split(',')[1]);
	const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	const fileExtension = mimeString.replace(/^\w*\//, '');
	const ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (let i = 0; i < byteString.length; i++) {
	    ia[i] = byteString.charCodeAt(i);
	}
	return [new Blob([ab], { type: mimeString }), `filename.${fileExtension}`];
};

// remove story from redux store, send info to DB, restore if error
export const deleteStory = (e, storyTitle, story_id, callback) => {
	e.preventDefault();
	confirmAlert(`Sure you want to delete ${storyTitle}? This cannot be undone.`, () => {
		// quick delete data from redux store. If error, restore initial data in ajax cb
		const { stories, bookmarks, authToken } = store.getState();
		if (!authToken)
			return showLoginPopup();
		const setStories = stories => store.dispatch(updateStories(stories));
		const setBookmarks = bkmks => store.dispatch(updateBookmarks(bkmks));
		setStories(stories.filter(story => story[0] !== story_id));
		setBookmarks(bookmarks.filter(bookmark => bookmark.id !== story_id));
		sendAuthenticated('/api/stories/delete', { story_id }, res => {
			if (res.error) {
				// if error - reset stories / bookmarks
				store.dispatch(showPopup(['Error', 'warning', res.error]));
				setBookmarks(bookmarks);
				setStories(stories);
			} else {
				callback && callback(res);
			}
		});
	});
};
