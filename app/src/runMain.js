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

//----------------------------------------------------------------------------
// This can't be in a source file that gets pulled in for testing because:
//   - the test environment doesn't understand browser globals
//   - with proxyquire, you can only stub out functions--not immediately
//     executed code.
//----------------------------------------------------------------------------

import {App} from './App';
import {main} from './main';

// Must set m3Path here because it won't work if it's in a callback
App.setM3Path();
document.addEventListener('DOMContentLoaded', main);
