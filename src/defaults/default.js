import {
  ImagePainting,
  TextLayoutViewFocus
} from '@iiif-mec/core';
import TextualBodyDescribing from '../annotation/TextualBodyDescribing';

export default {
  annotation: {
    'Image::painting': ImagePainting,
    'TextualBody::describing': TextualBodyDescribing,
    'TextualBody::layout-viewport-focus': TextLayoutViewFocus,
  },
  metaOntology: {},
  behavior: {},
  annotationFormButtons: {
    NewAnnotationForm: ['dismiss', 'fitCanvasToContent'],
    'TextualBodyDescribing.NewAnnotationForm': ['dismiss', 'fitContentToCanvas'],
    'TextLayoutViewFocus.NewAnnotationForm': ['dismiss', 'fitContentToCanvas'],
  },
  propertyFields: null,
  iiifResourceDefaults: {},
  propertyPanel: null,
};