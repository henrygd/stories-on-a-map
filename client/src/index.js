import React from 'react';
import initReactFastclick from 'react-fastclick';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, Link } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import * as reducers from './reducers';
reducers.routing = routerReducer;
import { parseJWT, fetchData, fetchAuthenticated } from './helpers';
import { updateStories, updateBookmarks, updateAuthToken, showPopup } from './actions';

import App from './components/App';
import { HomeMap } from './components/Map';
import { Story, NewStory, StoryIndex } from './components/Story';
import UserPage from './components/UserPage.js';
import { LoginModal, SignupModal, BookmarksModal,
				ContactModal, LogoutModal, ActivationModal,
				ContentPolicyModal, ForgotPassModal, NewPassModal } from './components/Modals';
import ImageBackground from './components/ImageBackground';
import NotFound from './components/404.js';

import './index.css';

// help wth touch / clicks on mobile
initReactFastclick();

// show alert if user browser does not support local storage
!localStorage && alert('Please upgrade to a browser that supports local storage');

// create redux store
export const store = createStore(combineReducers(reducers));
const history = syncHistoryWithStore(browserHistory, store);

// methods to check if JWT token is expired on each page change
const tokenIsExpired = token => token.exp - +new Date() / 1000 < 0;
const ExpiredSession = () => (
	<div className="pu-body">
		<p>Your session has expired. Please <Link to="/login">login again</Link>.</p>
	</div>
);
const checkSession = () => {
	const { authToken } = store.getState();
	if (authToken && tokenIsExpired(authToken)) {
		localStorage.removeItem('auth_token');
		store.dispatch(updateAuthToken(null));
		store.dispatch(updateBookmarks([]));
		store.dispatch(showPopup(['Session expired', 'warning', <ExpiredSession/>, true]));
	}
};

// redirect login / signup urls if user is logged in
const blockIfLoggedIn = (nextState, replace) => {
	const state = store.getState();
	state.authToken && replace(state.returnTo);
};

// onEnter method for /random => replace url with random story
const randomEnter = (nextState, replace) => {
	const stories = store.getState().stories;
	const randomStory = stories[Math.floor(Math.random() * stories.length)][3];
	replace(`/stories/${randomStory}`);
};

const modalRoute = component => ({root: ImageBackground, modal: component});

const routes = (
	<Route component={App} onChange={checkSession}>
		<Route path='/' component={HomeMap}/>
		<Route path='newstory' component={NewStory}/>
		<Route path='users/:username' component={UserPage}/>

		<Route path='login' components={modalRoute(LoginModal)} onEnter={blockIfLoggedIn}/>
		<Route path='signup' components={modalRoute(SignupModal)} onEnter={blockIfLoggedIn}/>
		<Route path='bookmarks' components={modalRoute(BookmarksModal)}/>
		<Route path='contact' components={modalRoute(ContactModal)}/>
		<Route path='logout' components={modalRoute(LogoutModal)}/>

		<Route path='stories' component={StoryIndex}/>
		<Route path='stories/:munged_title' components={{story: Story}}/>
		<Route path='random' onEnter={randomEnter}/>
		<Route path='content-policy' components={modalRoute(ContentPolicyModal)}/>
		<Route path='reset-password' components={modalRoute(ForgotPassModal)}/>

		<Route path='account_activations/:activationToken/edit' components={modalRoute(ActivationModal)} onEnter={blockIfLoggedIn}/>
		<Route path='password_resets/:resetToken/edit' components={modalRoute(NewPassModal)} onEnter={blockIfLoggedIn}/>

		<Route path='*' component={NotFound}/>
	</Route>
);

const run = () => {
	ReactDOM.render(
		(<Provider store={store}>
			<Router history={history}>
				{ routes }
			</Router>
		</Provider>), document.getElementById('root')
	);
};

// render react, subscribe to store
const init = () => {
	run();
	store.subscribe(run);
};

// fetch stories and initialize
(() => {
	let fetchMethod = fetchData;

	// check if valid auth token is stored in browser, remove if expired
	const localToken = localStorage.auth_token ? parseJWT(localStorage.auth_token) : null;
	if (localToken) {
		if (tokenIsExpired(localToken)) {
			// delete token if session expired
			localStorage.removeItem('auth_token');
		} else {
			// if good token, store it in redux and send with initial request
			store.dispatch(updateAuthToken(localToken))
			fetchMethod = fetchAuthenticated;
		}
	}

	// get stories / user bookmarks and initialize app
	fetchMethod('/api/stories', res => {
		if (res.error)
			return alert(`Error: ${res.error}`)
		if (res.bookmarks)
			store.dispatch(updateBookmarks(res.bookmarks));
		store.dispatch(updateStories(res.stories));
		init();
	});
})();
