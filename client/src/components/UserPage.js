import React from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import { updateBookmarks, updateStories, setLoadState } from '../actions'

import './UserPage.css';
import { fetchData, sendAuthenticated, setTitle, deleteStory } from '../helpers';
import DocumentTitle from 'react-document-title';

export const DeleteButton = props => (
	<a {...props} className="button but-delete fa fa-trash-o">Delete</a>
)

const StoryBoxes = props => {
	let buttonText;
	const { stories, num } = props;
	if (!stories || stories.length < 1) {
		buttonText = 'Nothing here';
	} else if (stories.length - num > 0) {
		buttonText = `Show more (${stories.length - num} remaining)`;
	}
	return (
		<div className="portfolio">
			{stories.slice(0, num).map((story, i) => {
				const { title, author, munged_title, picture, id } = story;
				return (
					<div key={i} className="story" style={{backgroundImage: `url(${picture.url})`}}>
						<h4 className="fa fa-book">{title}</h4>
						<div className="story-info">
							<p>{author}</p>
						</div>
						<div className="story-buttons">
							<Link to={`/stories/${munged_title}`} className="button but-website fa fa-newspaper-o">Read</Link>{' '}
							{props.ownPage &&
								<DeleteButton onClick={(e) => props.deleteMethod(e, title, id)} href={`/stories/${munged_title}/delete`}/>
							}
						</div>
					</div>
				)})}
			{buttonText && <div onClick={props.handleClick} className="view-more button">{buttonText}</div>}
		</div>
	)
};


const mapStateToProps = ({ stories, bookmarks, authToken }, params) => ({
	stories,
	bookmarks,
	authToken
})
const mapDispatchToProps = dispatch => ({
	 updateBookmarks: bookmarks => dispatch(updateBookmarks(bookmarks)),
	 updateStories: stories => dispatch(updateStories(stories)),
	 setLoadState: bool => dispatch(setLoadState(bool))
});
const UserPage = connect(mapStateToProps, mapDispatchToProps)(React.createClass({
	getInitialState: () => ({
		userStories: [],
		showStoryNum: 4,
		showBookmarkNum: 4,
		reverseStories: false,
		reverseBookmarks: true
	}),
	componentWillMount() {
		this.fetchUserStories();
	},
	render() {
		const { authToken, bookmarks } = this.props;
		const { username } = this.props.params;
		const isOwnPage = authToken && authToken.username === username;
		// bookmarks from redux only if own page
		const { userStories, showStoryNum, reverseStories, reverseBookmarks, showBookmarkNum, loaded } = this.state;
		if (!loaded) {
			return null
		}
		return (
			<DocumentTitle title={setTitle(username)}>
				<div className="user-container">
					<div className="header">
						<h2>{username}</h2>
					</div>
					<div className="user-page">
						<div>
							<h2 className="heading fa fa-pencil">Submitted Stories</h2>
							<p className="subheading">Sort by:
								<button onClick={this.reverseUserStories} className={reverseStories ? '' : 'sortStyle'}>Newest to Oldest</button>
								<button onClick={this.reverseUserStories} className={reverseStories ? 'sortStyle' : ''}>Oldest to Newest</button>
							</p>
								<StoryBoxes
									stories={reverseStories ? userStories.slice(0).reverse() : userStories}
									num={showStoryNum}
									deleteMethod={this.deleteMethod}
									handleClick={this.showMoreStories}
									ownPage={isOwnPage}
								/>
						</div>

						{isOwnPage && (
							<div className="bookmarks-container">
								<h2 className="heading fa fa-bookmark-o">Bookmarks</h2>
								<p className="subheading">Sort by:
									<button onClick={this.reverseUserBookmarks} className={reverseBookmarks ? 'sortStyle' : ''}>Newest to Oldest</button>
									<button onClick={this.reverseUserBookmarks} className={reverseBookmarks ? '' : 'sortStyle'}>Oldest to Newest</button>
								</p>
								<StoryBoxes
									stories={reverseBookmarks ? bookmarks.slice(0).reverse() : bookmarks}
									num={showBookmarkNum}
									deleteMethod={this.deleteBookmark}
									handleClick={this.showMoreBookmarks}
									ownPage={true}
								/>
							</div>
						)}

					</div>

					<div className="footer">
						<p>Thanks for visiting!</p>
					</div>
				</div>
			</DocumentTitle>
		)
	},

	fetchUserStories() {
		const { setLoadState } = this.props;
		setLoadState(true);
		fetchData(`/api/users/${this.props.params.username}`, res => {
			setLoadState(false);
			if (res.error) {
				browserHistory.replace('/404');
				return;
			}
			this.setState({userStories: res.stories, loaded: true})
		})
	},
	showMoreStories() {
		this.setState(prevState => ({showStoryNum: prevState.showStoryNum + 4}))
	},
	showMoreBookmarks() {
		this.setState(prevState => ({showBookmarkNum: prevState.showBookmarkNum + 4}))
	},
	reverseUserStories(e) {
		if (e.target.className !== 'sortStyle') {
			this.setState(prevState => ({
				userStories: prevState.userStories,
				reverseStories: !prevState.reverseStories
			}))
		}
	},
	reverseUserBookmarks(e) {
		if (e.target.className !== 'sortStyle') {
			this.setState(prevState => ({
				reverseBookmarks: !prevState.reverseBookmarks
			}))
		}
	},
	deleteMethod(e, storyTitle, story_id) {
		deleteStory(e, storyTitle, story_id, res => this.setState({userStories: res}))
	},
	deleteBookmark(e) {
		e.preventDefault();
		// quick delete data from redux store. If error, restore initial data in ajax cb
		const story_id = Number(e.target.getAttribute('data-id'));
		const { updateBookmarks, showPopup, bookmarks } = this.props;
		updateBookmarks(bookmarks.filter(bookmark => bookmark.id !== story_id))
		sendAuthenticated('/api/bookmarks/delete', { story_id }, res => {
			if (res.error) {
				showPopup(['Error', 'warning', res.error])
				updateBookmarks(bookmarks)
			}
		})
	}
}));

export default UserPage;
