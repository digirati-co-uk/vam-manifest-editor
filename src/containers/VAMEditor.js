import React from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import {
  LibraryAdd,
  LibraryBooks,
  SaveAlt,
  Visibility,
} from '@material-ui/icons';
import { withSnackbar } from 'notistack';

import {
  // components
  AnnotationList,
  CanvasList,
  IIIFCollectionExplorer,
  EditableCanvasPanel,
  Properties,
  TabPanel,
  ManifestEditor,
  SourcePreviewDialog,
  DefaultLoadManifestDialog,
  ManifestEditorAppBar as AppBar,
  ApplicationLayout as Layout,
  AppBarButton,
  // utils
  renderResource,
  queryResourceById,
  locale,
  update,
  download,
  convertToV3ifNecessary,
  // Reducers
  IIIFReducer,
  EditorReducer,
} from '@iiif-mec/core';

import EditorModeSelector from '../components/EditorModeSelector';
import LoadManifestModal from '../components/LoadManifestModal';
import SaveManifestModal from '../components/SaveManifestModal';
import PreviewModal from '../components/Preview/PreviewModal';
import SlideEditor from '../components/SlideEditor';
import  { saveFixtures, loadManifestHacks } from '../utils';
import './VAMEditor.scss';
import configs from '../defaults/index'; 

// TODO: on monday, make the iiif-mec/core/URIGenerator receive this from the config instead of an exposed global... 
window.rootManifestUrl = configs.rootManifestUrl;

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

class VAMEditor extends React.Component {

  constructor(props) {
    super(props);
    const initialNewManifest = this.newManifest();
    const stateToRestore = JSON.parse(localStorage.getItem('autoSave'));
    this.state = stateToRestore || {
      rootResource: initialNewManifest,
      selectedIdsByType: {
        Canvas: initialNewManifest.items[0].id,
        Annotation: null,
      },
      lang: 'en',
      editorMode: 'slideshow',
      loadManifestDialogOpen: false,
      loadManifestDialogOpen2: false,
      saveManifestDialogOpen: false,
      previewModalOpen: false,
    };
  }

