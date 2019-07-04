import * as React from 'react';
import { render } from 'react-dom';
import { ExperienceEditorAppWSnackbar } from '@iiif-mec/experience-editor';
import { createMuiTheme } from '@material-ui/core';
import { default as configs } from './defaults';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#000',
      contrastText: '#ff9a00',
    },
    secondary: {
      main: '#ff9a00',
      contrastText: '#000',
    },
  },
  typography: {
    fontSize: 12,
    useNextVariants: true,
  },
  mixins: {
    toolbar: {
      minHeight: 36,
    },
  },
});

render(
  <ExperienceEditorAppWSnackbar configs={configs} theme={theme} />,
  document.getElementById('app')
);
