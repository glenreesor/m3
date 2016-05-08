"use strict";

// Copyright 2015, 2016 Glen Reesor
//
// This file is part of m3 - Mobile Mind Mapper.
//
// m3 - Mobile Mind Mapper is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License, version 3, as
// published by the Free Software Foundation.
//
// m3 - Mobile Mind Mapper is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with m3 - Mobile Mind Mapper.  If not, see
// <http://www.gnu.org/licenses/>.

let test = require('tape');
let proxyquire = require('proxyquire');

let DOMParser = require('xmldom').DOMParser;
let testExportedXml = require('./helperFunctions').testExportedXml;

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
let arrowLinkStub;
let cloudModelStub;
let connectToNodeModelCount;
let controllerStub;
let diagnosticsStub;
let fontStub;
let linkTargetStub;
let logCount;           // Number of times diagnosticsStub.log() called
let mainStub;
let mapModelStub;
let nodeViewStub;
let richContentStub;
let setModifiedStatusCount;   // mapModel.setModifiedStatus() call count
let warningCount;       // Number of times diagnosticsStub.warn() called


connectToNodeModelCount = 0;
logCount = 0;
setModifiedStatusCount = 0;
warningCount = 0;

//-----------------------------------------------------------------------------
// Create proxyquire stubs
//-----------------------------------------------------------------------------
arrowLinkStub = {};
arrowLinkStub.ArrowLink = function ArrowLink() { };
arrowLinkStub.ArrowLink.prototype.connectToNodeModel = function
   connectToNodeModel(mapModel) {
      connectToNodeModelCount += 1;
};
arrowLinkStub.ArrowLink.prototype.getAsXml = function getAsXml() {
   return ("<arrowlink/>");
};
arrowLinkStub.ArrowLink.prototype.loadFromXml1_0_1 = function
   loadFromXml1_0_1(xml) {
};

cloudModelStub = {};
cloudModelStub.CloudModel = function CloudModel() {};
cloudModelStub.CloudModel.prototype.getAsXml = function getAsXml() {
   return ("<cloud/>");
};
cloudModelStub.CloudModel.prototype.loadFromXml1_0_1 =
   function loadFromXml1_0_1() {};

diagnosticsStub = {};
diagnosticsStub.Diagnostics = function Diagnostics(){};
diagnosticsStub.Diagnostics.TASK_IMPORT_XML = "Task Import Xml";
diagnosticsStub.Diagnostics.log = function() {
   logCount += 1;
};

diagnosticsStub.Diagnostics.warn = function() {
   warningCount += 1;
};

fontStub = {};
fontStub.Font = function Font() {};
fontStub.Font.prototype.getAsXml = function getAsXml() {
   return ("<font/>");
};
fontStub.Font.prototype.loadFromXml1_0_1 = function loadFromXml1_0_1() {};

linkTargetStub = {};
linkTargetStub.LinkTarget = function LinkTarget() {};
linkTargetStub.LinkTarget.prototype.getAsXml = function getAsXml() {
   return ("<linktarget/>");
};
linkTargetStub.LinkTarget.prototype.loadFromXml1_0_1 = function
   loadFromXml1_0_1() {};

richContentStub = {};
richContentStub.RichContent = function RichContent() {};
richContentStub.RichContent.prototype.getAsXml = function getAsXml() {
   return (`<richcontent type="${this._type}">${this._content}</richcontent>`);
};

richContentStub.RichContent.prototype.getContent = function getContent() {
   return this._content;
};

richContentStub.RichContent.prototype.getType = function getType() {
   return this._type;
};

richContentStub.RichContent.prototype.loadFromXml1_0_1 = function
   loadFromXml1_0_1(parsedXml) {

   if (parsedXml.attributes[0].value.toLowerCase() === "node") {
      this._type = "node";
      this._content = "<html>content:node</html>";
   } else {
      this._type = "note";
      this._content = "<html>content:note</html>";
   }
};

mainStub = {};
mainStub.m3App = {};
mainStub.m3App.getDiagnostics = function getDiagnostics() {
   return diagnosticsStub.Diagnostics;
};

//-----------------------------------------------------------------------------
// Create local stubs
//-----------------------------------------------------------------------------
controllerStub = {};

