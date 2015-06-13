//Jigsaw Puzzle 0.0.1
var Jigsaw;
(function ($, window, document, undefined) {
	'use strict';
	Jigsaw = {
		options: {
			container: '#jigsaw_container',
			divisions: 3,
			shuffleDepth: 1
		},
		init: function (option) {
			this.config = $.extend({}, this.options, option);
			this.config.container = $(this.config.container);
			this.config.container.addClass('jigsaw_container');
			this.puzzle_box = [];

			this.createPuzzleGrid(this.config.divisions);
			this.shuffleBoxes(this.config.shuffleDepth, this.config.divisions);
			this.bindEvents();
			//console.log(this.puzzle_box);
		},
		createPuzzleGrid: function (numGrid) {
			var x, y, element, id,
				selfed = this,
				percent = (100 / selfed.config.divisions);
			for (y = 0; y < numGrid; ++y) {
				for (x = 0; x < numGrid; ++x) {
					id = ((y * selfed.config.divisions) + x);
					element = $('<div></div>', {
						'class':	'puzzle_box',
						'text':		id
					}).css({
						'width':	percent + '%',
						'height':	percent + '%',
						'left':		(x * percent) + '%',
						'top':		(y * percent) + '%'
					}).attr('data-puzzle-box', id).appendTo(this.config.container);
					this.puzzle_box.push({
						'id':			id,
						'element':	element,
						'position':	id,
						'left':		(x * percent),
						'top':		(y * percent)
					});
					//console.log(element);
				}
			}
		},

		shuffleBoxes: function (shuffleDepth, numGrid) {
			var randomNo, i, j;
			numGrid *= numGrid;
			shuffleDepth = shuffleDepth || 1;

			for (i = 0; i < shuffleDepth; ++i) {
				for (j = 0; j < numGrid; ++j) {
					randomNo = parseInt(Math.random() * numGrid);
					this.swapBoxes(this.puzzle_box[j], this.puzzle_box[randomNo]);
				}
			}
		},

		swapBoxes: function (puzzle_box1, puzzle_box2) {
			var tempBox1 = $.extend({}, puzzle_box1),
				tempBox2 = $.extend({}, puzzle_box2);
			puzzle_box1 = $.extend(puzzle_box1, puzzle_box2);
			puzzle_box2 = $.extend(puzzle_box2, tempBox1);

			puzzle_box1.position = tempBox1.position;
			puzzle_box1.left = tempBox1.left;
			puzzle_box1.top = tempBox1.top;
			puzzle_box2.position = tempBox2.position;
			puzzle_box2.left = tempBox2.left;
			puzzle_box2.top = tempBox2.top;

			this.moveBox(puzzle_box1);
			this.moveBox(puzzle_box2);
			//console.log(tempBox1);
		},

		moveBox: function (puzzle_box) {
			puzzle_box.element.css({
				left:	puzzle_box.left + '%',
				top:	puzzle_box.top + '%'
			});
		},

		bindEvents: function () {
			var selfed = this;
			this.config.container.on('click', '.puzzle_box', function (e) {
				e.preventDefault();
				selfed.onBoxClick($(this));
			});
		},

		onBoxClick: function (puzzle_box) {
			var id = puzzle_box.data('puzzle-box');
			//console.log(id);
		}
	};
})(jQuery, window, document);
