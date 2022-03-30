// Error Web Response
ReE = function(res, err, code, data = null) {
	if (typeof err == 'object' && typeof err.message != 'undefined')
		err = err.message;

	let send_data = { success: false, message: err };

	// merge the objects
	if (data && typeof data == 'object') send_data = Object.assign(data, send_data);

	if (typeof code !== 'undefined') res.statusCode = code;

	return res.json(send_data);
}

// Success Web Response
ReS = function(res, msg, data, code) {
	let send_data = { success: true, message: msg };

	//merge the objects
	if (typeof data == 'object') send_data = Object.assign(data, send_data);

	if (typeof code !== 'undefined') res.statusCode = code;

	return res.json(send_data);
}

Keyfilter = function (body, filterkey) {
    const filtered = Object.keys(body)
      .filter(key => filterkey.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {});

    return filtered;
}