mapModelStub = {};
mapModelStub.setModifiedStatus = function() {
   setModifiedStatusCount += 1;
};

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
let NodeModel = proxyquire('../../app/src/NodeModel',
                           {
                              './ArrowLink': arrowLinkStub,
                              './CloudModel': cloudModelStub,
                              './Diagnostics': diagnosticsStub,
                              './Font': fontStub,
                              './LinkTarget': linkTargetStub,
                              './RichContent': richContentStub,
                              './main': mainStub
                           }).NodeModel;

//-----------------------------------------------------------------------------
// List of all attributes and non-default values, used by multiple tests
//-----------------------------------------------------------------------------
const allAttributes = {
   background_color: "#123456",
   created: "123456",
   color: "#654321",
   folded: "true",
   id: "ID_123456",
   modified: "1234567",
   position: "left",
   text: "test text"
};

// Leaving out <node> as an embedded tag, since requires much more effort
// for testing. This is tested in integration testing.
const allEmbeddedTags =
   ['<arrowlink/>', '<cloud/>', '<font/>', '<linktarget/>',
    '<richcontent TYPE="NODE"><html>content:node</html></richcontent>',
    '<richcontent TYPE="NOTE"><html>content:note</html></richcontent>'];

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
/**
  * Test allAttributes as listed above
  * @param {String} t - test object from Tape
  * @param {NodeModel} nodeModel - the nodeModel to be tested
  * @return {void}
  */
function testAllAttributes(t, nodeModel) {
   let booleanAsString;

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(Object.keys(allAttributes).length, 8,
      "all attributes listed in this file must be tested");

   t.equal(nodeModel.getBackgroundColor(), allAttributes["background_color"],
      "background color must match value that was loaded");

   t.equal(nodeModel.getTextColor(), allAttributes["color"],
      "color must match value that was loaded");

   t.equal(nodeModel.getCreatedTimestamp(), allAttributes["created"],
      "created timestamp must match value that was loaded");

   booleanAsString = (new Boolean(nodeModel.isFolded())).toString();
   t.equal(booleanAsString, allAttributes["folded"],
      "folded status must match value that was loaded");

   t.equal(nodeModel.getId(), allAttributes["id"],
      "id must match value that was loaded");

   t.equal(nodeModel.getModifiedTimestamp(), allAttributes["modified"],
      "modified timestamp must match value that was loaded");

   t.equal(nodeModel.getSide(), allAttributes["position"],
      "side must match value that was loaded");

   t.equal(nodeModel.getText(), allAttributes["text"],
      "text must match value that was loaded");
} // testAllAttributes

/**
  * Test allEmbeddedTags as listed above
  * @param {String} t - test object from Tape
  * @param {NodeModel} nodeModel - the nodeModel to be tested
  * @return {void}
  */
function testAllEmbeddedTags(t, nodeModel) {
   t.equal(nodeModel.getArrowLinks().length, 1,
      "there must be one ArrowLink present");

   t.notEqual(nodeModel.getCloudModel(), null,
      "there must be a Cloud present");

   t.notEqual(nodeModel.getFont(), null,
      "there must be a Font present");

   t.equal(nodeModel.getLinkTargets().length, 1,
      "there must be one LinkTarget present");

   t.notEqual(nodeModel.getRichText(), null,
      "there must be a RichText node present");

   t.notEqual(nodeModel.getNote(), null,
      "there must be a RichText Note present");
} // testAllEmbeddedTags()

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('NodeModel - Constructor - Defaults', function (t) {
   let nodeModel;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                             null, "Test Text", null);

   t.equal(nodeModel.getArrowLinks().length, [].length,
      "Default nodeModel should have no ArrowLinks");

   t.equal(nodeModel.getBackgroundColor(), "#ffffff",
      "Default backgroundColor should be '#ffffff'");

   t.equal(nodeModel.getChildren().length, [].length,
      "Default nodeModel should have no children");

   t.equal(nodeModel.getCloudModel(), null,
      "Default nodeModel should have no Cloud");

   t.equal(nodeModel.getFont(), null,
      "Default nodeModel should have no Font specified");

   t.equal(nodeModel.getLinkTargets().length, [].length,
      "Default nodeModel should have no LinkTargets");

   t.equal(nodeModel.getNote(), null,
      "Default nodeModel should have no Note");

   t.equal(nodeModel.getRichText(), null,
      "Default nodeModel should have no RichText");

   t.equal(nodeModel.getSide(), NodeModel.POSITION_NONE,
      "Default root nodeModel should have no position specified");

   t.equal(nodeModel.getText(), "Test Text",
      "text should match input");

   t.equal(nodeModel.getTextColor(), "#000000",
      "Default text color should be '#000000'");

   t.equal(nodeModel.isFolded(), false,
      "Default folded status should be false");

   t.end();
});

