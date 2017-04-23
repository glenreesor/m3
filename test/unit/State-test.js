"use strict";

// Copyright 2015-2017 Glen Reesor
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
let State = require('../../app/src/State').State;

//-----------------------------------------------------------------------------
// Constructor - Defaults
//-----------------------------------------------------------------------------
test('State - Constructor', function (t) {
   let state;

   state = new State();

   t.equal(state.getState(), State.STATE_IDLE,
      "Default state should be idle");

   t.end();
});

//-----------------------------------------------------------------------------
// set/get pairs
//-----------------------------------------------------------------------------
test('State - set/get State()', function (t) {
   const newState = State.STATE_DIALOG_ABOUT;
   let state;

   state = new State();
   state.setState(newState);

   t.equal(state.getState(), newState,
      "getState() should reflect the new value");

   t.end();
});
