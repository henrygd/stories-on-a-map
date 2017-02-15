import * as actions from '../actions';

describe('actions', () => {

	describe('updateStories', () => {
		it('should have a type of "UPDATE_STORIES"', () => {
			expect(actions.updateStories().type).toEqual('UPDATE_STORIES');
		})
		it('should pass on an array of stories', () => {
			const stories = [{title: 'Way of Kings', author: 'Sanderson'}]
			expect(actions.updateStories(stories).data).toEqual(stories);
		})
	})

	describe('showPopup', () => {
		it('should have a type of "SHOW_POPUP"', () => {
			expect(actions.showPopup().type).toEqual('SHOW_POPUP');
		})
		it('should pass on an array of popup display data', () => {
			const popupContent = ['Session expired', 'warning', 'session expired']
			expect(actions.showPopup(popupContent).data).toEqual(popupContent);
		})
	})

	describe('hidePopup', () => {
		it('should have a type of "HIDE_POPUP"', () => {
			expect(actions.hidePopup().type).toEqual('HIDE_POPUP');
		})
	})

	describe('setReturnTo', () => {
		it('should have a type of "SET_RETURN_TO"', () => {
			expect(actions.setReturnTo().type).toEqual('SET_RETURN_TO');
		})
		it('should pass on a url string', () => {
			const returnTo = '/test'
			expect(actions.setReturnTo(returnTo).data).toEqual(returnTo);
		})
	})

	describe('updateAuthToken', () => {
		it('should have a type of "UPDATE_AUTH_TOKEN"', () => {
			expect(actions.updateAuthToken().type).toEqual('UPDATE_AUTH_TOKEN');
		})
		it('should pass on an object containing user token', () => {
			const authToken = {user: 'hank', token: 'test'}
			expect(actions.updateAuthToken(authToken).data).toEqual(authToken);
		})
	})

	describe('updateBookmarks', () => {
		it('should have a type of "UPDATE_BOOKMARKS"', () => {
			expect(actions.updateBookmarks().type).toEqual('UPDATE_BOOKMARKS');
		})
		it('should pass on an array of bookmark objects', () => {
			const bookmarks = [{title: 'test', author: 'test'}]
			expect(actions.updateBookmarks(bookmarks).data).toEqual(bookmarks);
		})
	})

	describe('setLoadState', () => {
		it('should have a type of "SET_LOAD_STATE"', () => {
			expect(actions.setLoadState().type).toEqual('SET_LOAD_STATE');
		})
	})

	describe('setHideNav', () => {
		it('should have a type of "SET_RETURN_TO"', () => {
			expect(actions.setHideNav().type).toEqual('SET_HIDE_NAV');
		})
	})

	describe('toggleNightMode', () => {
		it('should have a type of "TOGGLE_NIGHT_MODE"', () => {
			expect(actions.toggleNightMode().type).toEqual('TOGGLE_NIGHT_MODE');
		})
	})

	describe('setCustomFont', () => {
		const action = actions.setCustomFont({fontFamily: 'Roboto'});
		it('should have a type of "UPDATE_BOOKMARKS"', () => {
			expect(action.type).toEqual('SET_FONT');
		})
		it('should pass on a font style object', () => {
			expect(action.data).toEqual({fontFamily: 'Roboto'});
		})
	})

})