//-----------------------------------------------------------------------------
// Constuctor - XML - Creation of NodeModel gets logged
//-----------------------------------------------------------------------------
test('NodeModel - Constructor - XML - Creation of NodeModel gets logged',
   function (t) {

   let nodeModel;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xml = "<node ";
   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += ">";
   allEmbeddedTags.forEach(function (t) {
      xml += t.toLowerCase();
   });

   xml += "</node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   logCount = 0;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);

   t.equal(logCount, 1,
      "Creation of NodeModel should be logged");

   t.end();
});

//-----------------------------------------------------------------------------
// Constructor - XML - Lowercase tag and attribute names
//-----------------------------------------------------------------------------
test("NodeModel - Constructor - XML - Lower Case", function(t) {
   let docElement;
   let nodeModel;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel. All attributes and embedded tags
   // lowercase
   //--------------------------------------------------------------------------
   xml = "<node ";
   for (let a in allAttributes) {
      xml += `${a.toLowerCase()}="${allAttributes[a]}" `;
   }
   xml += ">";
   allEmbeddedTags.forEach(function (t) {
      xml += t.toLowerCase();
   });

   xml += "</node>";

   //--------------------------------------------------------------------------
   // Load the NodeModel
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, nodeModel);
   testAllEmbeddedTags(t, nodeModel);

   t.end();
});

//-----------------------------------------------------------------------------
// Constructor - XML - Uppercase tag and attribute names
//-----------------------------------------------------------------------------
test("NodeModel - Constructor - XML - Upper Case", function(t) {
   let docElement;
   let nodeModel;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel. All attributes and embedded tags
   // uppercase
   //--------------------------------------------------------------------------
   xml = "<NODE ";
   for (let a in allAttributes) {
      xml += `${a.toUpperCase()}="${allAttributes[a]}" `;
   }
   xml += ">";
   allEmbeddedTags.forEach(function (t) {
      xml += t.toUpperCase();
   });

   xml += "</NODE>";

   //--------------------------------------------------------------------------
   // Load the NodeModel
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);

   //--------------------------------------------------------------------------
   // Test all attributes and tags
   //--------------------------------------------------------------------------
   testAllAttributes(t, nodeModel);
   testAllEmbeddedTags(t, nodeModel);

   t.end();
});

//-----------------------------------------------------------------------------
// Constructor - XML - Unknown attributes get logged
//-----------------------------------------------------------------------------
test('NodeModel - Constructor - XML - Unknown attributes get logged',
   function (t) {

   let nodeModel;
   let docElement;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xml = "<node ";
   xml += 'unknownAttribute1="unknownValue1" ';

   for (let a in allAttributes) {
      xml += `${a}="${allAttributes[a]}" `;
   }
   xml += 'unknownAttribute2="unknownValue2" ';
   xml += "></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   warningCount = 0;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);

   testAllAttributes(t, nodeModel);
   t.equal(warningCount, 2,
      "unknown attributes should get logged");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//
// Confirm that:
//    - Attribute is modified
//    - Timestamp updated
//    - mapModel.setModifiedStatus() called
//-----------------------------------------------------------------------------
test('NodeModel - set/get BackgroundColor()', function (t) {
   const newColor = "#111111";
   let nodeModel;
   let origTimestamp;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                             null, "Test Text", null);
   setModifiedStatusCount = 0;
   origTimestamp = nodeModel.getModifiedTimestamp();
   nodeModel.setBackgroundColor(newColor);

   t.equal(nodeModel.getBackgroundColor(), newColor,
      "getBackgroundColor() should reflect the new color");

   t.notEqual(nodeModel.getModifiedTimestamp, origTimestamp,
      "getBackgroundColor() should result in an updated timestamp");

   t.equal(setModifiedStatusCount, 1,
      "setBackgroundColor() should tell the MapModel a change was made");

   t.end();
});

test('NodeModel - set/get Text()', function (t) {
   const newText = "NEW Test Text";
   let nodeModel;
   let origTimestamp;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                             null, "Test Text", null);
   setModifiedStatusCount = 0;
   origTimestamp = nodeModel.getModifiedTimestamp();
   nodeModel.setText(newText);

   t.equal(nodeModel.getText(), newText,
      "getText() should reflect the new text");

   t.notEqual(nodeModel.getModifiedTimestamp, origTimestamp,
      "getText() should result in an updated timestamp");

   t.equal(setModifiedStatusCount, 1,
      "setText() should tell the MapModel a change was made");

   t.end();
});

