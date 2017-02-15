import React from 'react';
// import ReactDOM from 'react-dom';
import { Link, browserHistory } from 'react-router';
import DocumentTitle from 'react-document-title';
import { sendData, fetchData, parseJWT, setTitle } from '../helpers';
import { connect } from 'react-redux';
import { hidePopup, updateAuthToken, showPopup, updateBookmarks, setLoadState } from '../actions';

import './Modal.css';


const modalState = ({ returnTo, popupContent }, params) => ({
	popupContent,
	returnTo
});
const modalDispatch = dispatch => ({
	hidePopup: () => dispatch(hidePopup()),
});
const Modal = connect(modalState, modalDispatch)(React.createClass({
	componentWillMount() {
		// hide popup if open when modal is requested
		const { popupContent, popup, hidePopup } = this.props;
		if (popupContent && !popup) {
			hidePopup();
		}
	},
	closeModal() {
		const { popup, hidePopup, returnTo } = this.props;
		popup ? hidePopup() : browserHistory.push(returnTo);
	},
	containerClick(e) {
		e.target.className === 'modal-container' && this.closeModal();
	},
	render() {
		const { icon, title, children, popup } = this.props;
		const el = (
			<div className="modal-container" onClick={this.containerClick}>
				<div className="modal">
					<div className="modal-head">
						<h2><i className={`fa fa-${icon}`}></i> {title}</h2>
						<button onClick={this.closeModal} className="icon-cross" id="cross_close"></button>
					</div>
					<div className="modal-inner">
						{children}
					</div>
				</div>
			</div>
		);
		return (
			// render modal with document title if not popup
			popup ? el : (
				<DocumentTitle title={setTitle(title)}>
					{el}
				</DocumentTitle>
			)
		);
	}
}));


export const Popup = ({ contentArr }) => {
	return (
		<Modal title={contentArr[0]} icon={contentArr[1]} text={contentArr[2]} popup={true}>
			{contentArr.length < 4 ?
				// display simple message or inner component depending on complexity
				<div className="pu-body"><p>{contentArr[2]}</p></div>
				: contentArr[2]
			}
		</Modal>
	)
};

const loginState = ({ authToken, returnTo }, params) => ({
	authToken,
	returnTo
});
const loginDispatch = dispatch => ({
	updateAuthToken: token => dispatch(updateAuthToken(token)),
	updateBookmarks: bookmarks => dispatch(updateBookmarks(bookmarks)),
	showPopup: popupContent => dispatch(showPopup(popupContent)),
	setLoadState: bool => dispatch(setLoadState(bool))
})


//////////////////////////////////////////
//////////// LOGIN MODAL /////////////////
//////////////////////////////////////////

export const LoginModal = connect(loginState, loginDispatch)(React.createClass({
	getInitialState: () => ({
		error: false
	}),
	render() {
		return (
			<Modal title="Log In" icon="sign-in">
				<div>
					<div className="pu-info">
						<span style={{padding: '0 2%', display: 'inline-block'}}>New user? <Link to='/signup'>Sign up now</Link> </span>|<span style={{padding: '0 2%', display: 'inline-block'}}>Forgot password? <Link to="/reset-password">Reset</Link></span>
					</div>
					{this.state.error &&
						<div className="alert-danger">{this.state.error}</div>
					}
					<form onSubmit={this.submitData}>
						<RequiredInput type="email" placeholder="Email" name="email" onChange={this.hideError}/>
						<RequiredInput type="password" placeholder="Password" name="password" onChange={this.hideError}/>
						<input type="submit" value="Log In" className="btn-purp" />
					</form>
				</div>
			</Modal>
		)
	},
	hideError() {
		this.setState({error: false})
	},
	submitData(e) {
		e.preventDefault();
		const { setLoadState, updateAuthToken, updateBookmarks, showPopup, returnTo } = this.props;
		setLoadState(true);
		const formData = new FormData(e.target);
		sendData('/api/authenticate', formData, res => {
			setLoadState(false);
			if (res.error) {
				this.setState({error: res.error[Object.keys(res.error)[0]]});
			} else {
				const { auth_token, bookmarks } = res;
				localStorage.auth_token = auth_token;
				updateAuthToken(parseJWT(auth_token));
				updateBookmarks(bookmarks);
				browserHistory.replace(returnTo);
				showPopup(['Logged In', 'thumbs-up', 'Welcome back! Enjoy the stories.'])
			}
		})
	}
}));


