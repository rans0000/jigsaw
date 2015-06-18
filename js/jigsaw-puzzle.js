//Jigsaw Puzzle (v0.2.0)
var Jigsaw;
(function ($, window, document, undefined) {
	'use strict';
	Jigsaw = {
		options: {
			container: '#jigsaw_container',
			divisions:		3,
			shuffleDepth:	1,
			animDuration:	100
		},
		init: function (option) {
			this.config = $.extend({}, this.options, option);
			this.config.container = $(this.config.container).addClass('jigsaw_container');
			
			this.hammer = new Hammer(this.config.container[0]);

			this.bindCommonEvents();
			this.startGame();
		},
		
		startGame: function () {
			$('.tools_bar').hide();
			this.config.container.empty().attr('data-puzzle-status', 'unsolved');
			this.puzzleBox = [];
			this.currentBox = null;
			this.movesCount = 0;
			
			this.createPuzzleGrid(this.config.divisions);
			this.shuffleBoxes(this.config.shuffleDepth, this.config.divisions);
			this.bindPuzzleEvents();
			this.startTime = new Date();
		},

		createPuzzleGrid: function (numGrid) {
			var x, y, id, element,
				selfed = this,
				percent = (100 / selfed.config.divisions);
			for (y = 0; y < numGrid; ++y) {
				for (x = 0; x < numGrid; ++x) {
					id = ((y * selfed.config.divisions) + x);
					element = $('<div></div>', {
						'class':	'puzzle_box'
						//'text':		id
					}).css({
						'width':	percent + '%',
						'height':	percent + '%',
						'left':		(x * percent) + '%',
						'top':		(y * percent) + '%'
					}).attr('data-puzzle-box', id).appendTo(this.config.container);
					this.puzzleBox.push({
						'id':			id,
						'element':	element,
						'position':	id,
						'left':		(x * percent),
						'top':		(y * percent)
					});
				}
			}
			SplitImage(document.getElementById('puzzle_map').src, this.config.divisions, this.imageToGrid.bind(this));
		},
		
		imageToGrid: function (fragment) {
			fragment = $(fragment);
			var i, len,
				imageBlocks = fragment.children('img'),
				gridBlocks = this.config.container.children('.puzzle_box');
			for (i = 0, len = imageBlocks.length; i < len; ++i) {
				gridBlocks.eq(i).append(imageBlocks.eq(i));
			}
		},

		shuffleBoxes: function (shuffleDepth, numGrid) {
			var randomNo, i, j;
			numGrid *= numGrid;
			shuffleDepth = shuffleDepth || 1;

			for (i = 0; i < shuffleDepth; ++i) {
				for (j = 0; j < numGrid; ++j) {
					randomNo = parseInt(Math.random() * numGrid);
					this.swapBoxes(this.puzzleBox[j], this.puzzleBox[randomNo], true);
				}
			}
		},

		swapBoxes: function (puzzleBox1, puzzleBox2, animateFlag) {
			var tempBox1 = $.extend({}, puzzleBox1),
				tempBox2 = $.extend({}, puzzleBox2);
			puzzleBox1 = $.extend(puzzleBox1, puzzleBox2);
			puzzleBox2 = $.extend(puzzleBox2, tempBox1);

			puzzleBox1.position = tempBox1.position;
			puzzleBox1.left = tempBox1.left;
			puzzleBox1.top = tempBox1.top;
			puzzleBox2.position = tempBox2.position;
			puzzleBox2.left = tempBox2.left;
			puzzleBox2.top = tempBox2.top;

			this.moveBox(puzzleBox1, animateFlag);
			this.moveBox(puzzleBox2, animateFlag);
			//console.log(tempBox1);
		},

		moveBox: function (puzzleBox, animateFlag) {
			//moves the box into the position saved in its object (initial position)
			animateFlag = ~~animateFlag;

			puzzleBox.element.animate(
				{
					left:	puzzleBox.left + '%',
					top:	puzzleBox.top + '%'
				},
				this.config.animDuration * animateFlag,
				function () {
					puzzleBox.element.removeClass('selected swapped swap_candidate').css({'z-index': 1});
				}
			);
		},

		moveBoxToXY: function (puzzleBox, x, y) {
			//moves the box into an (x,y) cordinate
			puzzleBox.element.css({
				left:	x,
				top:	y
			});
		},

		bindPuzzleEvents: function () {
			var selfed = this;

			this.hammer.on('panstart', function (e) {
				selfed.onBoxPanStart(e);
			});

			this.hammer.on('panend', function (e) {
				selfed.onBoxPanEnd(e);
			});
		},
		
		bindCommonEvents: function () {
			var selfed = this;
			$('#btn_restart').on('click', function (e) {
				e.preventDefault();
				selfed.startGame();
			});
		},

		onBoxPanStart: function (e) {
			var id, puzzleBox, i, len,
				puzzleBoxElement = $(e.target),
				selfed = this;

			if (puzzleBoxElement.hasClass('puzzle_box')) {
				id = puzzleBoxElement.data('puzzle-box');

				//get the object for clicked puzzlebox
				for (i = 0, len = this.puzzleBox.length; i < len; ++i) {
					if (this.puzzleBox[i].id === id) {
						puzzleBox = this.puzzleBox[i];
						break;
					}
				}

				//save the values for later use
				this.currentBox = puzzleBox;
				selfed.BoxStartX = puzzleBoxElement.position().left;
				selfed.BoxStartY = puzzleBoxElement.position().top;
				puzzleBox.element.css({'z-index': 2});
				puzzleBox.element.addClass('selected');

				//start moving the grid
				selfed.hammer.on('pan', function (e) {
					selfed.onBoxPan(e, puzzleBox);
				});
			}
		},

		onBoxPan: function (e, puzzleBox) {
			//update the position of selected box with the drag
			this.moveBoxToXY(puzzleBox, (this.BoxStartX + e.deltaX), (this.BoxStartY + e.deltaY));
			//this.getNearestPuzzleBox(puzzleBox);
		},

		onBoxPanEnd: function (e) {
			var nearestPuzzleBox, isPuzzleSolved;
			this.hammer.off('pan');
			//get nearest puzzlebox found, then swap positions else go back to initial position
			nearestPuzzleBox = this.getNearestPuzzleBox(this.currentBox);
			if (nearestPuzzleBox) {
				nearestPuzzleBox.element.addClass('swapped');
				++this.movesCount;
				this.swapBoxes(nearestPuzzleBox, this.currentBox, true);
			} else {
				//go back to initial position
				this.moveBox(this.currentBox, true);
			}
			
			if (this.isPuzzleSolved()) {
				this.endTime = new Date();
				this.declareVictory();
			}
		},

		getNearestPuzzleBox: function (puzzleBox) {
			//finds the nearest puzzlebox from selected box. If nothing is found undefined is returned
			//distance is half the diagonal length of the puzzlebox
			var tempX, tempY, i, len, tempBox, tempDistance,
				distance = (Math.SQRT2 * this.puzzleBox[0].element.width()) / 2, //root2a

				dragX = puzzleBox.element.position().left,
				dragY = puzzleBox.element.position().top;

			for (i = 0, len = this.puzzleBox.length; i < len; ++i) {
				if (puzzleBox.id !== this.puzzleBox[i].id) {
					this.puzzleBox[i].element.removeClass('swap_candidate');
					//console.log('removed :' + this.puzzleBox[i].id)
					tempX = this.puzzleBox[i].element.position().left;
					tempY = this.puzzleBox[i].element.position().top;
					//calc the diagonal distance between both grids
					tempDistance = Math.sqrt(((tempX - dragX) * (tempX - dragX)) + ((tempY - dragY) * (tempY - dragY)));

					//selcet this puzzlebox if calculated distance is less than what is currently saved
					if (tempDistance < distance) {
						distance = tempDistance;
						tempBox = this.puzzleBox[i];
						this.puzzleBox[i].element.addClass('swap_candidate');
						//console.log(this.puzzleBox[i].id + ' ' + distance);
					}
				}

			}
			return tempBox;
		},
		
		isPuzzleSolved: function () {
			var i = 0,
				len = this.puzzleBox.length;
			
			for (i = 0; i < len; ++i) {
				if (this.puzzleBox[i].id !== this.puzzleBox[i].position) {
					break;
				}
			}
			return (i === len);
		},
		
		declareVictory: function () {
			var resultText = '',
				puzzleTime = new Date(this.endTime - this.startTime);
			
			//unbind events
			this.hammer.off('panstart');
			this.hammer.off('panend');
			this.config.container.attr('data-puzzle-status', 'solved');
			
			//display results
			resultText = 'You took ' + this.movesCount + ' moves to comlete the puzzle in ';
			if (puzzleTime.getUTCHours()) {
				resultText += (puzzleTime.getUTCHours() + ' Hours ');
			}
			if (puzzleTime.getUTCMinutes()) {
				resultText += (puzzleTime.getUTCMinutes() + ' Minutes ');
			}
			if (puzzleTime.getUTCSeconds()) {
				resultText += (puzzleTime.getUTCSeconds() + ' Seconds.');
			}
			$('.result_box').empty().append($('<p></p>', {
				'text' : resultText
			}));
			
			$('.tools_bar').show();
		}
	};
})(jQuery, window, document);
