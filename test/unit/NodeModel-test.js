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
let validateCreateXmlArgs = require('./helperFunctions').validateCreateXmlArgs;

let xmlHelpersStub = {};
xmlHelpersStub.createXml =require('./helperFunctions').createXml;

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
let arrowLinkStub;
let cloudModelStub;
let connectToNodeModelCount;
let controllerStub;
let diagnosticsStub;
let fontStub;
let iconModelStub;
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

iconModelStub = {};
iconModelStub.IconModel = function IconModel() {};
iconModelStub.IconModel.prototype.getAsXml = function getAsXml() {
   return ("<icon/>");
};
iconModelStub.IconModel.prototype.loadFromXml1_0_1 =
   function loadFromXml1_0_1() {};

linkTargetStub = {};
linkTargetStub.LinkTarget = function LinkTarget() {};
linkTargetStub.LinkTarget.prototype.getAsXml = function getAsXml() {
   return ("<linktarget/>");
};
linkTargetStub.LinkTarget.prototype.loadFromXml1_0_1 = function
   loadFromXml1_0_1() {};

mainStub = {};
mainStub.m3App = {};
mainStub.m3App.getDiagnostics = function getDiagnostics() {
   return diagnosticsStub.Diagnostics;
};

richContentStub = {};
richContentStub.RichContent = function RichContent() {};
richContentStub.RichContent.prototype.getAsXml = function getAsXml() {
   return (`<richcontent TYPE="${this._type}">${this._content}</richcontent>`);
};

richContentStub.RichContent.prototype.getContent = function getContent() {
   return this._content;
};

richContentStub.RichContent.prototype.getType = function getType() {
   return this._type;
};

richContentStub.RichContent.prototype.loadFromXml1_0_1 = function
   loadFromXml1_0_1(parsedXml) {

   if (parsedXml.attributes[0].value === "NODE") {
      this._type = "NODE";
      this._content = "<html>content:node</html>";
   } else {
      this._type = "NOTE";
      this._content = "<html>content:note</html>";
   }
};

xmlHelpersStub.setupLoadXml = function setupLoadXml(
   currentAttributes,
   unexpectedAttributes,
   embeddedTags,
   unexpectedTags) {

   xmlHelpersStub.setupLoadXml.currentAttributes = currentAttributes;
   xmlHelpersStub.setupLoadXml.unexpectedAttributes = unexpectedAttributes;
   xmlHelpersStub.setupLoadXml.embeddedTags = embeddedTags;
   xmlHelpersStub.setupLoadXml.unexpectedTags = unexpectedTags;
};

// What's important is what's returned. Don't care what was passed in.
xmlHelpersStub.loadXml = function loadXml(xmlElement, attributeDefaults,
                                          expectedTags) {

   let parser;
   let parsedEmbeddedTags = [];

   parser = new DOMParser();

   xmlHelpersStub.setupLoadXml.embeddedTags.forEach(function(t) {
      parsedEmbeddedTags.push(parser.parseFromString(t, "text/xml").
         documentElement);
   });

   return [
      xmlHelpersStub.setupLoadXml.currentAttributes,
      xmlHelpersStub.setupLoadXml.unexpectedAttributes,
      parsedEmbeddedTags,
      xmlHelpersStub.setupLoadXml.unexpectedTags
   ];
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
                              './IconModel': iconModelStub,
                              './LinkTarget': linkTargetStub,
                              './RichContent': richContentStub,
                              './main': mainStub,
                              './xmlHelpers': xmlHelpersStub
                           }).NodeModel;

//-----------------------------------------------------------------------------
// Various constants
//    - POSITION must be none since we're testing a root node
//-----------------------------------------------------------------------------
const ATTRIBUTE_DEFAULTS = new Map([['BACKGROUND_COLOR', ''],
                                    ['CREATED', ''],
                                    ['COLOR', '#000000'],
                                    ['FOLDED', 'false'],
                                    ['ID', ''],
                                    ['LINK', ''],
                                    ['MODIFIED', ''],
                                    ['POSITION', ''],
                                    ['TEXT', '']
                                 ]);

