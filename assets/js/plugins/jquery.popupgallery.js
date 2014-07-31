(function($){

	//	Only set up the core if it doesn't already exist
	if( !$core ){

		var $core = {
			win: $(window),
			doc: $(document),
			body: $('body')
		};

	}

	var popupGalleryHtml = '<div id="popup-gallery" class="popup-gallery">'
					+ '<div class="pg-image-container">'
						+ '<div class="pg-image"></div>'
						+ '<span class="pg-close"></span>'
					+ '</div>'
					+ '<nav>'
						+ '<span class="pg-thumbnail-arrow-left"></span>'
						+ '<ul></ul>'
						+ '<span class="pg-thumbnail-arrow-right"></span>'
					+ '</nav>'
					+ '<span class="pg-arrow-right"></span>'
					+ '<span class="pg-arrow-left"></span>'
					+ '<span class="pg-loading"></span>'
					+ '<span class="pg-overlay"></span>'
				+ '</div>';

	$(popupGalleryHtml).appendTo('body');

	var $g = $('#popup-gallery');

	$g = {
		root: $g,
		image: {
			root: $g.find('.pg-image'),
			container: $g.children('.pg-image-container')
		},
		thumbnails: {
			root: $g.children('nav'),
			thumbs: $g.find('ul'),
			arrows: $g.children('nav').find('span'),
			arrow: {
				right: $g.find('.pg-thumbnail-arrow-right'),
				left: $g.find('.pg-thumbnail-arrow-left')
			}
		},
		close: $g.find('.pg-close'),
		loading: $g.children('.pg-loading'),
		overlay: $g.children('.pg-overlay'),
		arrows: $g.children('span[class^="pg-arrow-"]')
	}

	var g = {
		busy: false,
		resize: false,
		open: false,
		current: 0,
		set: [],
		transitions: $.support.transition
	};

	var defaults = {
		images: null,
		path: '',
		triggers: false,
		keyimage: 0,
		thumbnails: false,
		thumbnailProcess: false,
		beforeOpen: function(){},
		afterOpen: function(){},
		beforeChange: function(){},
		duringChange: function(){},
		afterChange: function(){},
		beforeClose: function(){},
		afterClose: function(){},
		getSrc: false
	};

	var getMargin = function($this){

		return ( 0 - Math.round( $this.outerHeight() / 2 ) ) + 'px 0 0 ' + ( 0 - Math.round( $this.outerWidth() / 2 ) ) + 'px';

	};

	var methods = {
		init: function(settings){

			var $this = $(this),
				id = g.current;

			var options = $.extend({}, defaults, settings, $this.data());

			//	If images are in a string, it's a CSV, so split them into an array
			if( typeof options.images == 'string' ){

				options.images = options.images.split(',');

			}else{

				options.images
					.each(function(i){

						$(this).data('pgID', i);

					});

			}

			options.total = options.images.length;
			options.current = options.keyimage;

			g.set[ g.current ] = options;

			$this.on('click', options.triggers, function(e){

				var $trigger = $(this);

				$this.popupGallery('show', {
					id: id,
					ready: function(){

						//	If the trigger has an ID, then we are dealing with an array of links
						$.popupGallery('goto', $trigger.data('pgID'));

					}
				});

				e.preventDefault();

			});

			g.current++;

		},
		show: function(options) {

			g.current = options.id;

			g.set[g.current].beforeOpen();

			if( g.set[g.current].thumbnails )
				$.popupGallery('initThumbs');

			$g.root
				.css({
					display: 'block',
					opacity: 0
				})
				.transition({
					opacity: 1
				}, 300, 'easeInOutCubic', function(){

					//	Internal callback
					options.ready();

					//	Custom callback
					g.set[g.current].afterOpen();

				});

			$core.doc.on('keydown.popup-gallery', function(e){

				if( ( e.keyCode == 37 || e.keyCode == 39 ) && !g.busy ){

					$.popupGallery('goto', e.keyCode == 37 ? 'prev' : 'next');

					e.preventDefault();

				}

				if( e.keyCode == 27 && !g.busy ){

					$.popupGallery('hide');

					e.preventDefault();

				}

			});

			$core.win.on('resize.popup-gallery', function(){

				if( !g.resize ){

					$g.image.container
						.css({
							opacity: 0
						});

				}

				clearTimeout(g.resize);

				g.resize = setTimeout(function(){

					g.resize = false;

					$.popupGallery('positionImage');

					$.popupGallery('positionThumbs');

				}, 200);

			});

		},
		hide: function() {

			g.set[g.current].beforeClose();

			$g.image.container
				.transition({
					scale: .8,
					opacity: 0
				});

			$g.root.transition({
				opacity: 0
			}, 300, 'easeInOutCubic', function(){

				$g.root.css({
					display: 'none'
				});

				$g.image.root.empty();

				$g.thumbnails.root
					.hide();

				$g.thumbnails.thumbs
					.empty();

				g.set[g.current].afterClose($g);

			});

			g.open = false;

			$core.doc.off('keydown.popup-gallery');
			$core.win.off('resize.popup-gallery');

		},
		goto: function(action) {

			if( !g.busy ){

				g.busy = true;

				if( typeof action == 'string' ){

					g.set[g.current].current = action == 'prev' ? g.set[g.current].current - 1 : g.set[g.current].current + 1;

					if( g.set[g.current].current > g.set[g.current].total - 1 )
						g.set[g.current].current = 0;

					if( g.set[g.current].current < 0 )
						g.set[g.current].current = g.set[g.current].total - 1;

				}else{

					g.set[g.current].current = action != undefined ? action : g.set[g.current].current;

				}

				// If the gallery ever encounters a failing image, it removes it, this makes sure we don't try again
				if( g.set[g.current].images[g.set[g.current].current] === false ){

					g.busy = false;
					$.popupGallery('goto', 'next');

				}else{

					g.set[g.current].beforeChange(g.set[g.current], $g);

					if( g.open ){

						$g.image.container.transition({
							scale:		.8,
							opacity:	0
						}, 300, 'easeOutCubic', function(){

							$.popupGallery('insertNewImage');

						});

					}else{

						g.open = true;

						$.popupGallery('insertNewImage');

					}

					if( g.set[g.current].thumbnails ){

						$g.thumbnails.thumbs
							.find('li:eq(' + g.set[g.current].current + ')')
							.addClass('current')
							.siblings('.current')
							.removeClass('current');

					}

				}

			}

		},
		insertNewImage: function(){

			//	During change
			g.set[g.current].duringChange(g.set[g.current], $g);

			$g.image.container
				.css({
					top: 0,
					left: 0,
					scale: 1
				});

			if( g.set[g.current].getSrc ){

				var src = g.set[g.current].getSrc( $(g.set[g.current].images[g.set[g.current].current]) );

			}else if( g.set[g.current].path ){

				var src = g.set[g.current].path + g.set[g.current].images[g.set[g.current].current];

			}else{

				var src = $(g.set[g.current].images[g.set[g.current].current]).attr('href');

			}

			var $img = $('<img src="' + src + '" alt="Gallery image">')
				.preload({
					timeout: false,
					ready: function(){

						//	Insert the photo
						$g.image.root
							.empty()
							.append( $img );

						$.popupGallery('positionImage', function(){

							g.busy = false;

							g.set[g.current].afterChange(g.set[g.current], $g);

						});

					},
					error: function(){

						g.set[ g.current ].images[ g.set[ g.current ].current ] = false;

						$g.thumbnails.thumbs
							.find('li:eq(' + g.set[ g.current ].current + ')')
							.hide();

						$.popupGallery('positionThumbs');

						g.busy = false;

						$.popupGallery('goto', 'next');

					},
					src: src
				});

		},
		positionImage: function(done){

			var $img = $g.image.root.children('img');

			$img.removeAttr('style');

			$g.image.container
				.removeAttr('style')
				.css({
					opacity: 0
				});

			var maxWidth = Math.round( $core.win.width / 100 ) * 76,
				maxHeight = Math.round( ( $core.win.height - ( g.set[g.current].thumbnails ? $g.thumbnails.root.outerHeight() : 0 ) ) / 100 ) * 70,
				imgWidth = $img.width(),
				imgHeight = $img.height();

			if( imgWidth > maxWidth || imgHeight > maxHeight ){

				$img
					.css({
						width: maxWidth
					});

				imgHeight = $img.height();

				if( imgHeight > maxHeight ){

					$img
						.css({
							width: 'auto',
							height: maxHeight
						});

				}

			}

			imgWidth = $img.width();
			imgHeight = $img.height();

			$g.image.container
				.css({
					position: 'absolute',
					top: g.set[g.current].thumbnails ? '46.5%' : '49%',
					left: '50%',
					scale: .8,
					margin: getMargin($g.image.container)
				})
				.transition({
					opacity: 1,
					scale: 1
				}, 300, 'easeOutCubic', function(){

					if( done )
						done.apply();

				});

		},
		initThumbs: function(){

			var html = '';

			var buildThumb = function(src){

				if( g.set[g.current].thumbnailProcess )
					src = g.set[g.current].thumbnailProcess.replace('{path}', src);

				if( !src || src == undefined ){
					html = html + '<li style="display: none">404</li>';
				}else{
					html = html + '<li style="background-image: url(' + src + ')"></li>';
				}

			};

			if( $.isArray(g.set[g.current].images) ){

				for( image in g.set[g.current].images ){

					buildThumb( g.set[g.current].path + g.set[g.current].images[image] )

				}

			}else{

				$.each(g.set[g.current].images, function(){

					buildThumb( $(this).data('thumbnail') );

				});

			}

			$g.thumbnails.root
				.show();

			$g.thumbnails.thumbs
				.html(html);

			$.popupGallery('positionThumbs');

		},
		positionThumbs: function(){

			$g.thumbnails.thumbs
				.removeAttr('style');

			$g.thumbnails.arrows
				.removeClass('active')
				.addClass('disabled');

			//	Give everything a split second to render
			setTimeout(function(){

				var thumbWidth = $g.thumbnails.thumbs.outerWidth(true);

				if( $core.win.width() > thumbWidth ){

					$g.thumbnails.thumbs
						.css({
							left: '50%',
							marginLeft: 0 - Math.round( thumbWidth / 2 )
						});

				}else{

					$g.thumbnails.arrows
						.removeClass('disabled');

					$g.thumbnails.arrow.right
						.addClass('active');

				}

			}, 100);

		}
	};

	$g.arrows
		.on('click', function(e){

			$.popupGallery('goto', $(this).is('.pg-arrow-left') ? 'prev' : 'next');

			e.preventDefault();

		});

	$g.thumbnails.thumbs
		.on('click', 'li', function(e){

			var $thumb = $(this);

			$.popupGallery('goto', $thumb.index());

			e.preventDefault();

		});

	$g.thumbnails.arrows
		.on('click', function(e){

			var $arrow = $(this),
				left = $arrow.is('.pg-thumbnail-arrow-left');

			if( !g.busy && $arrow.is('.active') ){

				g.busy = true;

				var winWidth = $core.win.width(),
					navWidth = $g.thumbnails.thumbs.outerWidth(),
					currentX = $g.thumbnails.thumbs.offset().left,
					newX = currentX + ( left ? winWidth / 2 : 0 - ( winWidth / 2 ) ),
					max = 0 - ( navWidth - winWidth );

				newX = newX < max ? max : newX;
				newX = newX > 0 ? 0 : newX;

				if( g.transitions ){

					$g.thumbnails.thumbs
						.transition({
							x:	newX
						}, 300, 'easeInOutCubic', function(){

							g.busy = false;

						});

				}else{

					$g.thumbnails.thumbs
						.transition({
							left:	newX
						}, 300, 'easeInOutCubic', function(){

							g.busy = false;

						});

				}

				$g.thumbnails.arrow.right
					.toggleClass('active', newX > max);

				$g.thumbnails.arrow.left
					.toggleClass('active', newX < 0 );

			}

			e.preventDefault();

		});

	$g.close
		.on('click', function(e){

			$.popupGallery('hide');

			e.preventDefault();

		});

	$g.overlay
		.on('click', function(e){

			$.popupGallery('hide');

			e.preventDefault();

		});

	$.popupGallery = function(methodOrOptions){

		if( methods[methodOrOptions] ){

			return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));

		} else {

			$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.popupGallery' );

		}

	};

	$.fn.popupGallery = function(methodOrOptions){

		if( methods[methodOrOptions] ){

			return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));

		}else if( typeof methodOrOptions === 'object' || ! methodOrOptions ){

			var originalArguements = arguments;

			// Default to "init"
			this.each(function(){

				return methods.init.apply( this, originalArguements );

			});

		} else {

			$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.popupGallery' );

		}

		return this;

	};

})(jQuery);