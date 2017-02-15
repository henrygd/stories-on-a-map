import React from 'react';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import { fetchData, sendAuthenticated, unsplashImage, confirmAlert,
				dataURItoBlob, showLoginPopup, setTitle, deleteStory } from '../helpers';
import { setLoadState, setHideNav, showPopup, toggleNightMode, updateBookmarks, updateStories } from '../actions';

import { NewStoryMap } from './Map';
import FontOptions from './FontOptions';
import BigPicture from '../lib/bigpicture';
import { AudioModal } from './Modals';
import { DeleteButton } from './UserPage';

import './Story.css';


// STORY OPTIONS BAR
const optionsState = ({ returnTo }) => ({
	returnTo
});
const OptionsBar = connect(optionsState)(React.createClass({
	getInitialState: () => ({
		msg: ''
	}),
	render() {
		const panels = this.props.panels;
		const { msg } = this.state;
		return (
			<div className="options-bar">
				<button
					className="close-bar-btn"
					onClick={this.hideOptions}
					title="Hide options bar">
					<i className="fa fa-cog"></i>
				</button>
				{msg && <div className="options-popup">{msg}</div>}
				{panels.map(([icon, clickHandler, msg], i) => {
					return (
						<button key={i}
							className={`panel fa fa-${icon}`}
							onClick={clickHandler}
							onMouseEnter={() => this.setState({msg})}
							onMouseLeave={() => this.setState({msg: ''})}>
						</button>
					)
				})}
			</div>
		)
	},
	hideOptions() {
		this.props.toggleShow();
	}
}));


// redux story state objects
const mapStateToProps = ({ returnTo, nightMode, bookmarks, authToken, stories, customFont }) => ({
  returnTo,
  nightMode,
  bookmarks,
  authToken,
  stories,
  customFont
})
const mapDispatchToProps = dispatch => ({
  setLoadState: bool => dispatch(setLoadState(bool)),
  setHideNav: bool => dispatch(setHideNav(bool)),
  showPopup: popupContent => dispatch(showPopup(popupContent)),
  toggleNightMode: () => dispatch(toggleNightMode()),
  updateBookmarks: bookmarks => dispatch(updateBookmarks(bookmarks)),
  updateStories: stories => dispatch(updateStories(stories))
})


// index of stories for administration (/stories)
export const StoryIndex = connect(mapStateToProps, mapDispatchToProps)(React.createClass({
	render() {
		return (
			<table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Deletion link</th>
          </tr>
        </thead>
        <tbody>
					{ this.props.stories.map(([id, author, title, mungedTitle], i) =>  {
						const storyURL = `/stories/${mungedTitle}`;
						return (
							<tr key={i}>
								<td><Link to={storyURL}>{title}</Link></td>
								<td>{author}</td>
								<td><DeleteButton onClick={(e) => deleteStory(e, title, id)} href={`${storyURL}/delete`}/></td>
							</tr>
						)
					})}
        </tbody>
			</table>
		);
	}
}));


