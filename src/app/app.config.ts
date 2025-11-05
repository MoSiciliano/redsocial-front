// import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideHttpClient, withFetch, withInterceptors,  } from '@angular/common/http';
// import { credentialsInterceptor } from './interceptors/cookiesInterceptors';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideHttpClient(withFetch(), withInterceptors([
//         credentialsInterceptor 
//       ])),
//   ]
// };
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Habilita el router de Angular
    provideRouter(routes),

    // Habilita HttpClient para hacer peticiones
    importProvidersFrom(HttpClientModule),
    provideHttpClient(withFetch()),
  ],
};