test('NodeModel - set/get TextColor()', function (t) {
   const newTextColor = "#123456";
   let nodeModel;
   let origTimestamp;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                             null, "Test Text", null);
   setModifiedStatusCount = 0;
   origTimestamp = nodeModel.getModifiedTimestamp();
   nodeModel.setTextColor(newTextColor);

   t.equal(nodeModel.getTextColor(), newTextColor,
      "getTextColor() should reflect the new text color");

   t.notEqual(nodeModel.getModifiedTimestamp, origTimestamp,
      "getTextColor() should result in an updated timestamp");

   t.equal(setModifiedStatusCount, 1,
      "setTextColor() should tell the MapModel a change was made");

   t.end();
});

//-----------------------------------------------------------------------------
// addChild
//
// Confirm that:
//    - Children get add for various scenarios
//    - mapModel.setModifiedStatus() called
//-----------------------------------------------------------------------------
test('NodeModel - addChild()', function (t) {
   let childModel1;
   let childModel2;
   let origTimeStamp;
   let parentModel;

   parentModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                               null, "Parent Text", null);

   setModifiedStatusCount = 0;
   origTimeStamp = parentModel.getModifiedTimestamp();

   childModel1 = parentModel.addChild("Child Text1"); // First child
   childModel2 = parentModel.addChild("Child Text2"); // Non-first child

   t.equal(parentModel.getChildren().length, 2,
      "parent node should now have 2 children");

   t.equal(parentModel.getChildren()[0], childModel1,
      "the first child should be childModel1");

   t.equal(parentModel.getChildren()[1], childModel2,
      "the second child should be childModel2");

   t.equal(setModifiedStatusCount, 2,
      "addChild() should tell the MapModel a change was made");

   t.end();
});

//-----------------------------------------------------------------------------
// addChildAfter
//
// Confirm that:
//    - Children get add for various scenarios
//    - mapModel.setModifiedStatus() called
//-----------------------------------------------------------------------------
test('NodeModel - addChild()', function (t) {
   let childModel1;
   let childModel1a;    // Non-last child
   let childModel2;
   let childModel2a;    // Last child
   let parentModel;

   parentModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                               null, "Parent Text", null);

   setModifiedStatusCount = 0;

   childModel1 = parentModel.addChild("Child Text1");
   childModel2 = parentModel.addChild("Child Text2");
   childModel1a = parentModel.addChildAfter(childModel1, "Child Text1a");
   childModel2a = parentModel.addChildAfter(childModel2, "Child Text2a");

   t.equal(parentModel.getChildren().length, 4,
      "the parent node should have 4 children");

   t.equal(parentModel.getChildren()[0], childModel1,
      "the first child should be childModel1");

   t.equal(parentModel.getChildren()[1], childModel1a,
      "the second child should be childModel1a");

   t.equal(parentModel.getChildren()[2], childModel2,
      "the third child should be childModel2");

   t.equal(parentModel.getChildren()[3], childModel2a,
      "the fourth child should be childModel2a");

   t.equal(setModifiedStatusCount, 4,
      "addChildAfter() should tell the MapModel a change was made");

   t.end();
});

