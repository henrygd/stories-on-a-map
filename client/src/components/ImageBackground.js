import React from 'react';
import { unsplashImage } from '../helpers';

const backgroundImage = unsplashImage();

const ImageBackground = () => {
	const background = `url(${backgroundImage}) center center/cover no-repeat`;
	return (
		<div style={{width: '100vw', height: '100vh', background}}></div>
	)
}

export default ImageBackground;
