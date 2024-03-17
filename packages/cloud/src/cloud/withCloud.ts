import * as portiveClient from '@portive/client';
import { PlateEditor, Value, WithPlatePlugin } from '@udecode/plate-common';

import { createUploadStore } from '../upload/createUploadStore';
import { finishUploads } from './finishUploads';
import { getSaveValue } from './getSaveValue';
import { CloudEditorProps, CloudPlugin, FinishUploadsOptions } from './types';
import { uploadFiles } from './uploadFiles';

export const withCloud = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  EE extends E & CloudEditorProps<V> = E & CloudEditorProps<V>,
>(
  e: E,
  plugin: WithPlatePlugin<CloudPlugin, V, E>
) => {
  const editor = e as unknown as EE;

  const { apiKey, authToken, apiOrigin, uploadStoreInitialValue } =
    plugin.options;

  let client: portiveClient.Client;
  try {
    client = portiveClient.createClient({ apiKey, authToken, apiOrigin });
  } catch (error) {
    console.error(error);
  }

  const uploadStore = createUploadStore({
    uploads: uploadStoreInitialValue || {},
  });

  editor.cloud = {
    client: client!,
    uploadFiles: (files: Iterable<File>) => {
      uploadFiles(editor, files);
    },
    uploadStore,
    getSaveValue: () => {
      return getSaveValue<V>(editor.children, uploadStore.get.uploads());
    },
    finishUploads: async (options?: FinishUploadsOptions) => {
      return finishUploads(editor, options);
    },
  };

  return editor;
};