//////////////////////////////////////////
//////////// SIGN UP MODAL ///////////////
//////////////////////////////////////////

export const SignupModal = connect(loginState, loginDispatch)(React.createClass({
	getInitialState: () => ({
		errors: []
	}),
	render() {
		return (
			<Modal title="Sign Up" icon="user">
				<div>
					<div className="pu-info"><span style={{padding: '0 2%', display: 'inline-block'}}>Already have an account? <Link to='/login'>Login</Link> </span>|<span style={{padding: '0 2%', display: 'inline-block'}}>Forgot password? <Link to="/reset-password">Reset</Link></span>
					</div>
					{this.state.errors.length > 0 &&
						<div className="alert-danger"><ul>{this.state.errors.map((errMsg, i) => <li key={i}>{errMsg}</li>)}</ul></div>
					}
					<form onSubmit={this.submitData}>
						<RequiredInput type="email" placeholder="Email" name="email"/>
						<RequiredInput type="text"  placeholder="Username" name="username"/>
						<RequiredInput type="password" placeholder="Password" name="password"/>
						<RequiredInput type="password" placeholder="Confirm Password" name="password_confirmation"/>
						<input type="submit" value="Create Account" className="btn-purp"/>
					</form>
				</div>
			</Modal>
		)
	},
	submitData(e) {
		e.preventDefault();
		const { setLoadState } = this.props;
		setLoadState(true);
		const formData = new FormData(e.target);
		sendData('/api/signup', formData, res => {
			setLoadState(false);
			if (res.error) {
				this.setState({errors: res.error});
			} else {
				browserHistory.push(this.props.returnTo);
				this.props.showPopup(['Success', 'thumbs-up', res.msg])
			}
		})
	}
}));


//////////////////////////////////////////
//////////// LOGOUT MODAL ////////////////
//////////////////////////////////////////

const logOutDispatch = dispatch => ({
	updateAuthToken: token => dispatch(updateAuthToken(token)),
	updateBookmarks: bookmarks => dispatch(updateBookmarks(bookmarks))
});
export const LogoutModal = connect(null, logOutDispatch)(React.createClass({
	componentWillMount() {
		localStorage.removeItem('auth_token');
		this.props.updateAuthToken(null);
		this.props.updateBookmarks([]);
	},
	render() {
		return (
			<Modal title="Logged Out" icon="hand-peace-o">
				<div className="pu-info">
					<p>You have been logged out. Thanks for stopping by!</p>
				</div>
			</Modal>
		);
	}
}));


//////////////////////////////////////////
/////////// BOOKMARKS MODAL //////////////
//////////////////////////////////////////

const bookmarksState = ({stories, bookmarks, authToken}, params) => ({
	authToken,
	bookmarks
})
export const BookmarksModal = connect(bookmarksState)(React.createClass({
	getInitialState: () => ({
		bookmarks: []
	}),
	componentDidMount() {
		const modalInner = document.querySelector('.modal-inner');
		const nodes = document.querySelectorAll('.story-listing');
		const { bookmarks } = this.state;
		const lazyLoad = () => {
			console.log('calling lazy load');
			const modal = modalInner;
			const inView = modal.clientHeight + modal.scrollTop;
			bookmarks.forEach((bookmark, i) => {
				if (!bookmark.imgLoaded) {
					bookmark.imgLoaded = nodes[i].offsetTop < inView;
				}
			})
			this.setState({bookmarks})
		}
		lazyLoad();
		modalInner.onscroll = lazyLoad;
	},
	componentWillMount() {
		const bkmks = this.props.bookmarks.map(bookmark => Object.assign({}, bookmark, {imgLoaded: false}));
		this.setState({bookmarks: bkmks})
	},
	render() {
		const { authToken } = this.props;
		const { bookmarks } = this.state;
		// console.log('bookmarks', bookmarks)
		return (
			<Modal title="Boomarks" icon="bookmark">
				<div className="pu-info">
					{ // if not logged in
					!authToken &&
						<p>Please <Link to='/signup'>sign up</Link> or <Link to='/login'>log in</Link> to use this feature.</p>
					}
					{ // if logged in & no bookmarks
					authToken && !bookmarks.length && <p>You have no bookmarks! Please add some.</p>
					}
				</div>
					{
					// logged in and has bookmarks
					!!bookmarks.length && bookmarks.map((bookmark, i) => (
						<div key={i} onClick={() => browserHistory.replace(`/stories/${bookmark.munged_title}`)} className="story-listing">
							<div className="picture-box" style={{backgroundImage: (bookmark.imgLoaded ? `url(${bookmark.picture.url})` : '')}}></div>
							<h3>{bookmark.title}</h3>
							<p>{bookmark.author}</p>
						</div>
					))
					}
			</Modal>
		)
	}
}));


