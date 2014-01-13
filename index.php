<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Gallery</title>
	<link href="/assets/css/site.css" rel="stylesheet">
</head>
<body>

	<span id="simple-gallery" data-images="one.jpg,two.jpg,three.png,four.png,five.jpg" data-path="/assets/img/gallery/">Simple gallery</span>

	<span id="gallery-with-thumbs" data-images="one.jpg,two.jpg,three.png,four.png,five.jpg" data-path="/assets/img/gallery/">Gallery with thumbnails</span>

	<div id="thumbnail-gallery">
		<a href="/assets/img/gallery/one.jpg"><img src="/assets/img/gallery/one.jpg" width="100"></a>
		<a href="/assets/img/gallery/two.jpg"><img src="/assets/img/gallery/two.jpg" width="100"></a>
		<a href="/assets/img/gallery/three.png"><img src="/assets/img/gallery/three.png" width="100"></a>
		<a href="/assets/img/gallery/four.png"><img src="/assets/img/gallery/four.png" width="100"></a>
		<a href="/assets/img/gallery/five.jpg"><img src="/assets/img/gallery/five.jpg" width="100"></a>
	</div>

	<script src="/assets/js/libs/jquery-1.10.2.min.js"></script>
	<script src="/assets/js/plugins/jquery.transit.js"></script>
	<script src="/assets/js/plugins/jquery.preload.js"></script>
	<script src="/assets/js/plugins/jquery.popupgallery.js"></script>
	<script src="/assets/js/site.js"></script>

</body>
</html>