import * as reducers from '../reducers';
import { createStore, combineReducers } from 'redux'

// create redux store
const store = createStore(combineReducers(reducers));

// helper to test if correct state is returned in response to action
const actionHelper = (stateKey, action) => {
  const expectedAddition = {}
  expectedAddition[stateKey] = action.data;
  const initialState = store.getState();
  const expectedState = Object.assign({}, initialState, expectedAddition);
  store.dispatch(action);
  expect(store.getState()).toEqual(expectedState);
}

describe('reduxState', () => {

	it('should return the initial state', () => {
		expect(store.getState()).toEqual({
      stories: [],
      bookmarks: [],
      popupContent: false,
      returnTo: '/',
      authToken: null,
      pageLoading: false,
      hideNav: false,
      nightMode: false,
      customFont: {}
    })
	})

  it('should react to an action with the type UPDATE_STORIES', () => {
    actionHelper('stories', {
      type: 'UPDATE_STORIES',
      data: [{author: 'test', title: 'test'}]
    })
  })

  it('should react to an action with the type UPDATE_BOOKMARKS', () => {
    actionHelper('bookmarks', {
      type: 'UPDATE_BOOKMARKS',
      data: [{author: 'test', title: 'test'}]
    })
  })

  it('should react to an action with the type SHOW_POPUP', () => {
    actionHelper('popupContent', {
      type: 'SHOW_POPUP',
      data: ['test', 'test', 'test']
    })
  })

  it('should react to an action with the type HIDE_POPUP', () => {
    actionHelper('popupContent', {
      type: 'HIDE_POPUP',
      data: false
    })
  })

  it('should react to an action with the type SET_RETURN_TO', () => {
    actionHelper('returnTo', {
      type: 'SET_RETURN_TO',
      data: '/testing'
    })
  })

  it('should react to an action with the type UPDATE_AUTH_TOKEN', () => {
    actionHelper('authToken', {
      type: 'UPDATE_AUTH_TOKEN',
      data: {user: 'test', authToken: 'test'}
    })
  })

  it('should react to an action with the type SET_LOAD_STATE', () => {
    actionHelper('pageLoading', {
      type: 'SET_LOAD_STATE',
      data: true
    })
  })

  it('should react to an action with the type SET_HIDE_NAV', () => {
    actionHelper('hideNav', {
      type: 'SET_HIDE_NAV',
      data: true
    })
  })

  it('should react to an action with the type TOGGLE_NIGHT_MODE', () => {
    const toggledState = !store.getState().nightMode;
    actionHelper('nightMode', {
      type: 'TOGGLE_NIGHT_MODE',
      data: toggledState
    })
  })

  it('should react to an action with the type UPDATE_AUTH_TOKEN', () => {
    actionHelper('customFont', {
      type: 'SET_FONT',
      data: {fontFamily: 'Roboto', FontSize: '23'}
    })
  })

})
