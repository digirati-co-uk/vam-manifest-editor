# VAM Manifest Editor

The project is a IIIF Manifest Editor implementation specific for `VAM-Slideshow` and `VAM-Zoomable-Annotation` viewers.

**Demo**

https://vam-manifest-editor.netlify.com/


## Local development 

Install pre-requirements:

```
yarn
```

Start the development server:

```
yarn start
```

## Build for Production 

Start the development server:

```
yarn && yarn build
```

The `dist` folder contains the build. It is a static site.


## Configuration options:

TODO: collection server location


## Integration

### Iframe using the demo site:

```
<iframe src="https://vam-manifest-editor.netlify.com/" width="1440" height="768"></iframe>
```

### Iframe using the static build served by `nginx`

1. build the static site:

```
yarn && yarn release
```

2. copy the files on the server machine 

```
cp ~/vam-manifest-editor/dist /var/www/vam-manifest-editor
```

3. configure nginx, add tne manifest editor route to your server (location directive):


```
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name vam.com www.vam.com;
  
  ...
  
  location /manifest-editor {
    index index.html;
    root /var/www/vam-manifest-editor;
    try_files $uri $uri/ =404;
  }

  ...
}
```

4. restart nginx to apply the changes

5. Use created url when you linking the application, which looks like the following for the example above:

```
<iframe src="http://vam.com/manifest-editor" width="1440" height="768"></iframe>
```