  onUnload = (ev) => { // the method that will be used for both add and remove event
    const result = (window.lastPersist || 0) < window.lastOperation;
    if (result) {
      ev.returnValue = result;
      return result;
    } else {
      ev.preventDefault();
    }
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.onUnload);
  }

  componentWillUnmount() {
      window.removeEventListener("beforeunload", this.onUnload);
  }


  changeLanguage = lang => {
    this.dispatch(EditorReducer, { type: 'CHANGE_LANGUAGE', lang });
  };

  dispatch = (reducer, action, afterStateChange) => {
    this.setState(reducer(this.state, action), ()=> {
      const currentTime = new Date().getTime();
      const lastSaveWasMoreThanTenSecondsBefore = (window.lastStateSave  || 0) < (currentTime - 10000);
      if (lastSaveWasMoreThanTenSecondsBefore || action.type === 'LOAD_MANIFEST') {
        localStorage.setItem('autoSave', JSON.stringify(Object.assign({}, this.state, {
          loadManifestDialogOpen: false,
          loadManifestDialogOpen2: false,
          saveManifestDialogOpen: false,
          previewModalOpen: false,
        })));
        window.lastStateSave = currentTime;
      }
      if (afterStateChange) {
        afterStateChange();
      }
    });
  };

  selectResource = resource => {
    this.dispatch(EditorReducer, {
      type: 'TOGGLE_SELECT_RESOURCE',
      resource,
    });
  };

  deleteResource = resource => {
    this.dispatch(IIIFReducer, {
      type: 'REMOVE_RESOURCE',
      id: resource.id,
    });
  };

  invokeAction2 = (fn, options) => () => {
    if (!fn) {
      return;
    }
    fn(
      {
        state: this.state,
        dispatch: this.dispatch,
      },
      options
    );
  };

  //TODO: deprecated replaced by the above
  invokeAction = (action, options) => {
    switch (action) {
      case 'add-canvas':
        this.dispatch(IIIFReducer, {
          type: 'ADD_RESOURCE',
          options: {
            type: 'Canvas',
            parent: this.state.rootResource,
          },
        });
        break;
      default:
        break;
    }
  };

  updateProperty = (target, property, lang, value, afterStateChange) => {
    this.dispatch(IIIFReducer, {
      type: 'UPDATE_RESOURCE',
      options: {
        id: target.id,
        props: update(target, property, lang, value),
      },
    }, afterStateChange);
  };

  updateResource = (target, props) => {
    this.dispatch(IIIFReducer, {
      type: 'UPDATE_RESOURCE',
      options: {
        id: target.id,
        props,
      },
    });
  };

  regenerateIds = (manifestId, afterStateChange) => {
    this.dispatch(IIIFReducer, {
      type: 'REGENERATE_IDS',
      manifestId, 
    }, afterStateChange);
  };

  saveProject = () => {
    download(
      saveFixtures(this.state.rootResource),
      locale(this.state.rootResource.label, this.state.lang) + '.json'
    );
  };

  newManifest = () => {
    const newManifest = renderResource('Manifest');
    const newCanvas = renderResource('Canvas', { parent: newManifest });
    newManifest.items.push(newCanvas);
    return newManifest;
  };

  newProject = () => {
    if ((window.lastPersist || 0) < window.lastOperation) {
      if (!window.confirm(`Your project hasn't been saved, would you like to continue`)) {
        return;
      }
    }
    this.dispatch(IIIFReducer, {
      type: 'LOAD_MANIFEST',
      manifest: this.newManifest(),
    });
  };

  togglePreviewDialog = () => {
    this.setState({
      previewDialogOpen: !this.state.previewDialogOpen,
    });
  };

  setEditorMode = (ev, selectedElement) => {
    this.setState({
      editorMode: selectedElement.props.value,
    }, () => {
      const behaviours = (this.state.rootResource.behavior || []).filter(item=>item!=='vam-slideshow' && item !=='vam-annotated-zoom'); 
      if (selectedElement.props.value !== 'default') {
        behaviours.push('vam-' + selectedElement.props.value);
      }
      this.updateProperty(
        this.state.rootResource, 
        'behavior', 
        null, 
        behaviours
      )
    });

  };

  toggleLoadManifestDialog = () => {
    this.setState({
      loadManifestDialogOpen: !this.state.loadManifestDialogOpen,
    });
  };

  toggleLoadManifestDialog2 = () => {
    this.setState({
      loadManifestDialogOpen2: !this.state.loadManifestDialogOpen2,
    });
  };

  toggleSaveManifestDialog = () => {
    this.setState({
      saveManifestDialogOpen: !this.state.saveManifestDialogOpen,
    });
  };

  toggleItemPreview = () => {
    this.setState({
      previewModalOpen: !this.state.previewModalOpen,
    });
  };


  loadManifest = json => {

    this.dispatch(IIIFReducer, {
      type: 'LOAD_MANIFEST',
      manifest: loadManifestHacks(convertToV3ifNecessary(json)),
    });
    if (this.state.loadManifestDialogOpen) {
      this.toggleLoadManifestDialog();
    }
    if(this.state.loadManifestDialogOpen2) {
      this.toggleLoadManifestDialog2();
    }
  };

  render() {
    const { enqueueSnackbar } = this.props; 
    const canvases = this.state.rootResource
      ? this.state.rootResource.items
      : [];
    const selectedCanvas = queryResourceById(
      this.state.selectedIdsByType.Canvas,
      this.state.rootResource
    );
    const annotations =
      selectedCanvas && selectedCanvas.items && selectedCanvas.items.length > 0
        ? selectedCanvas.items[0].items || null
        : null;
    const selectedAnnotation = queryResourceById(
      this.state.selectedIdsByType.Annotation,
      selectedCanvas
    );
    const { lang, editorMode } = this.state;
    console.log(configs, editorMode, configs[editorMode]);
    return (
      <MuiThemeProvider theme={theme}>
        <ManifestEditor
          invokeAction={this.invokeAction2}
          config={{
            appBarButtonStyle: 'icon-and-label',
            hideHeaderForSingleTab: true,
          }}
          {...configs[editorMode]}
        >
          <Layout>
            <AppBar titleComponent={
              <EditorModeSelector selected={editorMode} onSelect={this.setEditorMode} />
            }>
              <AppBarButton
                text="New"
                onClick={this.newProject}
                icon={<LibraryAdd />}
              />
              <AppBarButton
                text="Load"
                onClick={this.toggleLoadManifestDialog}
                icon={<LibraryBooks />}
              />
              <AppBarButton
                text="Save"
                onClick={this.toggleSaveManifestDialog}
                icon={<LibraryBooks />}
              />
              <AppBarButton
                text="Download"
                onClick={this.saveProject}
                icon={<SaveAlt />}
              />
              {editorMode === 'default' && (
                <AppBarButton
                  text="Preview JSON"
                  onClick={this.togglePreviewDialog}
                  icon={<Visibility />}
                />
              )}
              <AppBarButton
                text="Preview"
                onClick={this.toggleItemPreview}
                icon={<Visibility />}
              />
            </AppBar>
            <Layout.Middle>
              <Layout.Left>
                <AnnotationList
                  annotations={annotations}
                  lang={lang}
                  selected={this.state.selectedIdsByType.Annotation}
                  select={this.selectResource}
                  remove={this.deleteResource}
                  invokeAction={this.invokeAction2}
                  selectedColor="secondary"
                  isEditingAllowed={!!this.state.selectedIdsByType.Canvas}
                />
              </Layout.Left>
              <Layout.Center>
                {editorMode === 'slideshow' && (!selectedAnnotation||(selectedAnnotation && selectedAnnotation.motivation !== 'layout-viewport-focus')) ? (
                  <SlideEditor 
                    manifestJSON={this.state.rootResource} 
                    canvasId={this.state.selectedIdsByType.Canvas}
                  />
                ) : (
                  <EditableCanvasPanel
                    canvas={selectedCanvas}
                    selectedAnnotation={this.state.selectedIdsByType.Annotation}
                    select={this.selectResource}
                    update={this.updateResource}
                    annotationColor="secondary"
                  />
                )}
              </Layout.Center>
              <Layout.Right>
                <TabPanel>
                  <Properties
                    title="Properties"
                    manifest={this.state.rootResource}
                    canvas={selectedCanvas}
                    annotation={selectedAnnotation}
                    lang={lang}
                    changeLanguage={this.changeLanguage}
                    update={this.updateProperty}
                    noTranslation={true}
                  />
                  <IIIFCollectionExplorer
                    title="IIIF Collection Explorer"
                    url={configs.rootManifestUrl}
                  />
                </TabPanel>
              </Layout.Right>
            </Layout.Middle>
            {editorMode !== 'annotated-zoom' && (
              <Layout.Bottom>
                <CanvasList
                  canvases={canvases}
                  lang={lang}
                  selected={this.state.selectedIdsByType.Canvas}
                  select={this.selectResource}
                  remove={this.deleteResource}
                  invokeAction={this.invokeAction}
                />
              </Layout.Bottom>
            )}
          </Layout>
        </ManifestEditor>
        <SourcePreviewDialog
          json={saveFixtures(this.state.rootResource)}
          open={this.state.previewDialogOpen}
          handleClose={this.togglePreviewDialog}
        />
        <LoadManifestModal
          open={this.state.loadManifestDialogOpen}
          handleClose={this.toggleLoadManifestDialog}
          collectionURL={configs.rootManifestUrl}
          loadManifest={this.loadManifest}
        />
        <PreviewModal
          open={this.state.previewModalOpen}
          handleClose={this.toggleItemPreview}
          manifest={this.state.rootResource}
        />
        {this.state.saveManifestDialogOpen && (
          <SaveManifestModal
            manifest={this.state.rootResource}
            open={this.state.saveManifestDialogOpen}
            handleClose={this.toggleSaveManifestDialog}
            regenerateIds={this.regenerateIds}
            enqueueSnackbar={enqueueSnackbar}
          />
        )}
        <DefaultLoadManifestDialog
          open={this.state.loadManifestDialogOpen2}
          loadManifest={this.loadManifest}
          handleClose={this.toggleLoadManifestDialog2}
        />
      </MuiThemeProvider>
    );
  }
}

export default withSnackbar(VAMEditor);