# VAM Manifest Editor

The project is a IIIF Manifest Editor implementation specific for `VAM-Slideshow` and `VAM-Zoomable-Annotation` viewers.

**Demo**

https://vam-manifest-editor.netlify.com/


## Requirements and dependencies

- **nodejs** > 8.15.1
- **yarn** > 1.7.0
- **lerna** > 2.11.0

## Local development 

Install pre-requirements:

```
yarn
```

Start the development server:

```
yarn start
```

*Optional*: The local development server runs at port 5000. If that port has been already taken, the default port can be overriden from the command line using the `LIVE_SERVER_PORT` environment variable:

```
export LIVE_SERVER_PORT=5002 && yarn start
```

*NOTE*: This method will not always work for situations when you running multiple fesk-scrits based projects at the same time. For these scenarios, you can hard wire the port in the `package.json`

```
{
  "name": "vam-manifest-editor",
  "version": "1.0.17",
  "description": "V&A Manifest Editor",
  ...
  "fesk": {
    "port": 5004
  },
  ...
}
```



## Build for Production 

Start the development server:

```
yarn && yarn build
```

The `dist` folder contains the build. It is a static site.


## Compile time options

The collection server base url can be updated via an environment variable:

```
export COLLECTION_SERVER=http://localhost:8181/p3 && yarn start
```

For deployments: 

```
export COLLECTION_SERVER=http://somewhere.in.the.cloudz/p3 && yarn release
```

Note: The hot-swap dev server only reads the value up while it is starting up.


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

## Configuring the property editor fields

The `src/defaults` folder contains manifest editor configurations for the specialized modes, namely the `annotated-zoom`, the `slideshow` and the `default` editor modes.

### Overriding property editor field labels

The form field label overrides defined as key-value pairs under the `metaOntology` property of the aforementioned defaults file. The following table lists all available keys.

| key | the overriden element |
|-----|-----------------------|
| Properties.[Annotation,Canvas,Manifest] | group title |
| [Manifest,Canvas,Annotation].Summary | summary field label |
| [Manifest,Canvas,Annotation].Label | label field label | 
| [Manifest,Canvas,Annotation].RequiredStatement | required statement field label |
| [Manifest,Canvas,Annotation].RequiredStatement.Label | required statement label field label |
| [Manifest,Canvas,Annotation].RequiredStatement.Value | required statement value field label |
| [Manifest,Canvas,Annotation].Metadata | metadata field label |
| [Manifest,Canvas,Annotation].Metadata.Label | metadata label field label |
| [Manifest,Canvas,Annotation].Metadata.Value | metadata value field label |
| [Manifest,Canvas,Annotation].Behaviors | behaviours field label |
| Manifest.NavDate | manifest navdate field label |
| Manifest.Rights | manifest rights field label |

The square brackets lists all possible values, so for example in the configuration you can have: 
```
{
  metaOntology: {
    'Manifest.Summary': 'Slideshow Summary',
    'Canvas.Summary': 'Slide Text',
    'Annotation.Summary': 'Annotation Summary',
  }
}
```

Note: please make sure that the field is enabled for the defaults `propertyFields` section as well.

### Changing the field order on the property editor forms

In the defaults defaults file `propertyFields` defines the editable IIIF properties in order of appearance udert the resource groups:   
```json
{
    Manifest: [
      ...
    ],
    Canvas: [
      ...
    ],
    Annotation: [
      ...
    ],
    TextPropertiesForm: [
      ...
    ],
    ImagePropertiesForm: [
      ...
    ],
 }
```

Where `...` is the list of IIIF property names. If a non-standard IIIF property name entered, a simple text field will appear. The full list of iiif property names can be found at [https://iiif.io/api/presentation/3.0/#appendices](https://iiif.io/api/presentation/3.0/#appendices)



## References

[nodejs.org](https://nodejs.org/en/download/)

[yarn](https://yarnpkg.com/en/docs/install)

[lerna](https://lernajs.io/)

