$('#simple-gallery')
	.popupGallery();

$('#gallery-with-thumbs')
	.popupGallery({
		thumbnails: true
	});

$('#thumbnail-gallery')
	.popupGallery({
		images: $('#thumbnail-gallery').children('a'),
		triggers: 'a',
		thumbnails: true
	});