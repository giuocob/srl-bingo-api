var generator_1 = require('./srl-generators/generator-1.0');
var generator_2 = require('./srl-generators/generator-2.0');
var generator_3 = require('./srl-generators/generator-3.0');
var generator_5 = require('./srl-generators/generator-5.0');
var generator_6 = require('./srl-generators/generator-6.0');
var generator_8 = require('./srl-generators/generator-8.0');
var generator_8_2 = require('./srl-generators/generator-8.2');

var goallist_3 = require('./oot-goallists/goal-list-3.0');
var goallist_4 = require('./oot-goallists/goal-list-4.0');
var goallist_5 = require('./oot-goallists/goal-list-5.0');
var goallist_6 = require('./oot-goallists/goal-list-6.0');
var goallist_7_0 = require('./oot-goallists/goal-list-7.0');
var goallist_7_1 = require('./oot-goallists/goal-list-7.1');
var goallist_8_0 = require('./oot-goallists/goal-list-8.0');
var goallist_8_1 = require('./oot-goallists/goal-list-8.1');
var goallist_8_2 = require('./oot-goallists/goal-list-8.2');
var goallist_8_3 = require('./oot-goallists/goal-list-8.3');
var goallist_8_4 = require('./oot-goallists/goal-list-8.4');
var goallist_8_5 = require('./oot-goallists/goal-list-8.5');

var ApiError = require('../lib/error').ApiError;


var currentVersion = exports.currentVersion = 'v8.5';


exports.getCard = function(opts, cb) {
	if(!opts) opts = {};
	var seed = opts.seed || Math.ceil(Math.random()*1000000).toString();
	if(typeof seed == 'number') seed = seed.toString();
	var mode = opts.mode || 'normal';
	var validModes = {'short': true, 'normal': true, 'long': true};
	if(!validModes[mode]) return cb(new ApiError('BAD_REQUEST', 'Unrecognized mode in bingo options'));
	var version = opts.version || currentVersion;

	var standardOpts = {
		seed: seed,
		mode: mode
	};


	var bingoBoard;
	switch(version) {
		case 'v1':
			bingoBoard = generator_1({}, standardOpts);
			break;
		case 'v2':
			bingoBoard = generator_2({}, standardOpts);
			break;
		case 'v3':
			bingoBoard = generator_3(goallist_3, standardOpts);
			break;
		case 'v4':
			bingoBoard = generator_3(goallist_4, standardOpts);
			break;
		case 'v5':
			bingoBoard = generator_5(goallist_5, standardOpts);
			break;
		case 'v6':
			bingoBoard = generator_6(goallist_6, standardOpts);
			break;
		case 'v7':
			bingoBoard = generator_6(goallist_7_0, standardOpts);
			break;
		case 'v7.1':
			bingoBoard = generator_8(goallist_7_1, standardOpts);
			break;
		case 'v8':
			bingoBoard = generator_8(goallist_8_0, standardOpts);
			break;
		case 'v8.1':
			bingoBoard = generator_8(goallist_8_1, standardOpts);
			break;
		case 'v8.2':
			bingoBoard = generator_8_2(goallist_8_2, standardOpts);
			break;
		case 'v8.3':
			bingoBoard = generator_8_2(goallist_8_3, standardOpts);
			break;
		case 'v8.4':
			bingoBoard = generator_8_2(goallist_8_4, standardOpts);
			break;
		case 'v8.5':
			bingoBoard = generator_8_2(goallist_8_5, standardOpts);
			break;
		default:
			return cb(new ApiError('BAD_REQUEST', 'Unrecognized version in bingo options'));
	}
	bingoBoard = bingoBoard.map(function(square) {
		if(!square.id && square.name) square.id = square.name.toLowerCase().split(' ').join('-');
		return square;
	});
	cb(null, {
		seed: seed,
		mode: mode,
		version: version,
		size: 5,
		goals: bingoBoard
	});
};

