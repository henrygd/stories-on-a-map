import React from 'react';
import { connect } from 'react-redux';
import { setCustomFont } from '../actions';

import './FontOptions.css';

let fonts = false;

const mapStateToProps = ({customFont}, params) => ({
	customFont
})
const mapDispatchToProps = dispatch => ({
	setCustomFont: fontOption => dispatch(setCustomFont(fontOption))
})

const FontOptions = React.createClass({
	componentWillMount() {
		if (!fonts) {
			const fontURL = "//fonts.googleapis.com/css?family=Bitter|Noto+Sans|Noto+Serif|Lato|Lora|Open+Sans|PT+Serif";
			fonts = ['Josefin Sans'].concat(fontURL.substr(34).replace(/\+/g, ' ').split('|'));
			const link = document.createElement('link');
			link.href = fontURL;
			link.rel = 'stylesheet';
			document.body.appendChild(link);
		}
	},
	render() {
		return (
			<div className="font-modal">
				<div className="fonts">
					{fonts.map((fontFamily, i) =>
						<button key={i} className="font" style={{fontFamily}} onClick={() => this.props.setCustomFont({fontFamily})}>
							{fontFamily}
						</button>
					)}
				</div>
				<div className="font-size">
					<button onClick={() => this.changeSize(-0.05)} title="Decrease font size">
						<i className="fa fa-font"></i>
					</button>
					<button onClick={() => this.changeSize(0.05)} className="plus" title="Increase font size">
						<i className="fa fa-font"></i>
					</button>
					<button onClick={() => this.changeLineHeight(-0.1)} title="Decrease line height">
						<i className="fa fa-bars"></i>
					</button>
					<button onClick={() => this.changeLineHeight(0.1)} className="plus" title="Increase line height">
						<i className="fa fa-bars"></i>
					</button>
				</div>
			</div>
		)
	},

	changeSize(num) {
		const { customFont, setCustomFont } = this.props;
		let { fontSize } = customFont;
		fontSize = Math.min(3, Math.max(0.5, Number(fontSize ? fontSize.replace('em', '') : 1.05) + num)) + 'em';
		setCustomFont({fontSize})
	},

	changeLineHeight(num) {
		const { customFont, setCustomFont } = this.props;
		const lineHeight = Math.min(3, Math.max(.7, (customFont.lineHeight || 1.45) + num));
		setCustomFont({lineHeight});
	}

});

export default connect(mapStateToProps, mapDispatchToProps)(FontOptions);
