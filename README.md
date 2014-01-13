# Popup Gallery
============

A simple, modern gallery plugin that works on mobile and has thumbnail support.

### Dependancies

##### Javascript
 * jquery.preload.js (included)
 * jquery.transit.js (included)

##### SCSS
All of these are included in our front-end baseplate
 * Easing variables
 * Mixins
 * Extenders
 * Normalise

### Basic usage

```
$('#single-link-gallery').popupGallery();
```

### Options

All of these options can be set using data tags. e.g: data-images="/path/image-1.jpg,/path/image-2.png".

* **images:** Either an array containing image file names (with an optional path) or a jQuery object containing links to images.
* **path:** A path to the folder containing all the images - Default false.
* **triggers:** The elements that can be clicked that will open this instance of the gallery - Default false.
* **keyimage:** The cover image that will open first - Defalt 0.
* **thumbnails:** Option to display a selection of thumbnails for the images - Default false.
* **thumbnailProcess:** For pre-processing thumbnails with a script - Default false.