//Given a card (the output of getCard), determine whether it is blackout friendly
exports.isBlackoutFriendly = function(card, teamSize) {
	if(!teamSize || typeof teamSize != 'number' || teamSize < 1) teamSize = 1;
	//Structure of blackoutSynergy objects:
	//goals: Array of goals with synergy among themselves
	//limit: Maximum number of goals from the set that can coexist on the card. If omitted, it is set to teamSize
	//versions: Versions for which restriction is applicable. If omitted, all versions are considered.

	var restrictions = [
		{
			//Strength upgrades
			goals: ['Goron Bracelet', 'Silver Gauntlets', 'Golden Gauntlets', 'Black Gauntlets', 'Blue Gauntlets', 'Green Gauntlets', 'Bronze Gauntlets']
		}, {
			//Child trade
			goals: ['Keaton Mask', 'Skull Mask', 'Spooky Mask', 'Bunny Hood', 'Mask of Truth']
		}, {
			//Adult trade
			goals: ['Pocket Cucco', 'Cojiro', 'Odd Potion', 'Poacher\'s Saw', 'Broken Goron\'s Sword', 'Prescription', 'Claim Check']
		}, {
			//Hearts
			goals: ['5 Hearts', '6 Hearts', '7 Hearts', '8 Hearts', '9 Hearts', '10 Hearts'],
			limit: 1
		}, {
			//Maps
			goals: ['3 Maps', '4 Maps', '5 Maps', '6 Maps', '7 Maps'],
			limit: 1
		}, {
			//Compasses
			goals: ['3 Compasses', '4 Compasses', '5 Compasses', '6 Compasses', '7 Compasses'],
			limit: 1
		}, {
			//Bomb bags
			goals: ['Bomb Bag (30)', 'Bomb Bag (40)']
		}, {
			//Bullet bags
			goals: ['Bullet Bag (40)', 'Bullet Bag (50)']
		}, {
			//Quivers
			goals: ['Quiver (40)', 'Quiver (50)']
		}, {
			//Beanz
			goals: ['At least 7 Magic Beans', 'At least 9 Magic Beans'],
			limit: 1
		}, {
			//Keys
			goals: ['2 unused keys in Gerudo Training Grounds', '3 unused keys in Gerudo Training Grounds', '4 unused keys in Gerudo Training Grounds',
				'5 unused keys in Gerudo Training Grounds', '6 unused keys in Gerudo Training Grounds', '7 unused keys in Gerudo Training Grounds',
				'8 unused keys in Gerudo Training Grounds', '8 different unused keys in Gerudo Training Grounds'],
			limit: 1
		}, {
			//Sing me the song of my people
			goals: ['At least 3 songs', 'At least 4 songs', 'At least 5 songs', 'At least 6 songs', 'At least 7 songs', 'At least 8 songs', 'At least 9 songs'],
			limit: 1
		}, {
			//Wallet
			goals: ['Adult\'s Wallet', 'Giant\'s Wallet']
		}, {
			//Sets!
			goals: ['3 Swords', '3 Shields', '3 Tunics', '3 Boots', '3 Swords & 3 Shields', '3 Swords & 3 Tunics', '3 Swords & 3 Boots',
				'3 Shields & 3 Tunics', '3 Shields & 3 Boots', '3 Tunics & 3 Boots'],
			limit: 1
		}, {
			//Water skulls
			goals: ['All 5 Skulltulas in Water Temple', 'At least 3 Skulltulas in Water Temple'],
			limit: 1
		}
	];

	var goals = card.goals;
	//First, ensure there are no goal duplicates
	for(var i=0;i<goals.length;i++) {
		var goal1 = goals[i].name;
		for(var k=i+1;k<goals.length;k++) {
			var goal2 = goals[k].name;
			if(goal1 == goal2) {
				return false;
			}
		}
	}

	//Now run restriction checks
	function cardHasGoal(goal) {
		for(var i=0;i<goals.length;i++) {
			if(goals[i].name == goal) return true;
		}
		return false;
	}

	for(i=0; i<restrictions.length; i++) {
		var restriction = restrictions[i];
		if(restriction.versions) {
			if(restriction.versions.indexOf(card.version) == -1) continue;
		}
		if(!restriction.limit) restriction.limit = teamSize;
		var occurrences = 0;
		for(var n=0; n<restriction.goals.length; n++) {
			var currentGoal = restriction.goals[n];
			if(cardHasGoal(currentGoal)) {
				occurrences++;
				if(occurrences > restriction.limit) return false;
			}
		}
	}

	return true;
};