//////////////////////////////////////////
//////////// CONTACT MODAL ///////////////
//////////////////////////////////////////

export const ContactModal = connect(loginState, loginDispatch)(React.createClass({
	getInitialState: () => ({
		errors: []
	}),
	render() {
		return (
			<Modal title="Contact" icon="envelope">
				<div>
					{this.state.errors.length > 0 &&
						<div className="alert-danger"><ul>{this.state.errors.map((errMsg, i) => <li key={i}>{errMsg}</li>)}</ul></div>
					}
					<form onSubmit={this.submitData} onChange={this.hideError}>
						<RequiredInput type="text" placeholder="Your name" name="name"/>
						<RequiredInput type="email"  placeholder="Your email" name="email"/>
						<textarea placeholder="Your message" name="message" required/>
						<input type="submit" value="Send Message" className="btn-purp"/>
					</form>
				</div>
			</Modal>
		)
	},
	submitData(e) {
		e.preventDefault();
		const { setLoadState, showPopup } = this.props;
		setLoadState(true);
		const formData = new FormData(e.target);
		sendData('/api/contact', formData, res => {
			setLoadState(false);
			if (res.error) {
				const err = res.error;
				this.setState({errors: Array.isArray(err) ? err : ['Connection error']});
			} else {
				browserHistory.push(this.props.returnTo);
				showPopup(['Success', 'thumbs-up', res.msg])
			}
		})
	},
	hideError() {
		this.state.errors.length > 0 && this.setState({errors: []});
	}
}));


//////////////////////////////////////////
///////// USER POLICY MODAL //////////////
//////////////////////////////////////////

export const ContentPolicyModal = () => {
	return (
		<Modal title="Content Policy" icon="copyright">
			<div>
				<p className="pu-body">Please do not submit copyrighted content unless given permission from its owner. If you hold the rights to any content posted here and would like it removed, please contact me via the <Link to='/contact'>form here</Link>, or email directly to <a href="mailto:hank@henrygd.me">hank@henrygd.me</a></p>
			</div>
		</Modal>
	)
};


//////////////////////////////////////////
////////// ACTIVATION MODAL //////////////
//////////////////////////////////////////

export const ActivationModal = connect(loginState, loginDispatch)(React.createClass({
	getInitialState: () => ({
		status: 'Checking activation...'
	}),
	componentWillMount() {
		const props = this.props;
		const token = props.params.activationToken;
		const email = props.location.query.email;
		fetchData(`/api/account_activations/${token}/edit?email=${email}`, res => {
			const { msg, error, auth_token } = res;
			if (auth_token) {
				localStorage.auth_token = auth_token;
				this.props.updateAuthToken(parseJWT(auth_token));
			}
			this.setState({status: msg || error})
		})
	},
	render() {
		return (
			<Modal title="Account Activation" icon="user">
				<div>
					<p className="pu-body">{this.state.status}</p>
				</div>
			</Modal>
		)
	}
}));


//////////////////////////////////////////
/////// FORGOT PASSWORD MODAL ////////////
//////////////////////////////////////////

