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
	var serviceInputStr = browseServiceInput('HITE2');
	var input = {
		method : 'put',
		returnedContentType : 'json',
		path : '/zosConnect/services/'+phonebookService+'?action=invoke',
		headers : {	'Authorization': 'Basic SU1QT1QwNzpJQk0wN1BPVA==',
		},
		body: {
			content : serviceInputStr,
			contentType: 'application/json'
	},
};
	return WL.Server.invokeHttp(input);
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
