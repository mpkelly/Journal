import React, { Fragment } from "react";
import useBoolean from "react-hanger/useBoolean";
import { Button, FlexProps, Portal, Column, Show } from "@mpkelly/siam";
import { TemplatePageCreateDialog } from "../template/TemplatePageCreateDialog";
import { Overlay } from "../../util/Overlay";
import { CreateTemplateInfo } from "../template/TemplateInfo";
import { File } from "../file/File";

export interface EditorPageTemplatesTabProps extends FlexProps {
  file: File;
}

export const EditorPageTemplatesTab = (props: EditorPageTemplatesTabProps) => {
  const { file, ...rest } = props;
  const create = useBoolean(false);

  return (
    <Fragment>
      <Column {...rest} p="md" borderLeft="1px solid dividers">
        <Button labelKey="createTemplate" onClick={create.toggle} />
        <CreateTemplateInfo />
      </Column>
      <Show when={create.value}>
        <Portal>
          <Overlay onClick={create.toggle} gravity="center">
            <TemplatePageCreateDialog file={file} />
          </Overlay>
        </Portal>
      </Show>
    </Fragment>
  );
};