//-----------------------------------------------------------------------------
// connectArrowLinks
//    - connectToNodeModel should be called
//-----------------------------------------------------------------------------
test('NodeModel - connectArrowLinks()', function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlMultipleArrowLinks;
   let xmlNoArrowLinks;
   let xmlOneArrowLink;
   let xmlTmp;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlTmp = "<node ";
   for (let a in allAttributes) {
      xmlTmp += `${a}="${allAttributes[a]}" `;
   }
   xmlTmp += ">";

   xmlNoArrowLinks = xmlTmp + "</node>";
   xmlOneArrowLink = xmlTmp + "<arrowlink/></node>";
   xmlMultipleArrowLinks = xmlTmp + "<arrowlink/><arrowlink/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //
   // No ArrowLinks
   //
   docElement = domParser.parseFromString(xmlNoArrowLinks, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   connectToNodeModelCount = 0;
   nodeModel.connectArrowLinks();
   t.equal(connectToNodeModelCount, 0,
      "connectToNodeModel() should not be called");

   //
   // One ArrowLink
   //
   docElement = domParser.parseFromString(xmlOneArrowLink, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   connectToNodeModelCount = 0;
   nodeModel.connectArrowLinks();
   t.equal(connectToNodeModelCount, 1,
      "connectToNodeModel() should be called once");

   //
   // Multiple ArrowLinks
   //
   docElement = domParser.parseFromString(xmlMultipleArrowLinks, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   connectToNodeModelCount = 0;
   nodeModel.connectArrowLinks();
   t.equal(connectToNodeModelCount, 2,
      "connectToNodeModel() should be called twice");

   t.end();
});

//-----------------------------------------------------------------------------
// deleteChild
//
// Confirm that:
//    - Children get deleted for various scenarios
//    - mapModel.setModifiedStatus() called
//
// Scenarios:
//    - Delete first child
//    - Delete last child
//    - Delete middle child
//    - Delete final child
//-----------------------------------------------------------------------------
test('NodeModel - deleteChild()', function(t) {
   let childModel1;
   let childModel2;
   let childModel3;
   let childModel4;
   let childModel5;
   let parentModel;

   parentModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                               null, "Parent Text", null);

   childModel1 = parentModel.addChild("Child Text1");
   childModel2 = parentModel.addChild("Child Text2");
   childModel3 = parentModel.addChild("Child Text3");
   childModel4 = parentModel.addChild("Child Text4");
   childModel5 = parentModel.addChild("Child Text5");

   setModifiedStatusCount = 0;

   parentModel.deleteChild(childModel1);
   // Children in order are now: 2, 3, 4, 5
   t.equal(parentModel.getChildren().length, 4,
      "after deleting first child, there should be 4 children left");
   t.equal(parentModel.getChildren()[0], childModel2,
      "after deleting first child, original 2nd child should be new 1st one");

   parentModel.deleteChild(childModel5);
   // Children in order are now: 2, 3, 4
   t.equal(parentModel.getChildren().length, 3,
      "after deleting 2 children, there should be 3 children left");
   t.equal(parentModel.getChildren()[0], childModel2,
      "after deleting last child, 1st should be unchanged");
   t.equal(parentModel.getChildren()[1], childModel3,
      "after deleting last child, 2nd should be unchanged");
   t.equal(parentModel.getChildren()[2], childModel4,
      "after deleting last child, 3rd should be unchanged");

   parentModel.deleteChild(childModel3);
   // Children in order are now: 2, 4
   t.equal(parentModel.getChildren().length, 2,
      "after deleting 3 children, there should be 2 children left");
   t.equal(parentModel.getChildren()[0], childModel2,
      "after deleting middle child, 1st should be unchanged");
   t.equal(parentModel.getChildren()[1], childModel4,
      "after deleting middle child, 2nd should be changed");

   parentModel.deleteChild(childModel2);
   parentModel.deleteChild(childModel4);
   t.equal(parentModel.getChildren().length, 0,
      "after deleting final child, there should be zero children left");

   t.equal(setModifiedStatusCount, 5,
      "deleteChild() should tell the MapModel a change was made");

   t.end();
});

//-----------------------------------------------------------------------------
// getArrowLinks
//-----------------------------------------------------------------------------
test('NodeModel - getArrowLinks()', function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlMultipleArrowLinks;
   let xmlNoArrowLinks;
   let xmlOneArrowLink;
   let xmlTmp;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlTmp = "<node ";
   for (let a in allAttributes) {
      xmlTmp += `${a}="${allAttributes[a]}" `;
   }
   xmlTmp += ">";

   xmlNoArrowLinks = xmlTmp + "</node>";
   xmlOneArrowLink = xmlTmp + "<arrowlink/></node>";
   xmlMultipleArrowLinks = xmlTmp + "<arrowlink/><arrowlink/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //
   // No ArrowLinks
   //
   docElement = domParser.parseFromString(xmlNoArrowLinks, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getArrowLinks().length, 0,
      "there should be no ArrowLink on the nodeModel");

   //
   // One ArrowLink
   //
   docElement = domParser.parseFromString(xmlOneArrowLink, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getArrowLinks().length, 1,
      "there should be one ArrowLink on the nodeModel");

   //
   // Multiple ArrowLinks
   //
   docElement = domParser.parseFromString(xmlMultipleArrowLinks, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getArrowLinks().length, 2,
      "there should be two ArrowLinks on the nodeModel");

   t.end();
});

