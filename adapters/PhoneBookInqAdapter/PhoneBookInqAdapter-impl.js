var zOSConnectHost = 'zserveros.demos.ibm.com';
var zOSConnectPort = 33615;

var username = "IMPOT07";
var passw = "IBM07POT";
// var https = require('https');

var req = "";
var res = "";
var buffer = "";
var cred = username + ':' + passw;
var console = "";

var phonebookService = "BrowseContact";

function inquirePhoneBook(obj) {

	var input = {
		method : 'get',
		returnedContentType : 'json',
		path : '/zosConnect/services/BrowseContact',
		headers : {
			Authorization: "Basic SU1QT1QwNzpJQk0wN1BPVA==",
			Host: "zserveros.demos.ibm.com"
		},
		parameters : {
			IVTNO_INPUT_MSG : 'ssama',
	//		contentType : 'text/xml; charset=utf-8' // hard-coded
			contentType : 'plain' 
		}
	};
    
	return WL.Server.invokeHttp(input);
	
	/*browseServiceCall(req,res,obj.itemRef,
			function(output) {
				if (output !== undefined
						&& output.SERVICE_OUTPUT.IVTNO_OUTPUT_MSG.OUT_MESSAGE === "ENTRY WAS DISPLAYED") {
					// Use the output of the browse service call to render the
					// viewcontact web page
					    res.render('viewcontact', {
						title : 'View Contact (' + req.params.lastname + ')',
						data : output.SERVICE_OUTPUT.IVTNO_OUTPUT_MSG
					});
				} else if (output !== undefined
						&& output.SERVICE_OUTPUT.IVTNO_OUTPUT_MSG.OUT_MESSAGE !== undefined) {
					var message = output.SERVICE_OUTPUT.IVTNO_OUTPUT_MSG.OUT_MESSAGE;
					// Display failed, re-drive managecontact
					res.location("/");
					res.render('managecontact', {
						title : 'IMS Phonebook Contacts',
						message : "Error displaying (" + req.params.lastname
								+ "): " + message
					});
					// } else {
					// //DO NOTHING
				}
			})

	// return WL.Server.invokeHttp(input);*/
}

function handleServiceError(req, res, output, buffer) {
	var message = "";
	var messageCode = "";
	var details = "";
	var status = "";
	var moreInfo = "";
	var response = "";

	if (output !== undefined && output.message !== undefined) {
		messageCode = output.messageCode;
		message = output.message;
		details = output.details;
		status = output.status;
		moreInfo = output.moreInfo;
		response = output.response;
	} else {
		message = buffer;
	}

	res.render('serviceerror', {
		title : 'Error on View Contact (' + req.params.lastname + ')',
		messageCode : messageCode,
		message : message,
		details : details,
		status : status,
		moreInfo : moreInfo,
		response : response
	});
}
function makeZOSConnectCall(req, res, serviceName, serviceInputStr, callback) {
	/*
	 * READ
	 * 
	 * The following are options such as the z/OS Connects host/port, a valid
	 * username/password for z/OS Connect and the type of interaction with z/OS
	 * Connect. IMS RESTful service are invoked with a 'POST' request
	 */
	var optionsPost = {
		hostname : zOSConnectHost,
		port : zOSConnectPort,
		path : '/zosConnect/services/' + serviceName + "?action=invoke",
		method : 'PUT',
		headers : {
			'Authorization' : 'Basic ' + cred.toString('base64'),
			'Content-Type' : 'application/json',
			'Content-Length' : serviceInputStr.length
		},
		rejectUnauthorized : false,
		requestCert : true,
		agent : false
	};

	// console.log("zOS Connect Request"+ optionsPost.path );

	// console.log("JSON Payload:"+ serviceInputStr);
	/*
	 * This is the code necessary to make the IMS RESTful service request and
	 * handle any errors
	 */
	var zconnectRequest = https
			.request(
					optionsPost,
					function(zconnectResponse) {
						var buffer = "";

						if (!zconnectResponse.statusCode.toString().match(
								/^2\d\d$/)) {
							// console.log("STATUS: " +
							// zconnectResponse.statusCode);
							// console.log("HEADERS: " +
							// JSON.stringify(zconnectResponse.headers));
							buffer = "STATUS CODE: "
									+ zconnectResponse.statusCode
									+ ", HEADERS: "
									+ JSON.stringify(zconnectResponse.headers);
							handleServiceError(req, res, undefined, buffer);
						}

						zconnectResponse.on('error', function(e) {
							// console.error('response error: ' + e);
						});

						zconnectResponse.on('data', function(d) {
							buffer += d;
						});

						zconnectResponse
								.on(
										"end",
										function(err) {
											if (err === undefined) {
												// console.log("Raw Output: " +
												// buffer + "\n\n");
												var output;
												try {
													output = JSON.parse(buffer);
												} catch (e) {
													handleServiceError(req,
															res, undefined,
															buffer);
												}
												// console.log(output);
												// Verify output contains
												// expected return data from the
												// service request
												if (output !== undefined
														&& output.SERVICE_OUTPUT !== undefined
														&& (output.SERVICE_OUTPUT.IVTNO_OUTPUT_MSG !== undefined

														)) {
													callback(output);
												} else {
													handleServiceError(req,
															res, output, buffer);
												}
											} else {
												// console.log("err: " + err);
												buffer = err;
												handleServiceError(req, res,
														undefined, buffer);
											}
										});

						return buffer;
					});

	zconnectRequest.on('error', function(e) {
		// console.error('request error: ' + e);
		handleServiceError(req, res, undefined, e);
	});

	/*
	 * This is the line of code that actually triggers the IMS RESTful service
	 * request.
	 */
	zconnectRequest.write(serviceInputStr);

	zconnectRequest.end();
}

