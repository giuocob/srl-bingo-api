var seedRandom = require('../../lib/random-seeded');

module.exports = function(bingoList, opts) {
  if(!opts) opts = {};
  var LANG = opts.lang || 'name';
  var SEED = opts.seed || Math.ceil(999999 * Math.random()).toString();
  var rng = seedRandom.getRNG(SEED);
  var MODE = opts.mode || 'normal';

	//The original item list!
	//Link: http://zeldaspeedrun.dreamhosters.com/junk/zsrbingo_old.jpg

	var staticList = [
		['Silver Gauntlets', 'Ice Arrow', 'Lon Lon Milk', 'Fairy Bow', 'Mask of Truth', 'Blue Fire', 'Nayru\'s Love'],
		['Goron Ruby', 'Bottled Big Poe', 'Stone of Agony', 'Farore\'s Wind', 'Goron Bracelet', 'Water Medallion', 'Fire Arrow'],
		['Quiver (50)', 'Silver Scale', 'Fire Medallion', 'Light Arrow', 'Red Potion', 'Mirror Shield', 'Iron Boots'],
		['Claim Check', 'Zora Tunic', 'Blue Potion', 'Forest Medallion', 'Zora Sapphire', 'Nocturne of Shadow', 'Gerudo Card'],
		['Lens of Truth', 'Kokiri Emerald', 'Golden Gauntlets', 'Boomerang', 'Din\'s Fire', 'Adult Wallet', 'Hover Boots'],
		['At least 1 Magic Bean', 'Green Potion', 'Goron Tunic', 'Spirit Medallion', 'Longshot', 'Fairy Slingshot', 'Bomb Bag (40)'],
		['Serenade of Water', 'Ocarina of Time', 'Minuet of Forest', 'Megaton Hammer', 'Bolero of Fire', 'Shadow Medallion', 'Giant\'s Wallet']
	];

	var offset1 = Math.floor(rng.random() * 3);
	var offset2 = Math.floor(rng.random() * 3);

	var bingoBoard = [];
	for(var m=0;m<=4;m++) {
		for(var n=0;n<=4;n++) {
			var currentSquare = 5*m + n + 1;
			bingoBoard[currentSquare] = {'name': staticList[m+offset1][n+offset2]};
		}
	}
	bingoBoard.shift();
	return bingoBoard;

};