//-----------------------------------------------------------------------------
// getAsXml - Exported XML same as source XML
//            This includes attributes and embedded tags that m3 doesn't
//            understand
//-----------------------------------------------------------------------------
test('NodeModel - getAsXml()', function (t) {
   const UNKNOWN_ATTRIBUTE1 = 'unknownattribute1';
   const UNKNOWN_ATTRIBUTE2 = 'unknownattribute2';
   const UNKNOWN_TAG1 = "<unknownTag1 att1='value1'>" +
                        "<embeddedTag att2='value2'>a bunch of content" +
                        "</embeddedTag></unknownTag1>";
   const UNKNOWN_TAG2 = "<unknownTag2 att1='value1'>" +
                        "<embeddedTag att2='value2'>a bunch of content" +
                        "</embeddedTag></unknownTag2>";
   const UNKNOWN_VALUE1 = 'unknownvalue1';
   const UNKNOWN_VALUE2 = 'unknownvalue2';
   let origXml;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   origXml = "<node ";
   origXml += `${UNKNOWN_ATTRIBUTE1}="${UNKNOWN_VALUE1}" `;

   for (let a in allAttributes) {
      origXml += `${a}="${allAttributes[a]}" `;
   }
   origXml += `${UNKNOWN_ATTRIBUTE2}="${UNKNOWN_VALUE2}" `;

   origXml += ">";

   allEmbeddedTags.forEach( function(t) {
      origXml += t;
   });

   origXml += `${UNKNOWN_TAG1}${UNKNOWN_TAG2}`;

   origXml += "</node>";

   //--------------------------------------------------------------------------
   // Test
   //--------------------------------------------------------------------------
   testExportedXml(origXml, t, function(docElement) {
      return new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                           null, null, docElement);
   });

   t.end();
});

//-----------------------------------------------------------------------------
// getChildren
//-----------------------------------------------------------------------------
test('NodeModel - getChildren()', function(t) {
   let childModel1;
   let childModel2;
   let childModel3;
   let parentModel;

   parentModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                               null, "Parent Text", null);

   childModel1 = parentModel.addChild("Child Text1");
   childModel2 = parentModel.addChild("Child Text2");
   childModel3 = parentModel.addChild("Child Text3");

   t.equal(parentModel.getChildren().length, 3,
      "after adding 3 children, child array should contain 3 elements");

   t.equal(parentModel.getChildren()[0], childModel1,
      "first child in array should be first child added");

   t.equal(parentModel.getChildren()[1], childModel2,
      "second child in array should be second child added");

   t.equal(parentModel.getChildren()[2], childModel3,
      "third child in array should be third child added");

   t.end();
});

//-----------------------------------------------------------------------------
// getCloudModel
//-----------------------------------------------------------------------------
test('NodeModel - getCloudModel()', function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlNoCloud;
   let xmlTmp;
   let xmlWithCloud;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlTmp = "<node ";
   for (let a in allAttributes) {
      xmlTmp += `${a}="${allAttributes[a]}" `;
   }
   xmlTmp += ">";

   xmlNoCloud = xmlTmp + "</node>";
   xmlWithCloud = xmlTmp + "<cloud/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //
   // No Cloud
   //
   docElement = domParser.parseFromString(xmlNoCloud, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getCloudModel(), null,
      "there should be no Cloud on the nodeModel");

   //
   // One Cloud
   //
   docElement = domParser.parseFromString(xmlWithCloud, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.notEqual(nodeModel.getCloudModel(), null,
      "there should be a Cloud on the nodeModel");

   t.end();
});

//-----------------------------------------------------------------------------
// getFont
//-----------------------------------------------------------------------------
test('NodeModel - getFont()', function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlNoFont;
   let xmlTmp;
   let xmlWithFont;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlTmp = "<node ";
   for (let a in allAttributes) {
      xmlTmp += `${a}="${allAttributes[a]}" `;
   }
   xmlTmp += ">";

   xmlNoFont = xmlTmp + "</node>";
   xmlWithFont = xmlTmp + "<font/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //
   // No Font
   //
   docElement = domParser.parseFromString(xmlNoFont, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getFont(), null,
      "there should be no Font on the nodeModel");

   //
   // One Font
   //
   docElement = domParser.parseFromString(xmlWithFont, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.notEqual(nodeModel.getFont(), null,
      "there should be a Font on the nodeModel");

   t.end();
});

