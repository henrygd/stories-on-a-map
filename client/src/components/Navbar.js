import React from 'react';
import { connect } from 'react-redux';
import {Link} from 'react-router';
import ReactDOM from 'react-dom';
import TransitionGroup from 'react-addons-css-transition-group';
import { setHideNav } from '../actions';

import './Navbar.css';


const mapStateToProps = ({ username, stories, authToken, hideNav }, params) => ({
	username,
	stories,
	authToken,
	hideNav
});

const mapDispatchToProps = dispatch => ({
	setHideNav: bool => dispatch(setHideNav(bool))
})

const SearchPanel = props => {
	const { results } = props;
	return (
		<div className="search-panel">
			{ results.map((story, i) => (
				<Link key={i} to={`/stories/${story[3]}`} className="story-listing">
					<h3>{story[2]}</h3>
					<p>{story[1]}</p>
				</Link>
			)) }
			{!results.length && <h3 style={{padding: '1em 0'}}>No stories found</h3>}
		</div>
	)
}

const Navbar = React.createClass({
	getInitialState: () => ({
		searchTerm: '',
		submenuDisplay: false,
		searchResults: [],
		displayResults: false,
		linkNum: 0
	}),
	componentDidMount() {
		const { setLinkNum } = this;
		setLinkNum();
		window.addEventListener('resize', setLinkNum);
	},
	render() {
		const { hideNav, authToken } = this.props;
		const { displayResults, searchTerm, submenuDisplay, searchResults, linkNum } = this.state;
		const { makeLink, getLinks, hideSubmenu, showSubmenu, toggleSubmenu,
						hideResults, showResults, toggleNav, hideOnEscapePress } = this;
		// filter links by whether user is logged in
		const regex = authToken ? /signup|login/ : /users|logout/;
		const links = getLinks().filter(link => !link[0].match(regex));
		return (
			<div className={`navbar-container${hideNav ? ' hide-nav' : ''}`} onMouseLeave={hideSubmenu}>
				<div className='navbar'>
					<Link to='/' className="navbar-title" onClick={hideSubmenu}>
						<h1><i className='fa fa-book'></i>Stories on a Map</h1>
					</Link>
					<div className='navbar-links' ref='linkContainer'>
						{links.slice(0, linkNum).map((link, i) => makeLink(link, i))}
					</div>
	        {linkNum < links.length && (
						<div ref='sublink' onMouseEnter={showSubmenu} onTouchStart={toggleSubmenu} className="submenu-link">
							<i className="fa fa-bars"></i>
						</div>
	        )}
					<div className="story-search">
						<i className={`fa fa-${displayResults ? 'close' : 'search'}`} onClick={ hideResults }></i>
						<input type="text" onFocus={ hideSubmenu } onBlur={ hideResults } onChange={ showResults } onKeyDown={hideOnEscapePress} value={ searchTerm } placeholder="Search stories..." />
					</div>
					<button className="icon-cross" onClick={toggleNav}></button>
				</div>

			  <TransitionGroup 
			    transitionName="opacity"
			    transitionEnterTimeout={150}
			    transitionLeaveTimeout={150}>
					{submenuDisplay && !hideNav &&
						<div className="submenu flex-links">
							{links.slice(linkNum).map((link, i) => makeLink(link, i))}
						</div>
					}
					{ displayResults && !hideNav &&
						<SearchPanel results={searchResults} />
					}
				</TransitionGroup>
			</div>
		)
	},

	getLinks() {
		const { authToken } = this.props;
		return [
			// url, display text, icon
			['/newstory', 'New Story', 'pencil-square-o'],
			[`/users/${authToken ? authToken.username : ''}`, 'My Account', 'user'],
			['/signup', 'Sign Up', 'user'],
			['/login', 'Login', 'sign-in'],
			['/bookmarks', 'Bookmarks', 'bookmark'],
			['/random', 'Random Story', 'random'],
			['/logout', 'Log Out', 'sign-out'],
			['/contact', 'Contact', 'envelope'],
			['/content-policy', 'Content Policy', 'copyright']
		];
	},
	makeLink([url, text, icon], i) {
		return (
			<Link key={i} activeClassName="active" to={url} onClick={this.hideSubmenu}>
				<i className={`fa fa-${icon}`}></i>{text}
			</Link>
		);
	},
	setLinkNum() {
		const width = ReactDOM.findDOMNode(this.refs.linkContainer).clientWidth;
		const linkNum = Math.floor(width / 165);
		this.setState({linkNum})
	},
	toggleNav() {
		const { hideNav, setHideNav } = this.props;
		setHideNav(!hideNav);
	},
	showSubmenu() {
		!this.state.displayResults && this.setState({ submenuDisplay: true })
	},
	hideSubmenu() {
		this.setState({ submenuDisplay: false })
	},
	toggleSubmenu() {
		this.setState(prevState => ({ submenuDisplay: !prevState.submenuDisplay}))
	},
	showResults(e) {
		const searchTerm = e.target.value
		if (searchTerm) {
			const regex = RegExp(searchTerm, 'i');
			const searchResults = this.props.stories.filter(story => (story[1] + story[2]).match(regex));
			this.setState({ searchTerm, searchResults, displayResults: true })
		} else {
			this.setState({ searchTerm, displayResults: false })
		}
	},
	hideOnEscapePress(e) {
		if (e.keyCode === 27) {
			e.target.blur();
		}
	},
	hideResults() {
		this.setState({ displayResults: false })
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);