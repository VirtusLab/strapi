# strapi-plugin-upload

### Config

You can override default config via added in `config/plugins.js` section:

```js
    upload: {
      enabled: true,
      breakpoints: {
        large: 1000,
        medium: 750,
        small: 500
      }
      supportImagesTypes: ['jpeg', 'png', 'webp', 'tiff']
  }
```