/*
 * READ
 * 
 * The following function 'serviceInput' returns a JSON object that represents
 * the required input for the 'phonebook' service.
 * 
 */
function serviceInput(cmd, lastName, firstName, extension, zipCode) {
	var serviceInput = {
		"IVTNO_INPUT_MSG" : {
			"IN_COMMAND" : cmd,
			"IN_LAST_NAME" : lastName
		}
	};

	return JSON.stringify(serviceInput);
}

/*
 * The following functions are used by the client to issue specific 'IN_CMD'
 * commands for IVTNO transactions
 * 
 * valid IN_CMD are (ADD,DISPLAY,UPDATE,DELETE) for All IMS versions
 * 
 */
function addServiceInput(lastName, firstName, extension, zipCode) {
	return serviceInput("ADD", lastName, firstName, extension, zipCode);
}

function updateServiceInput(lastName, firstName, extension, zipCode) {
	return serviceInput("UPDATE", lastName, firstName, extension, zipCode);
}

function browseServiceInput(lastName) {
	return serviceInput("DISPLAY", lastName);
}

function deleteServiceInput(lastName) {
	return serviceInput("DELETE", lastName);
}

/*
 * READ
 * 
 * The module exports section makes the following function calls available to
 * other JavaScript routines. Here we are making the following functions
 * available for the index.js to use as it renders web pages for the Contacts
 * Web Application: - function browseServiceCall(req, res, lastName, callback) -
 * function deleteServiceCall(req, res, lastName, callback) - function
 * addServiceCall(req, res, lastName, firstName, extension, zipCode, callback) -
 * updateServiceCall(req, res, lastName, firstName, extension, zipCode,
 * callback)
 * 
 */
function browseServiceCall(req, res, lastName, callback) {
	var serviceInputStr = browseServiceInput(lastName);
	// console.log("browse string: " + serviceInputStr);
	makeZOSConnectCall(req, res, phonebookService, serviceInputStr, callback);
}

function deleteServiceCall(req, res, lastName, callback) {
	var serviceInputStr = deleteServiceInput(lastName);
	// console.log("delete string: " + serviceInputStr);
	makeZOSConnectCall(req, res, phonebookService, serviceInputStr, callback);
}

function addServiceCall(req, res, lastName, firstName, extension, zipCode,
		callback) {
	var serviceInputStr = addServiceInput(lastName, firstName, extension,
			zipCode);
	// console.log("add string: " + serviceInputStr);
	makeZOSConnectCall(req, res, phonebookService, serviceInputStr, callback);
}

function updateServiceCall(req, res, lastName, firstName, extension, zipCode,
		callback) {
	var serviceInputStr = updateServiceInput(lastName, firstName, extension,
			zipCode);
	// console.log("update string: " + serviceInputStr);
	makeZOSConnectCall(req, res, phonebookService, serviceInputStr, callback);
}