export const ForgotPassModal = connect(loginState, loginDispatch)(React.createClass({
	getInitialState: () => ({
		errors: []
	}),
	// componentDidMount() {
	// 	ReactDOM.findDOMNode(this.refs.email).focus();
	// },
	render() {
		return (
			<Modal title="Forgot Password" icon="key">
				<div>
					{this.state.errors.length > 0 &&
						<div className="alert-danger"><ul>{this.state.errors.map((errMsg, i) => <li key={i}>{errMsg}</li>)}</ul></div>
					}
					<form onSubmit={this.submitData} onChange={this.hideError}>
						<RequiredInput type="email" placeholder="Your email" name="email"/>
						<input type="submit" value="Reset password" className="btn-purp"/>
					</form>
				</div>
			</Modal>
		)
	},
	submitData(e) {
		e.preventDefault();
		const { setLoadState, showPopup } = this.props;
		setLoadState(true);
		const formData = new FormData(e.target);
		sendData('/api/reset-password', formData, res => {
			setLoadState(false);
			if (res.error) {
				const err = res.error;
				this.setState({errors: Array.isArray(err) ? err : ['Connection error']});
			} else {
				browserHistory.push(this.props.returnTo);
				showPopup(['Success', 'thumbs-up', res.msg])
			}
		})
	},
	hideError() {
		this.state.errors.length > 0 && this.setState({errors: []});
	}
}));


//////////////////////////////////////////
///////// NEW PASSWORD MODAL /////////////
//////////////////////////////////////////

export const NewPassModal = connect(loginState, loginDispatch)(React.createClass({
	getInitialState: () => ({
		errors: [],
		password: '',
		passwordConfirm: ''
	}),
	render() {
		const { password, passwordConfirm } = this.state;
		return (
			<Modal title="New Password" icon="key">
				<div>
					{this.state.errors.length > 0 &&
						<div className="alert-danger"><ul>{this.state.errors.map((errMsg, i) => <li key={i}>{errMsg}</li>)}</ul></div>
					}
					<form onSubmit={this.submitData} onChange={this.hideError}>
						<RequiredInput type="password"
							onChange={e => this.setState({password: e.target.value})}
							placeholder="New password"
							value={password}/>
						<RequiredInput type="password"
							onChange={e => this.setState({passwordConfirm: e.target.value})}
							placeholder="Confirm password"
							value={passwordConfirm}/>
						<input type="submit" value="Reset password" className="btn-purp"/>
					</form>
				</div>
			</Modal>
		)
	},
	submitData(e) {
		e.preventDefault();
		const { setLoadState, showPopup, location, params, updateAuthToken, updateBookmarks } = this.props;
		const { password, passwordConfirm } = this.state;
		if (password !== passwordConfirm) {
			this.setState({errors: ["Passwords do not match"]});
			return false;
		}
		setLoadState(true);
		const formData = new FormData();
		formData.append('password', password);
		formData.append('email', location.query.email);
		formData.append('reset_token', params.resetToken);
		sendData('/api/update-password', formData, res => {
			setLoadState(false);
			if (res.error) {
				const err = res.error;
				this.setState({errors: Array.isArray(err) ? err : ['Connection error']});
			} else {
				const { auth_token, bookmarks } = res;
				localStorage.auth_token = auth_token;
				updateAuthToken(parseJWT(auth_token));
				updateBookmarks(bookmarks);
				browserHistory.push(this.props.returnTo);
				showPopup(['Success', 'thumbs-up', res.msg])
			}
		})
	},
	hideError() {
		this.state.errors.length > 0 && this.setState({errors: []});
	}
}));


//////////////////////////////////////////
//////////// AUDIO MODAL /////////////////
//////////////////////////////////////////

export const AudioModal = React.createClass({
	render() {
		const { audio, handleChange } = this.props;
		return (
			<div style={{padding: '1em', textAlign: 'center'}}>
				<p>Enter direct audio link in the field below. Erase to clear audio from story.</p>
				<input type="text"
					value={audio}
					placeholder='Enter audio url'
					onChange={handleChange}
					style={{maxWidth: '75%', minWidth: '50%'}}/>
			</div>
		)
	}
});

// input helper component
const RequiredInput = ({...props}) => <input {...props} required />;