// story modal shared between regular story and new story components
const StoryModal = connect(mapStateToProps, mapDispatchToProps)(React.createClass({
	getInitialState: () => ({
		headerOffset: 0,
		showAudio: false,
		show: false,
		hideOptions: false
	}),
	componentDidMount() {
		// set show to true to add fade-in class to story
		setTimeout(() => this.setState({show: true}), 20);
	},
	render() {
		const { title, author, picture, audio, background, className, placeholder_picture, placeholder_background,
						nightMode, optionPanels, customFont, position, children } = this.props;
		const { expandImages, toggleOptions } = this;
		const { headerOffset, showAudio, show, hideOptions } = this.state;
		return (
			<div
				className={`story-container${show ? ' fade-in' : ''}${hideOptions ? ' hide-options' : ''}${nightMode ? ' night-mode' : ''}`}
				style={Object.assign({}, {backgroundImage: (background ? `url(${background})` : '')}, position)}>

				{placeholder_background &&
					<div className="background-image"
						style={{
							opacity: (background ? '0' : ''),
							background: `url(data:image/jpeg;base64,${placeholder_background}) center center/cover no-repeat`}
						}>
					</div>
				}

				<div className="story-modal-wrap">

					<div className="story-modal" id="story_modal">

						<div className="story-header"
							ref="header"
							style={{transform: `translate3d(0, ${headerOffset}px, 0)`}}>

							{placeholder_picture &&
								<div className="header-placeholder"
									style={{background: `url(data:image/jpeg;base64,${placeholder_picture}) center center/cover no-repeat`}}>
								</div>
							}

							<div className="header-image"
								style={picture ? ({opacity: '0.9', backgroundImage: `url(${picture})`}) : {opacity: '0'}}>
							</div>

							<div className='title-container'>
								<div className="editable-div">
									<h1 id='story_title' className={className}>{title}</h1>
								</div>
								<div className="editable-div">
									<h3 id='story_author' className={className}>{author}</h3>
								</div>
							</div>

						</div>
						<div className="story-triangle"></div>
						<div className="story-triangle-shadow"></div>

						<article className="story-content" onClick={expandImages} style={customFont}>
							{audio && <i title="Toggle story audio" onClick={this.toggleAudio} className={`fa fa-volume-up${showAudio ? ' rotate720' : ''}`}></i>}
							{showAudio && audio && <audio src={audio} controls autoPlay></audio>}
							{children}
						</article>

					</div>
					<OptionsBar panels={optionPanels} toggleShow={toggleOptions} />
				</div>
			</div>
		)
	},
	// expand images in story when clicked
	expandImages(e) {
		const { target } = e;
		if (target.tagName === 'IMG') {
			BigPicture({el: target})
		}
	},
	// show / hide story audio player
	toggleAudio() {
		this.setState(prevState => ({showAudio: !prevState.showAudio}))
	},
	// show / hide options bar
	toggleOptions() {
		this.setState(prevState => ({hideOptions: !prevState.hideOptions}))
	},
}));



///////////////////////////////////////////////////////////////////
////////////////////// NORMAL STORY ///////////////////////////////
//////////////////////////////////////////////////////////////////

