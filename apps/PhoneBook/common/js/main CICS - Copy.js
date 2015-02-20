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
					for(var i = 0; i < catalogResults.length; i++)
							htmlString += '<div data-dojo-type="dojox.mobile.ListItem" moveTo=\'itemDetails\' onclick=\'showDetails('+i+')\'>' + catalogResults[i].itemDescription + '</div>';
		
					registry.byId("catalogList").destroyDescendants();  // Delete the old catalog data
					
					// Set the viewable catalogList to use the new list of items
					var listView = dom.byId("catalogList");
					listView.innerHTML = htmlString;
					parser.parse(listView);
					
				};
				
				// This function populates the ItemDetails view with the selected item's information
				showDetails = function(itemIndex) {
					
					currentItemIndex = itemIndex;  // Store the current itemIndex in case we need to refresh the view
					
					// Set all of the textBox fields to the selected item's data
					registry.byId("desc").set("value",catalogResults[itemIndex].itemDescription);
					registry.byId("dept").set("value",catalogResults[itemIndex].department);
					registry.byId("stock").set("value",catalogResults[itemIndex].inStock);
					registry.byId("cost").set("value",catalogResults[itemIndex].itemCost);
					registry.byId("itemRef").set("value",catalogResults[itemIndex].itemRef);
					registry.byId("order").set("value",catalogResults[itemIndex].onOrder);
		
				};
				
			});
}


//This function drives the invocation of the BrowseListAdapter to send a request to the CICS backend
//and get back the catalog data, which we store for here for later use 
function inquireCatalog(){

	var inquireObject = {};  // Create an object to hold the data for the catalog request
	
		inquireObject.itemRef = '0000';    // Start from item # 0000
		inquireObject.itemCount = '100';   // Get the first 100 items (even though there's only about 20)
			
		var invocationData = {
				adapter: "CatalogWrapperAdapter",
				procedure: "inquireCatalog",
				parameters: [inquireObject]
	};
	console.log('inquireCatalog:invocationData: '+JSON.stringify(invocationData));
	WL.Client.invokeProcedure(invocationData, {
		onSuccess : function (result) {
			catalogResults = result.invocationResult.Envelope.Body.inquireCatalogResponse.catalogItem;
			showCatalog();
		},
		onFailure : function (result) {
			alert("Invocation failed: "+JSON.stringify(result));
		},
	});
}

//This function gets invoked when the order button is pressed, and drives the invocation of the PlaceOrderAdapter
//to submit a request to the CICS backend and let us know if the order is successful
function placeOrder(itemRef){

	var orderObject = {};  // Create an object to hold the data for the place order request
	
	orderObject.itemRef = itemRef;    // Use the item reference number passed in from the ItemDetails screen
	orderObject.userId = "demoUser";   // Use a generic userId
	orderObject.dept = "demoDept";   // Use a generic department number
	orderObject.quantity = "1";   // Just order 1 of the item for demonstration purposes
	
	var invocationData = {
			adapter: "CatalogWrapperAdapter",
			procedure: "placeOrder",
			parameters: [orderObject]
	};
	
	console.log('placeOrder:invocationData: '+JSON.stringify(invocationData));
	WL.Client.invokeProcedure(invocationData, {
		onSuccess : function (result) {
			alert(result.invocationResult.Envelope.Body.placeOrderResponse.responseMessage);
			refreshDetails();
		},
		onFailure : function (result) {
			alert("Invocation failed: "+JSON.stringify(result));
		},
	});
}

//This function refreshes the ItemDetail view
function refreshDetails(){

inquireCatalog();   // Get the catalog data again
setTimeout(showDetails(currentItemIndex),3000);   // After waiting a few seconds for the response, set the details on the screen with the new item details

}
