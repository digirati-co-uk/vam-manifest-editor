import * as React from 'react';
import { render } from 'react-dom';
import { TabPanel } from '@iiif-mec/core';
import { ExperienceEditorApp } from '@iiif-mec/experience-editor';
import { createMuiTheme } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
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


class VAMManifestEditor extends ExperienceEditorApp {
  renderRightPanelComponents = (panelProps) => (
    <TabPanel>
      {this.renderProperties(panelProps)}
      {this.renderCollectionExplorer(panelProps)}
    </TabPanel>
  );
};

const VAMManifestEditorWSnackbar = () => (
  <SnackbarProvider maxStack={3}>
    <VAMManifestEditor configs={configs} theme={theme} />
  </SnackbarProvider>
)

render(
  <VAMManifestEditorWSnackbar />,
  document.getElementById('app')
);

