
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        console.log("Starting NDEF Reader app");
    },
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        nfc.addTagDiscoveredListener(
            app.onNonNdef,          //tag successfully scanned
                function(status) {  //if listener successfully initializes
                    app.display("Listening for NFC tags...");
                },
                function(error) {   //if listener fails to initialize
                    app.display("NFC reader failed to initialize " + JSON.stringify(error));
                    }
                );
        nfc.addNdefFormatableListener(
            app.onNonNdef,          //tag successfully scanned
                function (status) { // listener successfully initialized 
                    app.display("Listening for NDEF Formatable tags...");
                },
                function (error) { // listener fails to initialize
                    app.display("NFC reader failed to initialize " + JSON.stringify(error));
                    } 
                );
        nfc.addNdefListener(
            app.onNfc,              // tag successfully scanned 
                function (status) { // listener successfully initialized
                    app.display("Listening for NDEF messages...");
                },
                function (error) {  // listener fails to initialize 
                    app.display("NFC reader failed to initialize " + JSON.stringify(error));
                    }
                );
        nfc.addMimeTypeListener( 
            "text/plain", 
            app.onNfc,                  // tag successfully scanned
                function (status) {     // listener successfully initialized
                    app.display("Listening for plain text MIME Types...");
                },
                function (error) { // listener fails to initialize 
                    app.display("NFC reader failed to initialize " + JSON.stringify(error));
                }
            );
            app.display("Tap a tag to read data.");
       },

        display: function(message) {
        var label = document.createTextNode(message),
            lineBreak = document.createElement("br");
        messageDiv.appendChild(lineBreak);
        messageDiv.appendChild(label); 
    },
    
        clear: function() {
        messageDiv.innerHTML = "";
    },
/* process NDEF tag data from nfcEvent */
        onNfc: function(nfcEvent) {
            app.clear();        //clear message div
            //display event type:
            app.display("Event Type: " + nfcEvent.type);
            app.showTag(nfcEvent.tag);  //display tag details
        },
/* process non-NFEF tag data [Non NDEF NFC Tags, NDEF-Formatable Tags, Mifare Classic on Nexus 4, Samsung S4, etc.] */
        onNonNdef: function(nfcEvent) {
            app.clear();        //clear message div
            //display event type:
            app.display("Event Type: " + nfcEvent.type);
            var tag = nfcEvent.tag;
            app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
            app.display("Tech Types: ");
            for(var i = 0; i < tag.techTypes.length; i++) {
                app.display(" * " + tag.techTypes[i]);
            } 
        },
        /* writes @tag to message div */
        showTag: function(tag) {
            //display tag properties:
            app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
            app.display("Tag Type: " + tag.type);
            app.display("Max Size: " + tag.maxSize + " bytes");
            app.display("Is Writable: " + tag.isWritable);
            app.display("Can Make Read Only: " + tag.canMakeReadOnly);

            //if there is an NDEF message on the tag, display it:
            var thisMessage = tag.ndefMessage;
            if(thisMessage !== null) {
                //get and display NDEF record count:
                app.display("Tag has NDEF message with " + thisMessage.length + " record" + (thisMessage.length === 1 ? ".":"s."));
                app.display("Message Contents: ");
                app.showMessage(thisMessage);
            }
        },
        /*iterates over records in NDEF message to display them: */
        showMessage: function(message) {
            for(var i=0; i < message.length; i++) {
                //get next record in message array:
                var record = message[i];
                app.showRecord(record); //show it
            }
        },
        /* writes @record to message div: */
        showRecord: function(record) {
            //display TNF, Type and ID:
            app.display(" ");
            app.display("TNF: " + record.tnf);
            app.display("Type: " + nfc.bytesToString(record.type));
            app.display("ID: " + nfc.bytesToString(record.id));
        //if payload is Smart Poster, it's an NDEF message   
            if(nfc.bytesToString(record.type) === 'Sp') {
                var ndefMessage = ndef.decodeMessage(record.payload);
                app.showMessage(ndefMessage);
        //if payload's not a Smart Poster, display it:
        } else {
            app.display("Payload: " + nfc.bytesToString(record.payload));
        }
    }
};