
/* JavaScript content from js/main.js in folder common */
var catalogResults;  // global variable to hold the catalog results from CICS
var currentItemIndex;     // a temporary variable to hold the itemIndex of the item currently being viewed

function wlCommonInit(){
	require([ "layers/core-web-layer", "layers/mobile-ui-layer" ], dojoInit);

	/*
	 * Application is started in offline mode as defined by a connectOnStartup property in initOptions.js file.
	 * In order to begin communicating with Worklight Server you need to either:
	 * 
	 * 1. Change connectOnStartup property in initOptions.js to true. 
	 *    This will make Worklight framework automatically attempt to connect to Worklight Server as a part of application start-up.
	 *    Keep in mind - this may increase application start-up time.
	 *    
	 * 2. Use WL.Client.connect() API once connectivity to a Worklight Server is required. 
	 *    This API needs to be called only once, before any other WL.Client methods that communicate with the Worklight Server.
	 *    Don't forget to specify and implement onSuccess and onFailure callback functions for WL.Client.connect(), e.g:
	 *    
	 *    WL.Client.connect({
	 *    		onSuccess: onConnectSuccess,
	 *    		onFailure: onConnectFailure
	 *    });
	 *     
	 */
	
	// Common initialization code goes here

}

// This is the default generated dojoInit() function
/*function dojoInit() {
	require([ "dojo/ready", "dojo/parser", "dojox/mobile", "dojo/dom", "dijit/registry", "dojox/mobile/ScrollableView", "dojox/mobile/Heading", "dojox/mobile/ListItem", "dojox/mobile/EdgeToEdgeList" ], function(ready) {
		ready(function() {
		});
	});
}
*/

//This is the implemented version provided for this lab
function dojoInit() {

	require([ "dojo", "dojo/dom", "dijit/registry", "dojo/parser", "dojo/dom-style", "dojo/on", "dojox/mobile/ScrollableView", "dojox/mobile", "dojox/mobile/compat", "dojox/mobile/deviceTheme", "dojox/mobile/Heading", "dojox/mobile/Button", "dojox/mobile/ToolBarButton", "dojox/mobile/View", "dojox/mobile/RoundRectList", "dojox/mobile/ListItem", "dojox/mobile/EdgeToEdgeList", "dojox/mobile/TextBox" ],
			function(dojo, dom, registry, parser, domStyle, on) {
				dojo.ready(function() {
				});
				
				// This function populates the BrowseList view with the catalog items
				showCatalog = function() {
					
					htmlString = "";  // Make a blank string to hold 
					
					// Iterate over the catalogResults to generate a ListItem for each item entry on the BrowseList view
				//	for(var i = 0; i < catalogResults.length; i++)
							
					//		htmlString += '<div data-dojo-type="dojox.mobile.ListItem">' + 'FIRST NAME :' + catalogResults.OUT_FIRST_NAME + '</div>';
					//		htmlString += '<div data-dojo-type="dojox.mobile.ListItem">' + 'LAST NAME  :' + catalogResults.OUT_LAST_NAME + '</div>';
					//		htmlString += '<div data-dojo-type="dojox.mobile.ListItem">' + 'EXTENSION  :' + catalogResults.OUT_EXTENSION + '</div>';
					//		htmlString += '<div data-dojo-type="dojox.mobile.ListItem">' + 'ZIP CODE   :' + catalogResults.OUT_ZIP_CODE + '</div>';
							
							registry.byId("fn").set("value",catalogResults.OUT_FIRST_NAME);
							registry.byId("ln").set("value",catalogResults.OUT_LAST_NAME);
							registry.byId("ext").set("value",catalogResults.OUT_EXTENSION);
							registry.byId("zip").set("value",catalogResults.OUT_ZIP_CODE);
							
					registry.byId("phonebookList").destroyDescendants();  // Delete the old catalog data
					
					// Set the viewable catalogList to use the new list of items
					alert('html'+catalogResults.length);
					var listView = dom.byId("phonebookList");
					listView.innerHTML = htmlString;
					parser.parse(listView);
					
				};
				
				
			});
}


//This function drives the invocation of the BrowseListAdapter to send a request to the CICS backend
//and get back the catalog data, which we store for here for later use 
function inquirePhoneBook(){

var inquireObject = {};  // Create an object to hold the data for the catalog request

inquireObject.itemRef = 'sama';    // Start from item # 0000
	
console.log('inside invoke');
var invocationData = {
		adapter: "PhoneBookInqAdapter",
		procedure: "inquirePhoneBook",
		parameters: [inquireObject]
};
//alert('result-sree1' + invocationData);
console.log('inquirePhoneBook:invocationData: '+JSON.stringify(invocationData));
WL.Client.invokeProcedure(invocationData, {
	onSuccess : function (result) {
		console.log('results-sree1' + result);
		 WL.Logger.debug("Retrieve success" +  JSON.stringify(result));
		alert('result-sree2' + JSON.stringify(result));
		catalogResults =result.invocationResult.SERVICE_OUTPUT.IVTNO_OUTPUT_MSG;
		alert('statuscode'+JSON.stringify(catalogResults));
		showCatalog();
		},
	onFailure : function (result) {
		alert("Invocation failed: "+JSON.stringify(result));
	},
});
}


/* JavaScript content from js/main.js in folder android */
// This method is invoked after loading the main HTML and successful initialization of the Worklight runtime.
function wlEnvInit(){
    wlCommonInit();
    // Environment initialization code goes here
}