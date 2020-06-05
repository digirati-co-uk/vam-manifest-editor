import * as React from 'react';
import { render } from 'react-dom';
import { TabPanel, locale, download, saveResource } from '@digirati/me-core';
import { ExperienceEditorApp } from '@digirati/me-experience-editor';
import { createMuiTheme } from '@material-ui/core/styles';
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
  renderRightPanelComponents = panelProps => (
    <TabPanel>
      {this.renderProperties(panelProps)}
      {this.renderCollectionExplorer(panelProps)}
    </TabPanel>
  );

  saveProject = () => {
    // This overwrites the function in packages/core/src/components/containers/ManifestEditorApp
    const { resources, rootResource } = this.state;
    download(
      saveResource(rootResource, resources),
      locale(resources[rootResource].label, this.state.lang)
        .trim()
        .replace(/ /g, '_') + '.json'
    );
  };
}

const VAMManifestEditorWSnackbar = () => {
  return (
    <SnackbarProvider maxStack={3}>
      <VAMManifestEditor
        configs={configs}
        theme={theme}
        editorOptions={'multi'}
        dlcs={false}
        preview={'vam'}
      />
    </SnackbarProvider>
  );
};

render(<VAMManifestEditorWSnackbar />, document.getElementById('app'));