const ATTRIBUTES = new Map([['BACKGROUND_COLOR', '#123456'],
                            ['CREATED', '123456'],
                            ['COLOR', '#654321'],
                            ['FOLDED', 'true'],
                            ['ID', 'ID_123456'],
                            ['LINK', 'http://glenreesor.ca'],
                            ['MODIFIED', '1234567'],
                            ['POSITION', ''],
                            ['TEXT', 'test text']
                         ]);

// Leaving out <node> as an embedded tag, since requires much more effort
// for testing.
const EMBEDDED_TAGS =
   ['<arrowlink/>', '<cloud/>', '<font/>', '<icon/>', '<linktarget/>',
    '<richcontent TYPE="NODE"><html>content:node</html></richcontent>',
    '<richcontent TYPE="NOTE"><html>content:note</html></richcontent>'];

const UNEXPECTED_ATTRIBUTES = new Map([["UNEXPECTEDATTRIBUTE1", "value1"]]);
const UNEXPECTED_TAGS = ["<unexpectedTag/>"];

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('NodeModel - Constructor - Defaults', function (t) {
   const TEST_TEXT = ['Test Text'];
   let nodeModel;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                             null, TEST_TEXT, null);

   t.equal(nodeModel.getArrowLinks().length, [].length,
      "Default nodeModel should have no ArrowLinks");

   t.equal(nodeModel.getBackgroundColor(), "",
      "Default backgroundColor should be ''");

   t.equal(nodeModel.getChildren().length, [].length,
      "Default nodeModel should have no children");

   t.equal(nodeModel.getCloudModel(), null,
      "Default nodeModel should have no Cloud");

   t.equal(nodeModel.getFont(), null,
      "Default nodeModel should have no Font specified");

   t.equal(nodeModel.getIcons().length, 0,
      "Default nodeModel should have no icons");

   t.equal(nodeModel.getLinkTargets().length, [].length,
      "Default nodeModel should have no LinkTargets");

   t.equal(nodeModel.getNote(), null,
      "Default nodeModel should have no Note");

   t.equal(nodeModel.getRichText(), null,
      "Default nodeModel should have no RichText");

   t.equal(nodeModel.getSide(), NodeModel.POSITION_NONE,
      "Default root nodeModel should have no position specified");

   t.equal(nodeModel.getText(), TEST_TEXT,
      "text should match input");

   t.equal(nodeModel.getTextColor(), "#000000",
      "Default text color should be '#000000'");

   t.equal(nodeModel.isFolded(), false,
      "Default folded status should be false");

   t.end();
});

