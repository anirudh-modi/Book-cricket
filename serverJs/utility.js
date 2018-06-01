var gameSeq = 1;

exports.generateGameIdAndSeq = function()
{
	var date = new Date();

	gameId = `game${date.getFullYear()}${gameSeq}`;

	var obj = {gmid:gameId,seq:gameSeq};

	gameSeq = gameSeq + 1;

	return obj;
};

exports.getRandomWholeNumber = function()
{
	return Math.floor(Math.random() * 200);
};

exports.calculateScore = function (score)
{
	var modulo = score % 10;

	if(modulo>6)
	{
		modulo = modulo - 6;
	}

	return modulo;
};