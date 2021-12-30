import * as m from 'mithril';
import App from './components/App';

m.mount(document.body, App);

// Disable browser pull to refresh so dragging to scroll m3 content doesn't
// trigger a refresh (thereby turfing any unsaved content)
document.getElementsByTagName('body')[0].style.overscrollBehavior = 'contain';