//-----------------------------------------------------------------------------
// Constructor from XML - Values are loaded properly
//                      - Embedded objects (if any) are present
//
// getAsXml    - All regular attributes are passed to helper
//             - All unexpected attributes are passed to helper
//             - All unexpected tags, and their contents, are in the output
//-----------------------------------------------------------------------------
test('NodeModel - Constructor from XML, getAsXml', function(t) {
   let booleanAsString;
   let docElement;
   let getTextResult;
   let nodeModel;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xml = "<node ";
   for (let a of ATTRIBUTES) {
      xml += `${a[0]}="${a[1]}" `;
   }

   for (let a of UNEXPECTED_ATTRIBUTES) {
      xml += `${a[0]}="${a[1]}" `;
   }
   xml += ">";

   EMBEDDED_TAGS.forEach(function (t) {
      xml += t;
   });

   UNEXPECTED_TAGS.forEach(function (t) {
      xml += t;
   });

   xml += "</node>";

   //--------------------------------------------------------------------------
   // Tell the helper stub what to return
   //--------------------------------------------------------------------------
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, UNEXPECTED_ATTRIBUTES,
                               EMBEDDED_TAGS, UNEXPECTED_TAGS);

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);

   //--------------------------------------------------------------------------
   // First test is to make sure when attributes are added to this file,
   // we actually test them
   //--------------------------------------------------------------------------
   t.equal(ATTRIBUTES.size, 9,
      "all attributes listed in this file must be tested");

   //--------------------------------------------------------------------------
   // Attributes
   //--------------------------------------------------------------------------
   t.equal(nodeModel.getBackgroundColor(), ATTRIBUTES.get("BACKGROUND_COLOR"),
      "background color must match value that was loaded");

   t.equal(nodeModel.getTextColor(), ATTRIBUTES.get("COLOR"),
      "color must match value that was loaded");

   t.equal(nodeModel.getCreatedTimestamp(), ATTRIBUTES.get("CREATED"),
      "created timestamp must match value that was loaded");

   booleanAsString = (new Boolean(nodeModel.isFolded())).toString();
   t.equal(booleanAsString, ATTRIBUTES.get("FOLDED"),
      "folded status must match value that was loaded");

   t.equal(nodeModel.getId(), ATTRIBUTES.get("ID"),
      "id must match value that was loaded");

   t.equal(nodeModel.getLink(), ATTRIBUTES.get('LINK'),
      'link must match value that was loaded');

   t.equal(nodeModel.getModifiedTimestamp(), ATTRIBUTES.get("MODIFIED"),
      "modified timestamp must match value that was loaded");

   t.equal(nodeModel.getSide(), NodeModel.POSITION_NONE,
      "side for a root node is the special POSITION_NONE");

   // Have to do a bit more work here because the XMl is a string,
   // but the returned value is an array
   getTextResult = nodeModel.getText();
   t.equal(getTextResult.length, 1,
      "text must be an array of one string");

   t.equal(getTextResult[0], ATTRIBUTES.get("TEXT"),
      "text must match value that was loaded");

   //--------------------------------------------------------------------------
   // Embedded Tags
   //--------------------------------------------------------------------------
   t.equal(nodeModel.getArrowLinks().length, 1,
      "there must be one ArrowLink present");

   t.notEqual(nodeModel.getCloudModel(), null,
      "there must be a Cloud present");

   t.notEqual(nodeModel.getFont(), null,
      "there must be a Font present");

   t.equal(nodeModel.getIcons().length, 1,
      "there must be an Icon present");

   t.equal(nodeModel.getLinkTargets().length, 1,
      "there must be one LinkTarget present");

   t.notEqual(nodeModel.getRichText(), null,
      "there must be a RichText node present");

   t.notEqual(nodeModel.getNote(), null,
      "there must be a RichText note present");

   //-------------------------------------------------------------------------
   // Test getting as xml, now that it's loaded.
   // Since the generation of the actual XML is tested elsewhere,
   // all we care about is that proper args are passed to the helper
   //-------------------------------------------------------------------------
   xml = nodeModel.getAsXml();

   t.equal(xmlHelpersStub.createXml.tagName, "node",
      "tagname must be passed properly");

   validateCreateXmlArgs(t, xmlHelpersStub.createXml, ATTRIBUTE_DEFAULTS,
                         ATTRIBUTES, UNEXPECTED_ATTRIBUTES,
                         EMBEDDED_TAGS, UNEXPECTED_TAGS);

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
                             null, ["Test Text"], null);
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
   const SINGLE_LINE = ['NEW Test Text'];
   const MULTIPLE_LINES = ['Line 1', 'Line 2'];
   let nodeModel;
   let origTimestamp;

   // Single line of text
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_NEW,
                             null, ['Test Text'], null);
   setModifiedStatusCount = 0;
   origTimestamp = nodeModel.getModifiedTimestamp();
   nodeModel.setText(SINGLE_LINE);

   t.equal(nodeModel.getText(), SINGLE_LINE,
      "getText() should reflect the new text -- single line");

   t.notEqual(nodeModel.getModifiedTimestamp, origTimestamp,
      "getText() should result in an updated timestamp");

   t.equal(setModifiedStatusCount, 1,
      "setText() should tell the MapModel a change was made");

   // Multiple lines
   setModifiedStatusCount = 0;
   origTimestamp = nodeModel.getModifiedTimestamp();
   nodeModel.setText(MULTIPLE_LINES);

   t.equal(nodeModel.getText(), MULTIPLE_LINES,
      "getText() should reflect the new text -- multiple lines");

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
                             null, ["Test Text"], null);
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
                               null, ["Parent Text"], null);

   setModifiedStatusCount = 0;
   origTimeStamp = parentModel.getModifiedTimestamp();

   childModel1 = parentModel.addChild(["Child Text1"]); // First child
   childModel2 = parentModel.addChild(["Child Text2"]); // Non-first child

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
                               null, ["Parent Text"], null);

   setModifiedStatusCount = 0;

   childModel1 = parentModel.addChild(["Child Text1"]);
   childModel2 = parentModel.addChild(["Child Text2"]);
   childModel1a = parentModel.addChildAfter(childModel1, ["Child Text1a"]);
   childModel2a = parentModel.addChildAfter(childModel2, ["Child Text2a"]);

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

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoArrowLinks = "<node></node>";
   xmlOneArrowLink = "<node><arrowlink/></node>";
   xmlMultipleArrowLinks = "<node><arrowlink/><arrowlink/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No ArrowLinks
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoArrowLinks, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   connectToNodeModelCount = 0;
   nodeModel.connectArrowLinks();
   t.equal(connectToNodeModelCount, 0,
      "connectToNodeModel() should not be called");

   //--------------------------------------------------------------------------
   // One ArrowLink
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), ["<arrowlink/>"], []);

   docElement = domParser.parseFromString(xmlOneArrowLink, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   connectToNodeModelCount = 0;
   nodeModel.connectArrowLinks();
   t.equal(connectToNodeModelCount, 1,
      "connectToNodeModel() should be called once");

   //--------------------------------------------------------------------------
   // Multiple ArrowLinks
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(
      ATTRIBUTES,
      new Map(),
      ["<arrowlink/>", "<arrowlink/>"],
      []
   );

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
                               null, ["Parent Text"], null);

   childModel1 = parentModel.addChild(["Child Text1"]);
   childModel2 = parentModel.addChild(["Child Text2"]);
   childModel3 = parentModel.addChild(["Child Text3"]);
   childModel4 = parentModel.addChild(["Child Text4"]);
   childModel5 = parentModel.addChild(["Child Text5"]);

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

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoArrowLinks = "<node></node>";
   xmlOneArrowLink = "<node><arrowlink/></node>";
   xmlMultipleArrowLinks = "<node><arrowlink/><arrowlink/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No ArrowLinks
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoArrowLinks, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getArrowLinks().length, 0,
      "there should be no ArrowLink on the nodeModel");

   //--------------------------------------------------------------------------
   // One ArrowLink
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), ["<arrowlink/>"], []);

   docElement = domParser.parseFromString(xmlOneArrowLink, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getArrowLinks().length, 1,
      "there should be one ArrowLink on the nodeModel");

   //--------------------------------------------------------------------------
   // Multiple ArrowLinks
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(
      ATTRIBUTES,
      new Map(),
      ["<arrowlink/>", "<arrowlink/>"],
      []
   );

   docElement = domParser.parseFromString(xmlMultipleArrowLinks, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getArrowLinks().length, 2,
      "there should be two ArrowLinks on the nodeModel");

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
                               null, ["Parent Text"], null);

   childModel1 = parentModel.addChild(["Child Text1"]);
   childModel2 = parentModel.addChild(["Child Text2"]);
   childModel3 = parentModel.addChild(["Child Text3"]);

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
   let xmlWithCloud;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoCloud = "<node></node>";
   xmlWithCloud = "<node><cloud/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No Cloud
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoCloud, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getCloudModel(), null,
      "there should be no Cloud on the nodeModel");

   //--------------------------------------------------------------------------
   // One Cloud
   //--------------------------------------------------------------------------
   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), ["<cloud/>"], []);

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
   let xmlWithFont;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoFont = "<node></node>";
   xmlWithFont = "<node><font/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No Font
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoFont, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getFont(), null,
      "there should be no Font on the nodeModel");

   //--------------------------------------------------------------------------
   // One Font
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), ["<font/>"], []);

   docElement = domParser.parseFromString(xmlWithFont, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.notEqual(nodeModel.getFont(), null,
      "there should be a Font on the nodeModel");

   t.end();
});

