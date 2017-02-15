import React from 'react';
import { browserHistory } from 'react-router';
import { loadMap, setTitle } from '../helpers';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import { setLoadState } from '../actions';

import './Map.css';
import svgBookIcon from '../img/book_icon.svg';


let mapCallback, landingMapObj, newStoryMapObj;

//////// MAIN LANDING MAP ////////
window.initLandingMap = () => {
	landingMapObj = new window.google.maps.Map(document.getElementById('landing_map'), {
		center: {lat: 39, lng: -95},
		zoom: 4,
		minZoom: 1,
		mapTypeId: window.google.maps.MapTypeId.TERRAIN,
		disableDefaultUI: true,
		zoomControl: true,
		zoomControlOptions: {
			position: window.google.maps.ControlPosition.LEFT_CENTER
		}
	});
	setTimeout(mapCallback, 800);
}

//////// NEW STORY MAP ////////
window.initNewStoryMap = () => {
	newStoryMapObj = new window.google.maps.Map(document.getElementById('new_story_map'), {
		center: { lat: 39, lng: -95},
		zoom: 3,
		minZoom: 1,
		mapTypeId: window.google.maps.MapTypeId.TERRAIN,
		disableDefaultUI: true,
		zoomControl: true,
		zoomControlOptions: {
			position: window.google.maps.ControlPosition.LEFT_CENTER
		}
	});
	setTimeout(mapCallback, 800);
}

const mapStateToProps = ({ stories }, params) => ({
	stories
});
const mapDispatchToProps = dispatch => ({
	setLoadState: bool => dispatch(setLoadState(bool))
})

export const HomeMap = connect(mapStateToProps, mapDispatchToProps)(React.createClass({
	componentWillMount() {
		this.props.setLoadState(true);
		mapCallback = this.addMarkers;
	},
	componentDidMount() {
		loadMap('Landing');
	},
	render() {
		return (
			<DocumentTitle title={setTitle()}>
				<div className="map-container" id="landing_map"></div>
			</DocumentTitle>
		)
	},
	addMarkers() {
		const googleMaps = window.google.maps;
		const isIE = !!(['MSIE ', 'Trident/', 'Edge/'].filter(
			str => window.navigator.userAgent.indexOf(str) > -1
		).length);
		const icon = {
			url: isIE ? '/img/icon128.png' : svgBookIcon,
			scaledSize: new googleMaps.Size(45, 45),
			origin: new googleMaps.Point(0, 0),
			anchor: new googleMaps.Point(22.5, 22.5)
		};
		this.props.stories.forEach(([id, author, title, munged_title, coords]) => {
			const splitCoords = coords.split(', ');
			const marker = new googleMaps.Marker({
				position: new googleMaps.LatLng(splitCoords[0], splitCoords[1]),
				map: landingMapObj,
				title: `Click to read "${title}"`,
				munged_title,
				icon
			});

      var infowindow = new googleMaps.InfoWindow({
        content: `<div><h3>${title}</h3>${author}</div>`
      });
			// click listener to navigate to story
			googleMaps.event.addListener(marker, 'click', function() {
				browserHistory.push(`/stories/${this.munged_title}`);
			});
			// mouseover listener to show infowindow
			googleMaps.event.addListener(marker, 'mouseover', function() {
				infowindow.open(landingMapObj, marker);
			});
			googleMaps.event.addListener(marker, 'mouseout', function() {
				infowindow.close();
			});
		})
		this.props.setLoadState(false);
	 },
}));


//////////// NEW STORY MAP ////////////////

export const NewStoryMap = connect(null, mapDispatchToProps)(React.createClass({
	componentWillMount() {
		mapCallback = this.initialize;
	},
	componentDidMount() {
		loadMap('NewStory');
	},
	componentDidUpdate() {
		this.setMarker(this.props.coords);
	},
	render() {
		return (
			<div id="new_story_map"></div>
		)
	},
	initialize() {
		const { storeCoords } = this.props;
		const googleMaps = window.google.maps;
		const mapEl = document.getElementById('new_story_map');
		this.newStoryMarker = new googleMaps.Marker({
			position: new googleMaps.LatLng(39,-95),
			draggable: true,
			map: newStoryMapObj,
			icon: {url: svgBookIcon,
				scaledSize: new googleMaps.Size(45, 45),
				origin: new googleMaps.Point(0, 0),
				anchor: new googleMaps.Point(22.5, 22.5)}
		});

		googleMaps.event.addListener(this.newStoryMarker, 'dragend', function(e) {
			storeCoords(`${e.latLng.lat().toFixed(6)}, ${e.latLng.lng().toFixed(6)}`);
		});
		// fade out drag message
		[['fade', 800], ['hide', 1800]].forEach(([action, time]) => {
			setTimeout(() => mapEl.className = `${action}-msg`, time);
		});
		this.props.setLoadState(false);
	 },

	 // SET MARKER FROM LOADED DATA
	setMarker(coords) {
		const splitCoords = coords.split(', ');
		const newCoords = new window.google.maps.LatLng(splitCoords[0], splitCoords[1]);
		this.newStoryMarker.setPosition(newCoords);
		newStoryMapObj.panTo(newCoords);
	}
}));