//-----------------------------------------------------------------------------
// getId
//-----------------------------------------------------------------------------
test('NodeModel - getId()', function(t) {
   const xml = '<node CREATED="1445227701475" ID="ID_728672746" ' +
               'MODIFIED="1445227721295" TEXT="Node Text"> ' +
               '</node>';

   let docElement;
   let domParser;
   let nodeModel;

   domParser = new DOMParser();

   //
   // No Font
   //
   docElement = domParser.parseFromString(xml, "text/xml").documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getId(), "ID_728672746",
      "the ID should match the source xml");

   t.end();
});

//-----------------------------------------------------------------------------
// getLinkTargets
//-----------------------------------------------------------------------------
test('NodeModel - getLinkTargets()', function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlMultipleLinkTargets;
   let xmlNoLinkTargets;
   let xmlOneLinkTarget;
   let xmlTmp;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlTmp = "<node ";
   for (let a in allAttributes) {
      xmlTmp += `${a}="${allAttributes[a]}" `;
   }
   xmlTmp += ">";

   xmlNoLinkTargets = xmlTmp + "</node>";
   xmlOneLinkTarget = xmlTmp + "<linktarget/></node>";
   xmlMultipleLinkTargets = xmlTmp + "<linktarget/><linktarget/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //
   // No LinkTargets
   //
   docElement = domParser.parseFromString(xmlNoLinkTargets, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getLinkTargets().length, 0,
      "there should be no LinkTargets on the nodeModel");

   //
   // One LinkTarget
   //
   docElement = domParser.parseFromString(xmlOneLinkTarget, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getLinkTargets().length, 1,
      "there should be one LinkTarget on the nodeModel");

   //
   // Multiple LinkTargets
   //
   docElement = domParser.parseFromString(xmlMultipleLinkTargets, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getLinkTargets().length, 2,
      "there should be two LinkTargets on the nodeModel");

   t.end();
});

//-----------------------------------------------------------------------------
// getNote
//-----------------------------------------------------------------------------
test("NodeModel - getNote()", function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlNoNote;
   let xmlTmp;
   let xmlWithNote;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlTmp = "<node ";
   for (let a in allAttributes) {
      xmlTmp += `${a}="${allAttributes[a]}" `;
   }
   xmlTmp += ">";

   xmlNoNote = xmlTmp + "</node>";
   xmlWithNote = xmlTmp + '<richcontent TYPE="NOTE"/></node>';

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //
   // No note
   //
   docElement = domParser.parseFromString(xmlNoNote, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getNote(), null,
      "nodeModel should not have a note on it");

   //
   // With note
   //
   docElement = domParser.parseFromString(xmlWithNote, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.notEqual(nodeModel.getNote(), null,
      "nodeModel should have a note on it");

   t.end();
});

//-----------------------------------------------------------------------------
// getParent
//-----------------------------------------------------------------------------
test("NodeModel - getParent()", function(t) {
   let childModel;
   let parentModel;

   parentModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                               null, "Parent Text", null);

   childModel = parentModel.addChild("Child Text");

   t.equal(parentModel.getParent(), null,
      "getParent() called on root node should be null");

   t.equal(childModel.getParent(), parentModel,
      "getParent() must return the parent NodeModel");

   t.end();
});

//-----------------------------------------------------------------------------
// getRichText
//-----------------------------------------------------------------------------
test("NodeModel - getRichText()", function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlNoRichText;
   let xmlTmp;
   let xmlWithRichText;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlTmp = "<node ";
   for (let a in allAttributes) {
      xmlTmp += `${a}="${allAttributes[a]}" `;
   }
   xmlTmp += ">";

   xmlNoRichText = xmlTmp + "</node>";
   xmlWithRichText = xmlTmp + '<richcontent TYPE="NODE"/></node>';

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //
   // No RichText
   //
   docElement = domParser.parseFromString(xmlNoRichText, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getRichText(), null,
      "nodeModel should not be richtext");

   //
   // With RichText
   //
   docElement = domParser.parseFromString(xmlWithRichText, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.notEqual(nodeModel.getRichText(), null,
      "nodeModel should be rich text");

   t.end();
});

