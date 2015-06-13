//Jigsaw Puzzle 0.0.1

function Jigsaw(){
	
	this.init();
}

Jigsaw.prototype.init = function(option){
	console.log(this);
}

Jigsaw.prototype.options = {
	container: 'jigsaw_container',
	divisions: 3
}