//-----------------------------------------------------------------------------
// getIcons
//-----------------------------------------------------------------------------
test('NodeModel - getIcons()', function(t) {
   let docElement;
   let domParser;
   let nodeModel;
   let xmlNoIcons;
   let xmlWithIcons;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoIcons = "<node></node>";
   xmlWithIcons = "<node><icon/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No Icons
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoIcons, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getIcons().length, 0,
      "there should be no Icons on the nodeModel");

   //--------------------------------------------------------------------------
   // One Icon
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), ["<icon/>"], []);

   docElement = domParser.parseFromString(xmlWithIcons, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getIcons().length, 1,
      "there should be an Icon on the nodeModel");

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

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoLinkTargets = "<node></node>";
   xmlOneLinkTarget = "<node><linktarget/></node>";
   xmlMultipleLinkTargets = "<node><linktarget/><linktarget/></node>";

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No LinkTargets
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoLinkTargets, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getLinkTargets().length, 0,
      "there should be no LinkTargets on the nodeModel");

   //--------------------------------------------------------------------------
   // One LinkTarget
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), ["<linktarget/>"], []);

   docElement = domParser.parseFromString(xmlOneLinkTarget, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getLinkTargets().length, 1,
      "there should be one LinkTarget on the nodeModel");

   //--------------------------------------------------------------------------
   // Multiple LinkTargets
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(
      ATTRIBUTES,
      new Map(),
      ["<linktarget/>", "<linktarget/>"],
      []
   );

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
   let xmlWithNote;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoNote = "<node></node>";
   xmlWithNote = '<node><richcontent TYPE="NOTE"/></node>';

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No note
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoNote, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getNote(), null,
      "nodeModel should not have a note on it");

   //--------------------------------------------------------------------------
   // With note
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(
      ATTRIBUTES,
      new Map(),
      ['<richcontent TYPE="NOTE"/>'],
      []
   );

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
                               null, ["Parent Text"], null);

   childModel = parentModel.addChild(["Child Text"]);

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
   let xmlWithRichText;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoRichText = "<node></node>";
   xmlWithRichText = '<node><richcontent TYPE="NODE"/></node>';

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No RichText
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoRichText, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.getRichText(), null,
      "nodeModel should not be richtext");

   //--------------------------------------------------------------------------
   // With RichText
   //--------------------------------------------------------------------------
   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(),
                                  ['<richcontent TYPE="NODE"/>'], []);

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
   let rootNodeModel;
   let xml;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel.
   // xmlNoSide - All attributes except 'position'
   // XmlWithSide - All attributes
   //--------------------------------------------------------------------------
   xml = '<node POSITION="left"></node>';

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(
      new Map(
         [["POSITION", "left"],
          ["TEXT", ""]
         ]
      ),
      new Map(),
      [],
      []
   );

   //--------------------------------------------------------------------------
   // Root node (no side)
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   docElement = domParser.parseFromString(xml, "text/xml")
                .documentElement;
   rootNodeModel = new NodeModel(controllerStub, mapModelStub,
                             NodeModel.TYPE_XML, null, null, docElement);
   t.equal(rootNodeModel.getSide(), NodeModel.POSITION_NONE,
      "nodeModel.getSide() should be 'none' for root nodes");

   //--------------------------------------------------------------------------
   // With side
   //--------------------------------------------------------------------------
   docElement = domParser.parseFromString(xml, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             rootNodeModel, null, docElement);
   t.equal(nodeModel.getSide(), "left",
      "nodeModel.getSide() should match input xml for children of root");

   t.end();
});