//-----------------------------------------------------------------------------
// getSide
//-----------------------------------------------------------------------------
test("NodeModel - getSide()", function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlNoSide;
   let xmlWithSide;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel.
   // xmlNoSide - All attributes except 'position'
   // XmlWithSide - All attributes
   //--------------------------------------------------------------------------
   xmlNoSide = "<node ";
   xmlWithSide = "<node ";
   for (let a in allAttributes) {
      if (a !== "position") {
         xmlNoSide += `${a}="${allAttributes[a]}" `;
      }
      xmlWithSide += `${a}="${allAttributes[a]}" `;
   }
   xmlNoSide += "></node>";
   xmlWithSide += "></node>";

   //--------------------------------------------------------------------------
   // No Side
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   docElement = domParser.parseFromString(xmlNoSide, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getSide(), NodeModel.POSITION_NONE,
      "nodeModel.getSide() should match input xml (none specified)");

   //--------------------------------------------------------------------------
   // With side
   //--------------------------------------------------------------------------
   docElement = domParser.parseFromString(xmlWithSide, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getSide(), allAttributes["position"],
      "nodeModel.getSide() should match input xml");

   t.end();
});

//-----------------------------------------------------------------------------
// hasCloud
//-----------------------------------------------------------------------------
test("NodeModel - hasCloud()", function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlNoCloud;
   let xmlTmp;
   let xmlWithCloud;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlTmp = "<node ";
   for (let a in allAttributes) {
      xmlTmp += `${a}="${allAttributes[a]}" `;
   }
   xmlTmp += ">";

   xmlNoCloud = xmlTmp + "</node>";
   xmlWithCloud = xmlTmp + '<cloud/></node>';

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //
   // No cloud
   //
   docElement = domParser.parseFromString(xmlNoCloud, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.hasCloud(), false,
      "nodeModel should not have a cloud");

   //
   // With cloud
   //
   docElement = domParser.parseFromString(xmlWithCloud, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.hasCloud(), true,
      "nodeModel should have a cloud");

   t.end();

});

//-----------------------------------------------------------------------------
// isFolded
//-----------------------------------------------------------------------------
test("NodeModel - isFolded()", function(t) {
   let childModel;
   let parentModel;

   parentModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                               null, "Parent Text", null);

   childModel = parentModel.addChild("Child Text"); // First child

   t.equal(parentModel.isFolded(), false,
      "initial isFolded() status should be false");

   parentModel.toggleFoldedStatus();

   t.equal(parentModel.isFolded(), true,
      "NodeModel should now be folded.");

   t.end();
});

//-----------------------------------------------------------------------------
// toggleCloud
//
// Confirm that:
//    - toggleCloud works
//    - mapModel.setModifiedStatus() called
//-----------------------------------------------------------------------------
test("NodeModel - toggleCloud()", function(t) {
   let nodeModel;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                             null, "Parent Text", null);

   setModifiedStatusCount = 0;

   t.equal(nodeModel.hasCloud(), false,
      "nodeModel initially has no cloud");

   nodeModel.toggleCloud();

   t.equal(nodeModel.hasCloud(), true,
      "toggleCloud() should result in NodeModel having a cloud");

   nodeModel.toggleCloud();

   t.equal(nodeModel.hasCloud(), false,
      "toggleCloud() should result in NodeModel not having a cloud");

   t.equal(setModifiedStatusCount, 2,
      "toggleCloud() should tell the MapModel that a change was made");

   t.end();

});

//-----------------------------------------------------------------------------
// toggleFoldedStatus
//
// Confirm that:
//    - toggleFoldedStatus works
//    - mapModel.setModifiedStatus() called
//-----------------------------------------------------------------------------
test("NodeModel - toggleFoldedStatus()", function(t) {
   let nodeModel;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                             null, "Parent Text", null);

   setModifiedStatusCount = 0;

   t.equal(nodeModel.isFolded(), false,
      "nodeModel initially is not folded");

   nodeModel.toggleFoldedStatus();

   t.equal(nodeModel.isFolded(), true,
      "toggleFoldedStatus() should result in status being true");

   nodeModel.toggleFoldedStatus();

   t.equal(nodeModel.hasCloud(), false,
      "toggleFoldedStatus() should result in status being false");

   t.equal(setModifiedStatusCount, 2,
      "toggleFoldedStatus() should tell the MapModel a change was made");

   t.end();

});