export const Story = connect(mapStateToProps, mapDispatchToProps)(React.createClass({
	backgroundLoader: document.createElement('IMG'),
	pictureLoader: document.createElement('IMG'),
	getInitialState: () => ({
		bookmarked: false,
		audio: false,
	}),
	componentWillMount() {
		const { setLoadState, setHideNav, params, returnTo } = this.props;
		const body = document.body;
		setLoadState(true);
		setHideNav(true);
		// store current return location on component so it's not overwritten by modal
		this.returnTo = returnTo;
		// store fullscreenMethod if available
		this.fullscreenMethod = body.requestFullscreen ||
			body.webkitRequestFullscreen ||
			body.mozRequestFullScreen;
		this.fetchStory(params.munged_title);
	},
	componentDidUpdate(prevProps) {
		// fetch new story info if user navigates to new story while component is open
		const props = this.props;
		const oldStory = prevProps.params.munged_title;
		const newStory = props.params.munged_title;
		if (oldStory !== newStory) {
			props.setLoadState(true);
			this.fetchStory(props.params.munged_title);
		}
	},
	render() {
		// don't render story if we don't yet have story content (loader is shown)
		if (!this.state.content) {
			return null
		}
		const { content, title } = this.state;
		const createMarkup = () => ({__html: content});
		// panels for options bar
		const optionPanels = [
			// icon, click method
			['times', this.closeStory, 'Close story'],
			['font', this.showFontOptions, 'Font options'],
			['moon-o', this.props.toggleNightMode, 'Night mode'],
			[this.state.bookmarked ? 'bookmark' : 'bookmark-o', this.toggleBookmark, 'Bookmark story'],
			['twitter', this.tweetStory, 'Share on Twitter'],
		];
		// if browser supports fullscreen, add fullscreen button to optionPanels
		this.fullscreenMethod && optionPanels.push(['arrows-alt', this.lauchFullscreen, 'Launch fullscreen']);
		return (
      <DocumentTitle title={setTitle(title)}>
				<StoryModal {...this.state} optionPanels={optionPanels}>
					<div dangerouslySetInnerHTML={createMarkup()}></div>
				</StoryModal>
			</DocumentTitle>
		)
	},

	// adds story data to local state, sets onload method for larger images to update when ready
	setStory(storyObj) {
		const { bookmarks } = this.props;
		const { id, background, picture } = storyObj;
		this.setState(Object.assign(storyObj, {
			picture: null,
			background: null,
			bookmarked: bookmarks.filter(bookmark => bookmark.id === id).length
		}));
		this.pictureLoader.onload = () => this.setState({picture: picture.url});
		this.backgroundLoader.onload = () => this.setState({background: background.url});
		this.pictureLoader.src = picture.url;
		this.backgroundLoader.src = background.url;
	},

	// fetch story data
	fetchStory(munged_title) {
		fetchData(`/api/stories/${munged_title}`, res => {
			this.props.setLoadState(false);
			if (res.error) {
				// show 404 page if error when fetching story
				browserHistory.replace('/404');
				return false;
			}
			this.setStory(res);
		});
	},

	// navigates to prior location stored in this.returnTo on mount
	closeStory() {
		this.props.setHideNav(false);
		browserHistory.push(this.returnTo);
	},

	// opens font options popup
	showFontOptions() {
		this.props.showPopup(['Font Options', 'font', <FontOptions/>, true])
	},

	// adds / removes bookmark from redux store, sends info to DB
	toggleBookmark() {
		const { bookmarks, updateBookmarks, authToken, showPopup, params } = this.props;
		// show popup if no auth token
		if (!authToken) {
			return showLoginPopup('bookmark stories');
		}
		const { bookmarked, id, author, title, picture } = this.state;
		const url = `/api/bookmarks${bookmarked ? '/delete' : ''}`
		// optimistically update bookmarks state
		updateBookmarks(
			bookmarked ? (
				bookmarks.filter(bookmark => bookmark.id !== id)
			) : (
				bookmarks.concat([{
					author,
					title,
					id,
					picture: {url: picture},
					munged_title: params.munged_title
				}])
			)
		);
		this.setState({bookmarked: !bookmarked});
		// send request; show popup and restore bookmarks state if error
		sendAuthenticated(url, {story_id: id }, res => {
			if (res.error) {
				showPopup(['Error', 'warning', res.error]);
				this.setState({bookmarked: bookmarked});
				updateBookmarks(bookmarks);
			}
		})
	},

	// sets story container to fullscreen
	lauchFullscreen() {
		const container = document.querySelector('.story-container');
		this.fullscreenMethod.bind(container)();
	},

	// opens mini window to tweet story
	tweetStory() {
		const { author, title } = this.state;
    const width  = 575,
	    height = 400,
	    left   = (window.innerWidth - width)  / 2,
	    top    = (window.innerHeight - height) / 2,
	    url    = 'https://twitter.com/share?url=' +
	              encodeURIComponent(window.location.href) +
	              '&text=' + encodeURIComponent(`"${title}" by ${author}`),
	    opts = `status=1,width=${width},height=${height},top=${top},left=${left}`;
    window.open(url, 'twitter', opts);
	}
}));



///////////////////////////////////////////////////////////////////
////////////////////// NEW STORY //////////////////////////////////
//////////////////////////////////////////////////////////////////

