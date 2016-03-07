const request = require('request');

const urls = [
	'http://taobaofed.org/atom.xml',
	'http://www.w3ctrain.com/atom.xml'
];

urls.forEach(url => {
	request(url, (error, response, body) => {
		if (error) {
			console.error(error);
			return;
		}
		console.log(body);
		
	});
});
