"use strict";
/*eslint max-len: [2, 800]*/

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

export let m3SampleXml = [
'<map version="1.0.1">',
'<!-- To view this file, download free mind mapping software FreeMind from http://freemind.sourceforge.net -->',
'<attribute_registry SHOW_ATTRIBUTES="hide"/>',
'<node CREATED="1462043698948" ID="ID_965050671" MODIFIED="1462043907151" STYLE="bubble" TEXT="m3 - Mobile Mind Mapper">',
'<node CREATED="1462039594280" ID="ID_1135851275" MODIFIED="1470274598327" POSITION="right" STYLE="bubble" TEXT="Features">',
'<cloud COLOR="#99ffff"/>',
'<node CREATED="1462040509054" ID="ID_543752747" MODIFIED="1462043731226" STYLE="bubble" TEXT="Different Colors">',
'<node CREATED="1462039771431" ID="ID_1470849767" MODIFIED="1462043731226" STYLE="bubble" TEXT="Clouds">',
'<node CREATED="1462039784694" ID="ID_228968498" MODIFIED="1462043731226" STYLE="bubble" TEXT="Purple Animals">',
'<cloud COLOR="#ff00ff"/>',
'<node CREATED="1462039803815" ID="ID_602618405" MODIFIED="1462043731226" STYLE="bubble" TEXT="Cows"/>',
'<node CREATED="1462039805285" ID="ID_237124399" MODIFIED="1462043731226" STYLE="bubble" TEXT="Pigs"/>',
'<node CREATED="1462039806915" ID="ID_1661353133" MODIFIED="1462043731226" STYLE="bubble" TEXT="Chickens"/>',
'</node>',
'<node CREATED="1462039824903" ID="ID_876831829" MODIFIED="1462043731226" STYLE="bubble" TEXT="Yellow Rocks">',
'<cloud COLOR="#ffff99"/>',
'<node CREATED="1462039858713" ID="ID_1157739208" MODIFIED="1462043731226" STYLE="bubble" TEXT="Big"/>',
'<node CREATED="1462039860350" ID="ID_519651365" MODIFIED="1462043731226" STYLE="bubble" TEXT="Medium"/>',
'<node CREATED="1462039863328" ID="ID_1991617145" MODIFIED="1462043731226" STYLE="bubble" TEXT="Small"/>',
'</node>',
'</node>',
'<node CREATED="1462039600142" ID="ID_234362439" MODIFIED="1462043731226" STYLE="bubble" TEXT="Text">',
'<node COLOR="#ff0000" CREATED="1462039606556" ID="ID_1266657645" MODIFIED="1462043731226" STYLE="bubble" TEXT="Red">',
'<linktarget COLOR="#ff0000" DESTINATION="ID_1266657645" ENDARROW="Default" ENDINCLINATION="572;0;" ID="Arrow_ID_1904290717" SOURCE="ID_1771718963" STARTARROW="None" STARTINCLINATION="572;0;"/>',
'</node>',
'<node COLOR="#3333ff" CREATED="1462039607781" ID="ID_206596956" MODIFIED="1462043731226" STYLE="bubble" TEXT="Blue"/>',
'<node COLOR="#00cc33" CREATED="1462039609275" ID="ID_695741716" MODIFIED="1462043731226" STYLE="bubble" TEXT="Green"/>',
'</node>',
'<node CREATED="1462039616965" ID="ID_1588515364" MODIFIED="1462043731227" STYLE="bubble" TEXT="Backgrounds">',
'<node BACKGROUND_COLOR="#ff0000" CREATED="1462039622749" ID="ID_1760936862" MODIFIED="1462043731227" STYLE="bubble" TEXT="Red"/>',
'<node BACKGROUND_COLOR="#3333ff" CREATED="1462039624144" ID="ID_1678805805" MODIFIED="1462043731227" STYLE="bubble" TEXT="Blue">',
'<linktarget COLOR="#3333ff" DESTINATION="ID_1678805805" ENDARROW="Default" ENDINCLINATION="549;0;" ID="Arrow_ID_1495165921" SOURCE="ID_1771718963" STARTARROW="None" STARTINCLINATION="549;0;"/>',
'</node>',
'<node BACKGROUND_COLOR="#00cc00" CREATED="1462039626188" ID="ID_549643898" MODIFIED="1462043731227" STYLE="bubble" TEXT="Green"/>',
'</node>',
'</node>',
'<node CREATED="1462039882868" ID="ID_253584333" MODIFIED="1462043731227" STYLE="bubble" TEXT="Different formatting">',
'<node CREATED="1462039890257" ID="ID_968077355" MODIFIED="1462043731227" STYLE="bubble" TEXT="Bold">',
'<font BOLD="true" NAME="SansSerif" SIZE="12"/>',
'</node>',
'<node CREATED="1462039893215" ID="ID_356197729" MODIFIED="1462043731227" STYLE="bubble" TEXT="Italic">',
'<font ITALIC="true" NAME="SansSerif" SIZE="12"/>',
'</node>',
'<node CREATED="1462039895508" ID="ID_635764115" MODIFIED="1462043731227" STYLE="bubble" TEXT="Big">',
'<font NAME="SansSerif" SIZE="15"/>',
'</node>',
'<node CREATED="1462039897496" ID="ID_705340948" MODIFIED="1462043731227" STYLE="bubble" TEXT="Small">',
'<font NAME="SansSerif" SIZE="10"/>',
'</node>',
'<node CREATED="1462040612489" ID="ID_700562846" MODIFIED="1468754256661" STYLE="bubble" TEXT="Rich Text (html)">',
'<node CREATED="1462039899280" ID="ID_1985907620" MODIFIED="1462043731227" STYLE="bubble">',
'<richcontent TYPE="NODE"><html>',
'  <head>',
'',
'  </head>',
'  <body>',
'    <p>',
'      Bullets',
'    </p>',
'    <ul>',
'      <li>',
'        Bullet 1',
'      </li>',
'      <li>',
'        Bullet 2',
'      </li>',
'    </ul>',
'    <p>',
'      <font color="#ff3333">Red</font>, <font color="#0000ff">blue</font>, <font color="#00cc00">green</font>.',
'    </p>',
'    <p>',
'      Tables:',
'    </p>',
'    <table>',
'      <tr>',
'        <td>',
'          1',
'        </td>',
'        <td>',
'          2',
'        </td>',
'      </tr>',
'      <tr>',
'        <td>',
'          3',
'        </td>',
'        <td>',
'          4',
'        </td>',
'      </tr>',
'    </table>',
'  </body>',
'</html></richcontent>',
'</node>',
'<node CREATED="1468754257821" ID="ID_1986636695" MODIFIED="1469533105076">',
'<richcontent TYPE="NODE"><html>',
'  <head>',
'',
'  </head>',
'  <body>',
'    <p>',
'      A really long node.',
'    </p>',
'    <p>',
'',
'    </p>',
'    <p>',
'      Ninja? You\'re a ninja? Get out of here, you\'re a ninja! Yes, I am a ninja. I read the rules before I broke \'em I broke the chains before they choked me out Now I pay close attention really learn the code I learned to read the map before I hit the road',
'    </p>',
'  </body>',
'</html></richcontent>',
'</node>',
'<node CREATED="1469934418119" ID="ID_1967313735" MODIFIED="1469934423772" TEXT="Special case: one word richtext node">',
'<node CREATED="1469934426226" ID="ID_1652611240" MODIFIED="1469934454851">',
'<richcontent TYPE="NODE"><html>',
'  <head>',
'    ',
'  </head>',
'  <body>',
'    <p>',
'      test',
'    </p>',
'  </body>',
'</html></richcontent>',
'</node>',
'</node>',
'</node>',
'<node CREATED="1468754702243" ID="ID_1570168724" MODIFIED="1468754714646" TEXT="Really long non-rich text nodes">',
'<node CREATED="1468760777021" ID="ID_308262894" MODIFIED="1468760814561" TEXT="Really Big">',
'<font NAME="SansSerif" SIZE="20"/>',
'<node CREATED="1468754724438" ID="ID_375984957" MODIFIED="1469533154104" TEXT="A really long node.&#xa;&#xa;Ninja? You&apos;re a ninja? Get out of here, you&apos;re a ninja! Yes, I am a ninja. I read the rules before I broke &apos;em I broke the chains before they choked me out Now I pay close attention really learn the code I learned to read the map before I hit the road&#xa;&#xa;And a short line after a blank line.&#xa;Here&apos;s another line.">',
'<font NAME="SansSerif" SIZE="21"/>',
'</node>',
'</node>',
'<node CREATED="1468760841005" ID="ID_835550514" MODIFIED="1468760843115" TEXT="Normal size">',
'<node CREATED="1468760851979" ID="ID_52708837" MODIFIED="1469936866119" TEXT="Another really long node.&#xa;&#xa;Ninja? You&apos;re a ninja? Get out of here, you&apos;re a ninja! Yes, I am a ninja. I read the rules before I broke &apos;em I broke the chains before they choked me out Now I pay close attention really learn the code I learned to read the map before I hit the road&#xa;&#xa;And a short line after a blank line.&#xa;Here&apos;s another line."/>',
'</node>',
'</node>',
'</node>',
'<node CREATED="1462040209794" ID="ID_1450398116" MODIFIED="1462043731228" STYLE="bubble" TEXT="Graphical links to other nodes">',
'<node CREATED="1462040216844" ID="ID_1771718963" MODIFIED="1462043731228" STYLE="bubble" TEXT="This links to the red text node and the blue background node">',
'<arrowlink COLOR="#ff0000" DESTINATION="ID_1266657645" ENDARROW="Default" ENDINCLINATION="572;0;" ID="Arrow_ID_1904290717" STARTARROW="None" STARTINCLINATION="572;0;"/>',
'<arrowlink COLOR="#3333ff" DESTINATION="ID_1678805805" ENDARROW="Default" ENDINCLINATION="549;0;" ID="Arrow_ID_1495165921" STARTARROW="None" STARTINCLINATION="549;0;"/>',
'</node>',
'<node CREATED="1462040222313" ID="ID_1869202189" MODIFIED="1462043731228" STYLE="bubble" TEXT="This links to the node below">',
'<arrowlink COLOR="#cc00cc" DESTINATION="ID_80610701" ENDARROW="Default" ENDINCLINATION="24;0;" ID="Arrow_ID_1717134933" STARTARROW="None" STARTINCLINATION="24;0;"/>',
'</node>',
'<node CREATED="1462041692666" ID="ID_80610701" MODIFIED="1462043731228" STYLE="bubble" TEXT="This is a boring child node">',
'<linktarget COLOR="#cc00cc" DESTINATION="ID_80610701" ENDARROW="Default" ENDINCLINATION="24;0;" ID="Arrow_ID_1717134933" SOURCE="ID_1869202189" STARTARROW="None" STARTINCLINATION="24;0;"/>',
'</node>',
'<node CREATED="1462040233996" ID="ID_527744129" MODIFIED="1462043731228" STYLE="bubble" TEXT="This links to the other side.">',
'<arrowlink COLOR="#000000" DESTINATION="ID_269173357" ENDARROW="Default" ENDINCLINATION="1093;0;" ID="Arrow_ID_980643324" STARTARROW="None" STARTINCLINATION="1093;0;"/>',
'</node>',
'</node>',
'<node CREATED="1462041374253" ID="ID_1891273051" MODIFIED="1470260712736" STYLE="bubble" TEXT="Links">',
'<node CREATED="1462041421915" ID="ID_1913764655" LINK="http://GlenReesor.ca" MODIFIED="1462043731229" STYLE="bubble" TEXT="To external websites (http://GlenReesor.ca)"/>',
'</node>',
'<node CREATED="1473001706623" ID="ID_284570804" MODIFIED="1473001707763" TEXT="Icons">',
'<node CREATED="1470260753854" ID="ID_572705782" MODIFIED="1470260761493" TEXT="This node has multiple icons">',
'<icon BUILTIN="full-1"/>',
'<icon BUILTIN="full-2"/>',
'</node>',
'<node CREATED="1470273954850" ID="ID_1601662317" MODIFIED="1470273981369" TEXT="These nodes show all the Freemind / Freeplane builtin icons">',
'<node CREATED="1470274559574" FOLDED="true" ID="ID_668463232" MODIFIED="1473001726633" TEXT="Group 1">',
'<node CREATED="1470273985949" ID="ID_1683765005" MODIFIED="1470276740172" TEXT="Idea">',
'<icon BUILTIN="idea"/>',
'</node>',
'<node CREATED="1470273992576" ID="ID_1653988593" MODIFIED="1470276743806" TEXT="Question">',
'<icon BUILTIN="help"/>',
'</node>',
'<node CREATED="1470274023079" ID="ID_1973136326" MODIFIED="1470276767375" TEXT="Important 1">',
'<icon BUILTIN="yes"/>',
'</node>',
'<node CREATED="1470276768290" ID="ID_537458964" MODIFIED="1470276773665" TEXT="Important 2">',
'<icon BUILTIN="messagebox_warning"/>',
'</node>',
'<node CREATED="1470274030662" ID="ID_187644575" MODIFIED="1470276777433" TEXT="Stop">',
'<icon BUILTIN="stop-sign"/>',
'</node>',
'<node CREATED="1470274042971" ID="ID_1017890612" MODIFIED="1470276780936" TEXT="No Entry">',
'<icon BUILTIN="closed"/>',
'</node>',
'<node CREATED="1470274053628" ID="ID_1483103017" MODIFIED="1470276784182" TEXT="Info">',
'<icon BUILTIN="info"/>',
'</node>',
'<node CREATED="1470274078444" ID="ID_13358781" MODIFIED="1470276792667" TEXT="OK">',
'<icon BUILTIN="button_ok"/>',
'</node>',
'<node CREATED="1470274090651" ID="ID_761210473" MODIFIED="1470276795877" TEXT="Not OK">',
'<icon BUILTIN="button_cancel"/>',
'</node>',
'<node CREATED="1470274102733" ID="ID_599523701" MODIFIED="1470276799244" TEXT="Priority 1">',
'<icon BUILTIN="full-1"/>',
'</node>',
'<node CREATED="1470274105237" ID="ID_892391816" MODIFIED="1470276802697" TEXT="Priority 2">',
'<icon BUILTIN="full-2"/>',
'</node>',
'<node CREATED="1470274107179" ID="ID_981611964" MODIFIED="1470276813307" TEXT="Priority 3">',
'<icon BUILTIN="full-3"/>',
'</node>',
'<node CREATED="1470274108911" ID="ID_496039830" MODIFIED="1470276817114" TEXT="Priority 4">',
'<icon BUILTIN="full-4"/>',
'</node>',
'<node CREATED="1470274110815" ID="ID_832423001" MODIFIED="1470276821256" TEXT="Priority 5">',
'<icon BUILTIN="full-5"/>',
'</node>',
'<node CREATED="1470274113241" ID="ID_792124145" MODIFIED="1470276824332" TEXT="Priority 6">',
'<icon BUILTIN="full-6"/>',
'</node>',
'<node CREATED="1470274115931" ID="ID_1391931812" MODIFIED="1470276827613" TEXT="Priority 7">',
'<icon BUILTIN="full-7"/>',
'</node>',
'<node CREATED="1470274119703" ID="ID_144513057" MODIFIED="1470276835355" TEXT="Priority 8">',
'<icon BUILTIN="full-8"/>',
'</node>',
'<node CREATED="1470274121765" ID="ID_1645124097" MODIFIED="1470276838771" TEXT="Priority 9">',
'<icon BUILTIN="full-9"/>',
'</node>',
'<node CREATED="1470274124300" ID="ID_1763612700" MODIFIED="1470276841883" TEXT="Priority 0">',
'<icon BUILTIN="full-0"/>',
'</node>',
'</node>',
'<node CREATED="1470274608271" FOLDED="true" ID="ID_582923239" MODIFIED="1470276897308" TEXT="Group 2">',
'<node CREATED="1470274147677" ID="ID_956666502" MODIFIED="1470276848415" TEXT="Red Traffic Light">',
'<icon BUILTIN="stop"/>',
'</node>',
'<node CREATED="1470274150920" ID="ID_1420477201" MODIFIED="1470276851963" TEXT="Yellow Traffic Light">',
'<icon BUILTIN="prepare"/>',
'</node>',
'<node CREATED="1470274155218" ID="ID_1735979867" MODIFIED="1470276856085" TEXT="Green Traffic Light">',
'<icon BUILTIN="go"/>',
'</node>',
'<node CREATED="1470274167775" ID="ID_3681512" MODIFIED="1470276859201" TEXT="Back">',
'<icon BUILTIN="back"/>',
'</node>',
'<node CREATED="1470274168880" ID="ID_624074490" MODIFIED="1470276862916" TEXT="Forward">',
'<icon BUILTIN="forward"/>',
'</node>',
'<node CREATED="1470274170733" ID="ID_315111875" MODIFIED="1470276866647" TEXT="Up">',
'<icon BUILTIN="up"/>',
'</node>',
'<node CREATED="1470274171728" ID="ID_205686789" MODIFIED="1470276870355" TEXT="Down">',
'<icon BUILTIN="down"/>',
'</node>',
'<node CREATED="1470274180091" ID="ID_1019269892" MODIFIED="1470276873977" TEXT="Look here">',
'<icon BUILTIN="attach"/>',
'</node>',
'<node CREATED="1470274194228" ID="ID_307402528" MODIFIED="1470276877527" TEXT="I am happy">',
'<icon BUILTIN="ksmiletris"/>',
'</node>',
'<node CREATED="1470274196889" ID="ID_1307032671" MODIFIED="1470276880640" TEXT="No Mind">',
'<icon BUILTIN="smiley-neutral"/>',
'</node>',
'<node CREATED="1470274210422" ID="ID_739849392" MODIFIED="1470276883984" TEXT="Surprising">',
'<icon BUILTIN="smiley-oh"/>',
'</node>',
'<node CREATED="1470274221182" ID="ID_588227889" MODIFIED="1470276890781" TEXT="Angry">',
'<icon BUILTIN="smiley-angry"/>',
'</node>',
'<node CREATED="1470274224458" ID="ID_1534482285" MODIFIED="1470276895008" TEXT="I&apos;m not amused">',
'<icon BUILTIN="smily_bad"/>',
'</node>',
'</node>',
'<node CREATED="1470274624591" FOLDED="true" ID="ID_748072325" MODIFIED="1470276973751" TEXT="Group 3">',
'<node CREATED="1470274233231" ID="ID_1191599385" MODIFIED="1470276901745" TEXT="Dangerous">',
'<icon BUILTIN="clanbomber"/>',
'</node>',
'<node CREATED="1470274238846" ID="ID_1365733790" MODIFIED="1470276905596" TEXT="Do not forget">',
'<icon BUILTIN="desktop_new"/>',
'</node>',
'<node CREATED="1470274245360" ID="ID_1671495105" MODIFIED="1470276911211" TEXT="Home">',
'<icon BUILTIN="gohome"/>',
'</node>',
'<node CREATED="1470274267522" ID="ID_1589688448" MODIFIED="1470276915427" TEXT="Folder">',
'<icon BUILTIN="folder"/>',
'</node>',
'<node CREATED="1470274273537" ID="ID_727976504" MODIFIED="1470276920477" TEXT="Mailbox">',
'<icon BUILTIN="korn"/>',
'</node>',
'<node CREATED="1470274278659" ID="ID_1694584818" MODIFIED="1470276932090" TEXT="Mail">',
'<icon BUILTIN="Mail"/>',
'</node>',
'<node CREATED="1470274285964" ID="ID_467765651" MODIFIED="1470276936379" TEXT="Email">',
'<icon BUILTIN="kmail"/>',
'</node>',
'<node CREATED="1470274292398" ID="ID_975920144" MODIFIED="1470276941960" TEXT="List">',
'<icon BUILTIN="list"/>',
'</node>',
'<node CREATED="1470274302438" ID="ID_1286895171" MODIFIED="1470276947728" TEXT="Refine">',
'<icon BUILTIN="edit"/>',
'</node>',
'<node CREATED="1470274311659" ID="ID_1291926377" MODIFIED="1470276951592" TEXT="Phone">',
'<icon BUILTIN="kaddressbook"/>',
'</node>',
'<node CREATED="1470274326774" ID="ID_860951320" MODIFIED="1470276955045" TEXT="Music">',
'<icon BUILTIN="knotify"/>',
'</node>',
'<node CREATED="1470274332891" ID="ID_1795589734" MODIFIED="1470276958327" TEXT="Key">',
'<icon BUILTIN="password"/>',
'</node>',
'<node CREATED="1470274344524" ID="ID_34588906" MODIFIED="1470276971748" TEXT="To be refined">',
'<icon BUILTIN="pencil"/>',
'</node>',
'</node>',
'<node CREATED="1470274638580" FOLDED="true" ID="ID_1874826012" MODIFIED="1470277041855" TEXT="Group 4">',
'<node CREATED="1470274353376" ID="ID_296801429" MODIFIED="1470276982180" TEXT="Magic">',
'<icon BUILTIN="wizard"/>',
'</node>',
'<node CREATED="1470274354931" ID="ID_1275105670" MODIFIED="1470276992469" TEXT="To be discussed">',
'<icon BUILTIN="xmag"/>',
'</node>',
'<node CREATED="1470274366007" ID="ID_328964528" MODIFIED="1470277004173" TEXT="Remember">',
'<icon BUILTIN="bell"/>',
'</node>',
'<node CREATED="1470274368445" ID="ID_309673775" MODIFIED="1470277009855" TEXT="Excellent">',
'<icon BUILTIN="bookmark"/>',
'</node>',
'<node CREATED="1470274379311" ID="ID_1897787974" MODIFIED="1470277012969" TEXT="Linux">',
'<icon BUILTIN="penguin"/>',
'</node>',
'<node CREATED="1470274387083" ID="ID_983157650" MODIFIED="1470277017307" TEXT="Nice">',
'<icon BUILTIN="licq"/>',
'</node>',
'<node CREATED="1470274391915" ID="ID_1108900660" MODIFIED="1470277020239" TEXT="FreeMind">',
'<icon BUILTIN="freemind_butterfly"/>',
'</node>',
'<node CREATED="1470274400735" ID="ID_168308138" MODIFIED="1470277023788" TEXT="Broken">',
'<icon BUILTIN="broken-line"/>',
'</node>',
'<node CREATED="1470274410906" ID="ID_1113265925" MODIFIED="1470277027688" TEXT="Date">',
'<icon BUILTIN="calendar"/>',
'</node>',
'<node CREATED="1470274411797" ID="ID_1111239625" MODIFIED="1470277032229" TEXT="Time">',
'<icon BUILTIN="clock"/>',
'</node>',
'<node CREATED="1470274465359" ID="ID_592894369" MODIFIED="1470277036217" TEXT="Waiting">',
'<icon BUILTIN="hourglass"/>',
'</node>',
'<node CREATED="1470274467085" ID="ID_1370398070" MODIFIED="1470277040084" TEXT="Launch">',
'<icon BUILTIN="launch"/>',
'</node>',
'</node>',
'<node CREATED="1470274649253" FOLDED="true" ID="ID_531121682" MODIFIED="1470277093600" TEXT="Group 5">',
'<node CREATED="1470274472252" ID="ID_414874810" MODIFIED="1470277045730" TEXT="Black Flag">',
'<icon BUILTIN="flag-black"/>',
'</node>',
'<node CREATED="1470274484319" ID="ID_1449934992" MODIFIED="1470277049326" TEXT="Blue Flag">',
'<icon BUILTIN="flag-blue"/>',
'</node>',
'<node CREATED="1470274489820" ID="ID_155731585" MODIFIED="1470277053142" TEXT="Green Flag">',
'<icon BUILTIN="flag-green"/>',
'</node>',
'<node CREATED="1470274495129" ID="ID_1527549372" MODIFIED="1470277055940" TEXT="Orange Flag">',
'<icon BUILTIN="flag-orange"/>',
'</node>',
'<node CREATED="1470274501951" ID="ID_1373829229" MODIFIED="1470277059198" TEXT="Pink Flag">',
'<icon BUILTIN="flag-pink"/>',
'</node>',
'<node CREATED="1470274506959" ID="ID_292618678" MODIFIED="1470277062906" TEXT="Yellow Flag">',
'<icon BUILTIN="flag-yellow"/>',
'</node>',
'<node CREATED="1470274513363" ID="ID_1395471563" MODIFIED="1470277067586" TEXT="Family">',
'<icon BUILTIN="family"/>',
'</node>',
'<node CREATED="1470274519190" ID="ID_859669466" MODIFIED="1470277070770" TEXT="Female1">',
'<icon BUILTIN="female1"/>',
'</node>',
'<node CREATED="1470274524607" ID="ID_420485161" MODIFIED="1470277074549" TEXT="Female2">',
'<icon BUILTIN="female2"/>',
'</node>',
'<node CREATED="1470274529743" ID="ID_970036659" MODIFIED="1470277079383" TEXT="Male1">',
'<icon BUILTIN="male1"/>',
'</node>',
'<node CREATED="1470274534818" ID="ID_1623985814" MODIFIED="1470277083525" TEXT="Male2">',
'<icon BUILTIN="male2"/>',
'</node>',
'<node CREATED="1470274541397" ID="ID_1792980015" MODIFIED="1470277087073" TEXT="Females">',
'<icon BUILTIN="fema"/>',
'</node>',
'<node CREATED="1470274543150" ID="ID_440597757" MODIFIED="1470277091521" TEXT="Group">',
'<icon BUILTIN="group"/>',
'</node>',
'</node>',
'<node CREATED="1470782717713" FOLDED="true" ID="ID_98980111" MODIFIED="1470785628121" TEXT="Freeplane Only">',
'<node CREATED="1470782909748" FOLDED="true" ID="ID_647784643" MODIFIED="1470785577813" TEXT="Group 1">',
'<node CREATED="1470782723393" ID="ID_144981814" MODIFIED="1470785527138" TEXT=" Checked">',
'<icon BUILTIN="checked"/>',
'</node>',
'<node CREATED="1470782740632" ID="ID_230429347" MODIFIED="1470785533530" TEXT="Unchecked">',
'<icon BUILTIN="unchecked"/>',
'</node>',
'<node CREATED="1470782745648" ID="ID_283962017" MODIFIED="1470785538497" TEXT="Very Negative">',
'<icon BUILTIN="very_negative"/>',
'</node>',
'<node CREATED="1470782751460" ID="ID_357044565" MODIFIED="1470785542311" TEXT="Negative">',
'<icon BUILTIN="negative"/>',
'</node>',
'<node CREATED="1470782756181" ID="ID_1927982531" MODIFIED="1470785545768" TEXT="Positive">',
'<icon BUILTIN="positive"/>',
'</node>',
'<node CREATED="1470782761489" ID="ID_1266905311" MODIFIED="1470785551207" TEXT="Very Positive">',
'<icon BUILTIN="very_positive"/>',
'</node>',
'<node CREATED="1470782766664" ID="ID_1280504173" MODIFIED="1470785553952" TEXT="0%">',
'<icon BUILTIN="0%"/>',
'</node>',
'<node CREATED="1470782771351" ID="ID_1511742791" MODIFIED="1470785556750" TEXT="25%">',
'<icon BUILTIN="25%"/>',
'</node>',
'<node CREATED="1470782789124" ID="ID_789171747" MODIFIED="1470785559445" TEXT="50%">',
'<icon BUILTIN="50%"/>',
'</node>',
'<node CREATED="1470782797378" ID="ID_128192868" MODIFIED="1470785561767" TEXT="75%">',
'<icon BUILTIN="75%"/>',
'</node>',
'<node CREATED="1470782802902" ID="ID_750490425" MODIFIED="1470785564554" TEXT="100%">',
'<icon BUILTIN="100%"/>',
'</node>',
'<node CREATED="1470782807624" ID="ID_977396693" MODIFIED="1470785568817" TEXT="Revision">',
'<icon BUILTIN="revision"/>',
'</node>',
'<node CREATED="1470782816813" ID="ID_1072450545" MODIFIED="1470785572134" TEXT="Video">',
'<icon BUILTIN="video"/>',
'</node>',
'<node CREATED="1470782822209" ID="ID_1537874305" MODIFIED="1470785575406" TEXT="Audio">',
'<icon BUILTIN="audio"/>',
'</node>',
'</node>',
'<node CREATED="1470782911563" FOLDED="true" ID="ID_857740039" MODIFIED="1470785625728" TEXT="Group 2">',
'<node CREATED="1470782827803" ID="ID_1016790807" MODIFIED="1470785585777" TEXT="Executable">',
'<icon BUILTIN="executable"/>',
'</node>',
'<node CREATED="1470782832460" ID="ID_26688633" MODIFIED="1470785589152" TEXT="Image">',
'<icon BUILTIN="image"/>',
'</node>',
'<node CREATED="1470782837595" ID="ID_1439710736" MODIFIED="1470785592894" TEXT="Internet">',
'<icon BUILTIN="internet"/>',
'</node>',
'<node CREATED="1470782842325" ID="ID_1060693777" MODIFIED="1470785597702" TEXT="Internet warning">',
'<icon BUILTIN="internet_warning"/>',
'</node>',
'<node CREATED="1470782848010" ID="ID_406699905" MODIFIED="1470785601203" TEXT="Mind Map">',
'<icon BUILTIN="mindmap"/>',
'</node>',
'<node CREATED="1470782855688" ID="ID_475247795" MODIFIED="1470785604874" TEXT="Narrative">',
'<icon BUILTIN="narrative"/>',
'</node>',
'<node CREATED="1470782860622" ID="ID_1023015401" MODIFIED="1470785607417" TEXT="Freeplane">',
'<icon BUILTIN="bee"/>',
'</node>',
'<node CREATED="1470782866886" ID="ID_1762232749" MODIFIED="1470785610697" TEXT="Addition">',
'<icon BUILTIN="addition"/>',
'</node>',
'<node CREATED="1470782871992" ID="ID_272870218" MODIFIED="1470785614507" TEXT="Subtraction">',
'<icon BUILTIN="subtraction"/>',
'</node>',
'<node CREATED="1470782876574" ID="ID_10259998" MODIFIED="1470785618862" TEXT="Multiplication">',
'<icon BUILTIN="multiplication"/>',
'</node>',
'<node CREATED="1470782881875" ID="ID_153253704" MODIFIED="1470785622421" TEXT="Division">',
'<icon BUILTIN="division"/>',
'</node>',
'</node>',
'</node>',
'<node CREATED="1470783526913" ID="ID_191527156" MODIFIED="1470783534186" TEXT="m3">',
'<icon BUILTIN="m3"/>',
'</node>',
'</node>',
'</node>',
'<node CREATED="1462040666765" ID="ID_213651658" MODIFIED="1462043731228" STYLE="bubble" TEXT="Load and save maps in your browser"/>',
'<node CREATED="1462040672436" ID="ID_1187470067" MODIFIED="1462043731228" STYLE="bubble" TEXT="Import/Export from/to text files, in Freemind/Freeplane format"/>',
'</node>',
'<node CREATED="1462040721011" ID="ID_1088397126" MODIFIED="1462043731228" POSITION="right" STYLE="bubble" TEXT="Other Freemind Features (not yet supported)">',
'<cloud COLOR="#66ffcc"/>',
'<node CREATED="1462040732819" ID="ID_1759561712" MODIFIED="1462043731228" STYLE="bubble" TEXT="Node formatting">',
'<node CREATED="1462040848317" ID="ID_528831839" MODIFIED="1462043736736" STYLE="fork" TEXT="Forks"/>',
'<node CREATED="1462040850220" ID="ID_1795119427" MODIFIED="1462043731229" STYLE="bubble" TEXT="Bubbles"/>',
'</node>',
'<node CREATED="1462041374253" ID="ID_712536007" MODIFIED="1462043731229" STYLE="bubble" TEXT="Links">',
'<node CREATED="1462041377019" ID="ID_181285237" LINK="#ID_237124399" MODIFIED="1462043731229" STYLE="bubble" TEXT="To nodes within the same map (Pigs in this case)"/>',
'</node>',
'<node CREATED="1462041459526" ID="ID_212229780" MODIFIED="1462043731230" STYLE="bubble" TEXT="Edge Formatting">',
'<node CREATED="1462041463744" ID="ID_377098184" MODIFIED="1462043731185" STYLE="bubble" TEXT="Linear">',
'<edge STYLE="linear"/>',
'</node>',
'<node CREATED="1462041468021" ID="ID_1583676433" MODIFIED="1462043731230" STYLE="bubble" TEXT="Red">',
'<edge COLOR="#ff0000"/>',
'</node>',
'<node CREATED="1462041474448" ID="ID_1262239804" MODIFIED="1462043731230" STYLE="bubble" TEXT="Thick">',
'<edge WIDTH="8"/>',
'</node>',
'</node>',
'<node CREATED="1462041512539" ID="ID_1407758860" MODIFIED="1462043731230" STYLE="bubble" TEXT="Attributes and Notes">',
'<node CREATED="1462041516564" ID="ID_1142622762" MODIFIED="1462044372931" STYLE="bubble" TEXT="This has an attribute">',
'<attribute NAME="Attribute1" VALUE="Value1"/>',
'</node>',
'<node CREATED="1462041521755" ID="ID_1835471477" MODIFIED="1462043731230" STYLE="bubble" TEXT="This has a note">',
'<richcontent TYPE="NOTE"><html>',
'  <head>',
'',
'  </head>',
'  <body>',
'    <p>',
'      Here is a beautiful note',
'    </p>',
'    <p>',
'      It uses <b><font color="#ff0000">rich</font></b>&#160;formatting',
'    </p>',
'  </body>',
'</html></richcontent>',
'</node>',
'</node>',
'<node CREATED="1462041754498" ID="ID_208132770" MODIFIED="1462043731230" STYLE="bubble" TEXT="User Interface">',
'<node CREATED="1462041769405" ID="ID_1909791806" MODIFIED="1462043731230" STYLE="bubble" TEXT="Undo / Redo"/>',
'<node CREATED="1462041773883" ID="ID_726015204" MODIFIED="1462043731230" STYLE="bubble" TEXT="Cut / Paste"/>',
'<node CREATED="1462041776386" ID="ID_1038038367" MODIFIED="1462043731230" STYLE="bubble" TEXT="Moving child nodes up and down"/>',
'</node>',
'</node>',
'<node CREATED="1462040192545" ID="ID_661377408" MODIFIED="1462040201008" POSITION="left" TEXT="Nodes on both sides of the root">',
'<node CREATED="1462040240344" ID="ID_269173357" MODIFIED="1462040367916" TEXT="Child Node">',
'<linktarget COLOR="#000000" DESTINATION="ID_269173357" ENDARROW="Default" ENDINCLINATION="1093;0;" ID="Arrow_ID_980643324" SOURCE="ID_527744129" STARTARROW="None" STARTINCLINATION="1093;0;"/>',
'</node>',
'</node>',
'</node>',
'</map>'];