export const NewStory = connect(mapStateToProps, mapDispatchToProps)(React.createClass({
	getInitialState: () => ({
		audio: '',
		picture: '',
		background: '',
		author: 'Enter Author Here',
		title: 'Enter Title Here',
		coords: '39, -95',
		className: 'editable'

	}),
	componentWillMount() {
		this.props.setLoadState(true);
		this.setState({
			// get random images from unsplash to use as placeholders
			picture: unsplashImage(800, 600, 422400),
			background: unsplashImage()
		});
		this.optionPanels = [
			// can add directly instead of in render method bc we don't need to check if story is bookmarked
			// icon, click method
			['font', this.showFontOptions, 'Font options'],
			['moon-o', this.props.toggleNightMode, 'Night mode'],
			['volume-up', this.showAudioOptions, 'Add story audio'],
			['floppy-o', this.saveStory, 'Save current state'],
			['refresh', this.loadStory, 'Load last save'],
			['check-square-o', this.verifySubmission, 'Submit story']
		];
		// show login warning if not logged in
		if (!this.props.authToken) {
			showLoginPopup('submit a story');
		}
	},
	componentDidMount() {
		// load editor
		if (window.MediumEditor) {
			this.initializeEditor();
		} else {
			this.loadEditor();
		}
	},
	componentWillUnmount() {
		// destroy js editors
		this.editors.forEach(editor => editor.destroy());
	},
	render() {
		// const { backgroundImage } = this;
		const { picture, background, coords } = this.state;
		const { storeCoords, changeHeaderImage, changeBackgroundImage, optionPanels } = this;
		if (!window.MediumEditor) {
			return null;
		}
		return (
			<DocumentTitle title={setTitle('New Story')}>
				<div>
					{/* display map to drag icon */}
					<NewStoryMap coords={coords} storeCoords={storeCoords}/>

					{/* image upload input boxes */}
					<div className="img-upload">
						<div id="img_one" style={{backgroundImage: `url(${picture})`}}>
							<h3>Header Image</h3>
							<input onChange={changeHeaderImage} accept="image/*" type="file"/>
						</div>
						<div id="img_two" style={{backgroundImage: `url(${background})`}}>
							<input onChange={changeBackgroundImage} accept="image/*" type="file"/>
							<h3>Background Image</h3>
						</div>
					</div>

					{/* actual story modal where user can edit story */}
					<StoryModal
						{...this.state}
						optionPanels={optionPanels}
						position={{position: 'absolute', top: '95vh', height: '100vh'}}>
						<div id="story_content">
							<p>Enter story here. If you're not on a mobile device, try highlighting text to see formatting options. You may also add an external image by typing a url, highlighting it, and clicking the image button within the formatting popup (test url below).</p><p>https://source.unsplash.com/random.jpg</p>
						</div>
					</StoryModal>
				</div>
			</DocumentTitle>
		)
	},

	// add editor JS / CSS links to page, check when they're usable
	loadEditor() {
		const script = document.createElement('script');
		const link = document.createElement('link');
		const getURL = type => `//cdn.jsdelivr.net/medium-editor/5.22.1/${type}/medium-editor.min.${type}`;
		script.src = getURL('js');
		link.href = getURL('css');
		link.rel = 'stylesheet';
		document.body.appendChild(script);
		document.body.appendChild(link);
		const checkIfLoaded = setInterval(() => {
			if (window.MediumEditor) {
				window.clearInterval(checkIfLoaded);
				this.setState({loaded: true});
				this.initializeEditor();
			}
		}, 100)
	},

	// initialize editors and add to an array so we can destroy them easily on unmount
	initializeEditor() {
		const { MediumEditor } = window;
		const hiddenToolbar = MediumEditor.extensions.toolbar.extend({
	    showToolbar: () => {
        return false;
	    }
		});
		this.editors = [
			new MediumEditor('.editable', {
		    extensions: {
		        toolbar: new hiddenToolbar()
		    },
		    disableReturn: true
			}),
			new MediumEditor('#story_content', {
				toolbar: {
					buttons: ['bold', 'h2', 'italic', 'underline', 'quote', 'image']
				},
				buttonLabels: 'fontawesome'
			})
		];
	},

	// method passed to map to update coordinates in local state on icon drag
	storeCoords(coords) {
		this.setState({coords});
	},

	// basic front end verification of user input
	verifySubmission() {
		const storyState = this.getStoryState();
		let imageFiles = {};
		let errors = [];
		Object.keys(storyState).slice(2).forEach(field => {
			const content = storyState[field];
			if (!content || content === '<p><br></p>') {
				errors.push(`Story ${field} is blank`)
			}
		})
		try {
			// try to convert base64 images to files
			const pics = ['picture', 'background'];
			pics.forEach(img => imageFiles[img] = dataURItoBlob(this.state[img]))
			pics.forEach(img => imageFiles[img][0].type.indexOf('image') < 0
				&& errors.push(`${img} image is not a valid`))
		} catch(err) {
			// error encoding images to base64 (likely user has not submitted)
			errors.push('Must submit your own images');
		}
		if (errors.length) {
			return this.showErrMsg(errors);
		} else {
			this.submit(Object.assign({}, storyState, imageFiles));
		}
	},

	// submit user story to server
	submit(storyState) {
		// submit story
		const { setLoadState, stories, updateStories, showPopup } = this.props;
		setLoadState(true);
		sendAuthenticated('/api/stories', storyState, res => {
			setLoadState(false);
			if (res.error) {
				return this.showErrMsg(res.error);
				// return alert(`Please correct the following errors:\n${res.error.join('\n')}`);
			}
			updateStories(stories.concat([res.newStory]));
			showPopup(['Success', 'thumbs-up', 'Story submitted successfully. Thanks for contributing!']);
			browserHistory.push('/');
		})
	},

	// show popup with errors if front or back end verification fails
	showErrMsg(errors) {
		const {showPopup} = this.props;
		const errMsg = (
			<div className="pu-body" style={{color: '#ff0b0b', textAlign: 'left'}}>
				<ul>
					{errors.map((err, i) => <li key={i}>{err}</li>)}
				</ul>
			</div>)
		showPopup(['Error', 'warning', errMsg, true])
	},

	// return user created data on page needed for submission
	getStoryState() {
		const { audio, coords } = this.state;
		const getHTML = selector => document.getElementById(`story_${selector}`).innerHTML;
		return {
			audio,
			coords,
			content: getHTML('content'),
			title: getHTML('title'),
			author: getHTML('author')
		}
	},

	// save user created story in localStorage
	saveStory() {
		confirmAlert('Are you sure you want to save your progress? (This will overwrite previous saves)', () => {
			const { picture, background } = this.state;
			localStorage.savedStory = JSON.stringify(Object.assign({}, this.getStoryState(), {
				picture,
				background
			}));
		})
	},

	// load saved story from localStorage
	loadStory() {
		confirmAlert('Are you sure you want to load your last save?', () => {
			const setHTML = (el, html) => document.getElementById(`story_${el}`).innerHTML = html;
			try {
				const savedStory = JSON.parse(localStorage.savedStory);
				const { picture, background, title, author, content, coords, audio } = savedStory;
				this.setState({
					audio,
					coords,
					picture,
					background
				});
				setHTML('content', content);
				setHTML('title', title);
				setHTML('author', author);
			} catch(e) {
				alert('Error loading story. Please use the same browser you used to save the story.');
			}
		})
	},

	// set header image to base64 encoded user submission
	changeHeaderImage(e) {
		this.validateImage(e.target, 'header', img => {
      const reader = new FileReader();
      reader.onload = e => {
        this.setState({picture: e.target.result})
      }
      reader.readAsDataURL(img);
		});
	},

	// set background image to base64 encoded user submission
	changeBackgroundImage(e) {
		this.validateImage(e.target, 'background', img => {
      const reader = new FileReader();
      reader.onload = e => {
        this.setState({background: e.target.result})
      }
      reader.readAsDataURL(img);
		});
	},

	// make sure user submitted image is smaller than maximum file sizes
  validateImage(input, position, cb) {
  	const image = input.files[0]
    const imageSize = image.size/1024/1024;
    const desiredSize = position === 'background' ? 2 : 1;
    if (imageSize < desiredSize) {
    	return cb(image);
    }
    alert(`Maximum file size of ${position} image is ${desiredSize} MB. Please choose a smaller file.`);
  },

	// show font Options popup
	showFontOptions() {
		this.props.showPopup(['Font Options', 'font', <FontOptions/>, true])
	},

	// show popup for adding audio to story
	showAudioOptions(audio) {
		audio = typeof(audio) === 'string' ? audio : this.state.audio;
		this.props.showPopup(['Audio Options', 'volume-up', <AudioModal audio={audio} handleChange={this.updateAudio}/>, true])
	},

	// update audio file on change of input field in audio options popup
	updateAudio(e) {
		const audio = e.target.value;
		this.setState({audio});
		this.showAudioOptions(audio);
	}
}));
