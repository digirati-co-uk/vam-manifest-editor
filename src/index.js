import * as React from 'react';
import { render } from 'react-dom';
import { TabPanel, locale, download, saveResource } from '@digirati/me-core';
import { ExperienceEditorApp } from '@digirati/me-experience-editor';
import { createMuiTheme } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import { default as configs } from './defaults';
import AppBarButton from '@digirati/me-core/lib/components/AppBarButton/AppBarButton';
import LoadIcon from '@digirati/me-experience-editor/lib/components/LoadIcon';
import SaveIcon from '@digirati/me-experience-editor/lib/components/SaveIcon';
import LibraryAdd from '@material-ui/icons/LibraryAdd';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Visibility from '@material-ui/icons/Visibility';
import GridOnIcon from '@digirati/me-experience-editor/lib/components/GridOnIcon';
import GridOffIcon from '@digirati/me-experience-editor/lib/components/GridOffIcon';

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

  renderAppBarButtons = () => (
    <React.Fragment>
      <AppBarButton
        text="New Manifest"
        onClick={this.newProject}
        icon={<LibraryAdd />}
      />
      <AppBarButton
        text="Load Manifest"
        onClick={this.toggleLoadManifestDialog}
        icon={<LoadIcon />}
      />
      {this.state.editorMode !== 'default' && (
        <AppBarButton
          text="Save"
          onClick={this.toggleSaveManifestDialog}
          icon={<SaveIcon />}
        />
      )}
      <AppBarButton
        text="Download JSON"
        onClick={this.saveProject}
        icon={<SaveAlt />}
      />
      {(this.state.editorMode === 'default' ||
        this.state.editorMode === 'exhibitionPreview') && (
        <AppBarButton
          text="Preview JSON"
          onClick={this.togglePreviewDialog}
          icon={<Visibility />}
        />
      )}
      {this.props.preview === 'vam' && (
        <AppBarButton
          text="Preview"
          onClick={this.toggleItemPreview}
          icon={<Visibility />}
        />
      )}
      {this.props.preview === 'delft' && (
        <AppBarButton
          text="Delft Exbibition Behaviour Tools"
          onClick={this.toggleExhibitionView}
          icon={
            this.state.editorMode === 'exhibitionPreview' ? (
              <GridOnIcon />
            ) : (
              <GridOffIcon />
            )
          }
        />
      )}
    </React.Fragment>
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
