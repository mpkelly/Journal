import { useState, useEffect, useCallback } from "react";
import constate from "constate";
import { useDatabase } from "../database/DatabaseState";
import { newId } from "../../util/Identity";
import { FileType, createFile, File } from "../file/File";
import { fireEvent } from "../../util/events/Events";
import { useParams } from "react-router-dom";
import {
  NodeId,
  toTreeNodes,
  findTreeNodeById,
  toFlatNodes,
} from "@mpkelly/react-tree";
import { usePagerState } from "../../components/pager/PagerState";
import { CollectionChangedEvent } from "../collections-tree/CollectionsChangedEvent";

//TODO make varaible
export const PageSize = 12;
let count = 1;

const containerPageState = () => {
  const { fileId } = useParams();
  const db = useDatabase();
  const [itemToDelete, setItemToDelete] = useState<NodeId>();

  const {
    items,
    setItems,
    page,
    hasNext,
    hasPrevious,
    handleNext,
    handlePrevious,
    totalPages,
  } = usePagerState<File>();

  useEffect(() => {
    db.getChildren(fileId, page, PageSize).then(setItems);
  }, [fileId, page]);

  const handleNameChanged = async (name: string) => {
    db.updateFile(fileId, { name });
    fireEvent("itemchanged", { id: fileId, name });
  };

  const addItem = useCallback(
    (type: FileType) => {
      db.getCollections().then(async () => {
        const id = newId();
        //TODO use I18NLabels
        const name = `New item ${count++}`;
        const file = createFile(id, name, type, true, fileId);
        await db.addFile(file);
        db.getChildren(fileId, 0, PageSize)
          .then(setItems)
          .then(CollectionChangedEvent);
      });
    },
    [fileId]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) {
      return;
    }
    db.getCollections().then((files) => {
      const tree = toTreeNodes(files);
      const result = findTreeNodeById(itemToDelete, tree);
      if (result && result.node) {
        const ids = toFlatNodes([result.node]).map((node) => node.id);
        db.deleteFiles(ids)
          .then(handleCancelDelete)
          .then(CollectionChangedEvent)
          .then(() => {
            db.getChildren(fileId, 0, PageSize).then(setItems);
            setItemToDelete(undefined);
          });
      }
    });
  }, [itemToDelete, fileId]);

  const handleCancelDelete = () => setItemToDelete(undefined);

  return {
    addItem,
    handleNameChanged,
    hasNext,
    hasPrevious,
    handleNext,
    handlePrevious,
    items: items.items,
    count: items.count,
    page: page + 1,
    totalPages,
    showDeleteConfirmation: Boolean(itemToDelete),
    handleDeleteFile: setItemToDelete,
    handleConfirmDelete,
    handleCancelDelete,
  };
};

export const [ContainerPageStateProvider, useContainerPageState] = constate(
  containerPageState
);
