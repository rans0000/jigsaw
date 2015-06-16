function SplitImage(src, partitions, callcack) {
	'use strict';
	var imageMaster = new Image();
	imageMaster.src = src;
	imageMaster.onload = function (e) {
		var x, y, sx, sy, sw, sh, tempCavan, dImage,
			canvas = document.createElement('canvas'),
			context = canvas.getContext('2d'),
			imageWidth = e.target.width,
			imageHeight = e.target.height,
			minDimension = Math.min(imageWidth, imageHeight),
			distance = minDimension / partitions,
			fragment = document.createDocumentFragment();

		canvas.width = minDimension;
		canvas.height = minDimension;
		context.drawImage(imageMaster, 0, 0);

		for (y = 0; y < partitions; ++y) {
			for (x = 0; x < partitions; ++x) {
				sx = x * distance;
				sy = y * distance;
				sw = sx + distance;
				sh = sy + distance;

				tempCavan = document.createElement('canvas');
				tempCavan.width = tempCavan.height = distance;
				tempCavan.getContext('2d').drawImage(imageMaster, sx, sy, sw, sh, 0, 0, sw, sh);
				dImage = new Image();
				dImage.src = tempCavan.toDataURL();
				fragment.appendChild(dImage);
			}
		}
		if (callcack) {
			callcack(fragment);
		}
	};
}