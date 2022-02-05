// Copyright 2022 Glen Reesor
//
// This file is part of m3 Mind Mapper.
//
// m3 Mind Mapper is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// m3 Mind Mapper is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
// details.
//
// You should have received a copy of the GNU General Public License along with
// m3 Mind Mapper. If not, see <https://www.gnu.org/licenses/>.

import * as m from 'mithril';
import App from './components/App';
import './styles/global.scss';
import BarlowRegularWoff from '../fonts/BarlowRegular.woff';
import BarlowRegularWoff2 from '../fonts/BarlowRegular.woff2';
import BarlowSemiBoldWoff from '../fonts/BarlowSemiBold.woff';
import BarlowSemiBoldWoff2 from '../fonts/BarlowSemiBold.woff2';

// These should be identical to the @font-face rules in styles/_fonts.scss. Both
// are included so there is a CSS fallback in case loading via JS fails for some
// reason. Sadly, we can't just use the same family 'Barlow' for both of these
// as we can in CSS (and toggle the font used just with the font-weight
// property), as FontFace overwrites on loading the second one (unlike CSS,
// which supports multiple @font-face rules for a single family).
const barlowRegularFont = new FontFace(
    'Barlow Regular',
    `local('Barlow'), url('${BarlowRegularWoff2}') format('woff2'), url('${BarlowRegularWoff}') format('woff')`,
    { style: 'normal', weight: '400' },
) as FontFace;
const barlowSemiBoldFont = new FontFace(
    'Barlow SemiBold',
    `local('Barlow'), url('${BarlowSemiBoldWoff2}') format('woff2'), url('${BarlowSemiBoldWoff}') format('woff')`,
    { style: 'normal', weight: '600' },
) as FontFace;

/**
 * Load the application.
 */
function loadApp() {
    m.mount(document.body, App);

    // Disable browser pull to refresh so dragging to scroll m3 content doesn't
    // trigger a refresh (thereby turfing any unsaved content)
    document.getElementsByTagName('body')[0].style.overscrollBehavior = 'contain';
}

// Must load fonts before mounting loading the application, otherwise initial
// canvas render won't use the bundled custom webfonts (as it doesn't trigger
// font loading via CSS like regular DOM elements). Always load the application
// despite any errors loading the bundled fonts.
barlowRegularFont.load().then((fontRegular: FontFace) => {
    document.fonts.add(fontRegular);

    barlowSemiBoldFont.load().then((fontSemiBold: FontFace) => {
        document.fonts.add(fontSemiBold);
        loadApp();
    }).catch(() => {
        loadApp();
    });
}).catch(() => {
    loadApp();
});
