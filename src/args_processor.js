// NodeJS
// Argument processor to check what flags are required

let testing = false;
let logger = true;
let embedder = true;

let switches = [];

// Add arguments to the switches array
for (let i = 2; i < process.argv.length; i++) {
	switches[i - 2] = process.argv[i];
	if (process.argv[i].charAt(0) != '-') {
		console.log(`Unknown argument '${process.argv[i]}', please reference the project README for options.`);
		process.exit(1);
	}
}

switches.forEach(s => {
	for (let i = 0; i < s.length; i++) {
		switch(s.charAt(i)) {
			case 'l':
			  logger = false;
			  break;
			case 'e':
			  embedder = false;
			  break;
			case 't':
			  testing = true;
			  break;
			case '-':
			  break;
			default:
			  console.log(`Unknown switch '${s.charAt(i)}'.`);
			  break;
		}
	}
});

require('./g.js').beginSetUp(testing, logger, embedder);