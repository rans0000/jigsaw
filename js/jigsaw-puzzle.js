//Jigsaw Puzzle 0.0.1
var Jigsaw;
(function ($, window, document, undefined) {
	'use strict';
	Jigsaw = {
		options: {
			container: '#jigsaw_container',
			divisions: 3
		},
		init: function (option) {
			this.config = $.extend({}, this.options, option);
			this.config.container = $(this.config.container);
			this.config.container.addClass('jigsaw_container');
			console.log(this.config);

			this.createPuzzleGrid(this.config.divisions);
		},
		createPuzzleGrid: function (numGrid) {
			var selfed = this, i, j, element;
			for (i = 0; i < numGrid; ++i) {
				for (j = 0; j < numGrid; ++j) {
					element = $('<div></div>', {
						'class' : 'puzzle_box'
					}).css({
						'width': (100 / selfed.config.divisions),
						'height': (100 / selfed.config.divisions)
					}).appendTo(this.config.container);
					
					console.log(element);
				}
			}
		}
	};
})(jQuery, window, document);
