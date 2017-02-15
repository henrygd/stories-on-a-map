import React from 'react';
import { connect } from 'react-redux';
import { setReturnTo } from '../actions';
import TransitionGroup from 'react-addons-css-transition-group';

import Navbar from './Navbar';
import { Popup } from './Modals';

import './App.css';

const mapStateToProps = ({ popupContent, pageLoading }, params) => ({
  popupContent,
  pageLoading
});

const mapDispatchToProps = dispatch => ({
  setReturnTo: pathname => dispatch(setReturnTo(pathname))
})

const App = React.createClass({
  // keep track of previously rendered components to manage modal state
  renderedComponents: {},

  closeStory() {
    this.renderedComponents.story = null;
  },

  componentWillReceiveProps(nextProps) {
    // close story if going back to root
    if (!nextProps.modal && !nextProps.story && this.props.story) {
      this.closeStory();
    }
    // if we open modal or story (login, signup, etc) store previous children / pathname
    if (nextProps.modal || nextProps.story) {
      if (!this.props.modal && !this.props.story) {
        this.renderedComponents.root = this.props.children;
        // console.log('root props', this.props);
        this.props.setReturnTo(this.props.location.pathname);
      }

      if (nextProps.modal) {
        // requesting modal over story
        if (this.props.story) {
          this.renderedComponents.story = this.props.story
          this.props.setReturnTo(this.props.location.pathname);
          // modal over root
        } else if (!this.props.modal) {
          this.closeStory()
        }
        // requesting story
      }
    }
  },
  render() {
    // console.log('rendering app');
    const { pageLoading, modal, popupContent } = this.props
    const story = this.props.story || this.renderedComponents.story
    return (
      <div className='app' style={{cursor: pageLoading ? 'wait' : ''}}>
        <Navbar />

        <TransitionGroup
          transitionName="opacity"
          transitionEnterTimeout={200}
          transitionLeaveTimeout={300}>
          {pageLoading && <div className="loading-indicator"></div>}
        </TransitionGroup>

        { // if modal or story render stored root (background) el, otherwise render children normally
          (modal || story) ? (this.renderedComponents.root || this.props.root) : this.props.children
        }

        <TransitionGroup
          transitionName="opacity"
          transitionEnterTimeout={100}
          transitionLeaveTimeout={700}>
          {story && story}
        </TransitionGroup>

        <TransitionGroup
          transitionName="modal"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={350}>
          {modal && modal}
          {popupContent && <Popup contentArr={popupContent} />}
        </TransitionGroup>
      </div>
    );
  }

});

export default connect(mapStateToProps, mapDispatchToProps)(App);
