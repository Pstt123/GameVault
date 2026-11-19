import { createApp } from 'vue';
import { Quasar, Notify, Dialog, Loading } from 'quasar';

// Import Quasar icons and fonts
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css';

// Import Quasar CSS
import 'quasar/src/css/index.sass';

// Import existing app styles
import '../bootstrap.css';
import '../style.css';

import App from './App.vue';

const app = createApp(App);

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading
  },
  config: {
    notify: {
      position: 'top-right',
      timeout: 2500
    }
  }
});

app.mount('#app');