//-----------------------------------------------------------------------------
// getAsXml -XML line splitting
//-----------------------------------------------------------------------------
test("NodeModel - getText() - XML line splitting", function(t) {
   const MULTIPLE_LINES_INPUT = 'Line1\nLine2';
   const MULTIPLE_LINES_OUTPUT = 'Line1&#xa;Line2';
   let docElement;
   let expectedAttributes;
   let nodeModel;
   let parser;
   let xml;

   //--------------------------------------------------------------------------
   // Create a node with multiple lines of text
   //
   // First we have to create a copy of ATTRIBUTES (i.e. expected attributes),
   // so we can then modify TEXT to be what we expect to be sent to createXml
   //
   // And things are a bit goofy because, since we've stubbed out the function
   // that returns parsed XML, and that stub doesn't actually process
   // '&#xa;' as a newline character, have to pass '\n' when setting up the
   // stubbed function, but then when looking at the output, look for
   // '&#xa;'
   //--------------------------------------------------------------------------
   expectedAttributes = new Map();
   ATTRIBUTES.forEach(function (value, attributeName) {
      if (attributeName !== 'TEXT') {
         expectedAttributes.set(attributeName, value);
      } else {
         expectedAttributes.set(attributeName, MULTIPLE_LINES_INPUT);
      }
   });

   xmlHelpersStub.setupLoadXml(
      expectedAttributes,
      new Map(),
      [],
      []
   );

   // Since we've told the stub what to return, doesn't matter what xml we
   // pass it
   xml = '<node></node>';
   parser = new DOMParser();
   docElement = parser.parseFromString(xml, "text/xml").documentElement;

   nodeModel = new NodeModel(
      controllerStub,
      mapModelStub,
      NodeModel.TYPE_XML,
      null,
      null,
      docElement
   );

   //--------------------------------------------------------------------------
   // Now getAsXml() and confirm proper values were sent to our createXml stub
   // But remember to change the TEXT attribute to be what we're actually
   // expecting, which is slightly different than the input
   //--------------------------------------------------------------------------
   expectedAttributes.set('TEXT', MULTIPLE_LINES_OUTPUT);
   xml = nodeModel.getAsXml();

   validateCreateXmlArgs(t,
      xmlHelpersStub.createXml,
      ATTRIBUTE_DEFAULTS,
      expectedAttributes,
      new Map(),
      [],
      []
   );

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
   let xmlWithCloud;

   //--------------------------------------------------------------------------
   // Setup XML to load the NodeModel
   //--------------------------------------------------------------------------
   xmlNoCloud = "<node></node>";
   xmlWithCloud = '<node><cloud/></node>';

   //--------------------------------------------------------------------------
   //--------------------------------------------------------------------------
   domParser = new DOMParser();

   //--------------------------------------------------------------------------
   // No cloud
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), [], []);

   docElement = domParser.parseFromString(xmlNoCloud, "text/xml")
                .documentElement;
   nodeModel = new NodeModel(controllerStub, mapModelStub, NodeModel.TYPE_XML,
                             null, null, docElement);
   t.equal(nodeModel.hasCloud(), false,
      "nodeModel should not have a cloud");

   //--------------------------------------------------------------------------
   // With cloud
   //--------------------------------------------------------------------------

   // Tell the helper stub what to return
   xmlHelpersStub.setupLoadXml(ATTRIBUTES, new Map(), ["<cloud/>"], []);

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
                               null, ["Parent Text"], null);

   childModel = parentModel.addChild(["Child Text"]); // First child

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
                             null, ["Parent Text"], null);

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
                             null, ["Parent Text"], null);

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
