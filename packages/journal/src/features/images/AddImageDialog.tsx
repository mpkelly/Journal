import React from "react";
import { FlexProps, Column, Row, Scope, Button } from "@mpkelly/siam";
import { Dialog } from "../../components/dialog/Dialog";
import { Media } from "../media/Media";
import { Image } from "./ImagePreview";
import { useAddImageDialogState } from "./AddImageDialogState";
import { Pager } from "../../components/pager/Pager";
import { ImageProperties } from "./ImageProperties";

export interface AddImageDialogProps extends FlexProps {
  images: Media[];
  onConfirm(images: Media[]): void;
}

export const AddImageDialog = (props: AddImageDialogProps) => {
  const {
    source,
    images,
    image,
    onConfirm,
    page,
    hasNext,
    hasPrevious,
    handleNext,
    handlePrevious,
    totalPages,
  } = useAddImageDialogState(props);
  const handleConfirm = () => onConfirm(images);
  const isLastPage = page === totalPages;
  return (
    <Scope value="nav">
      <Dialog
        width={800}
        height={600}
        onClickOutside={handleConfirm}
        flexDirection="row"
        background="background"
        p={"0"}
      >
        <Column flexGrow={1}>
          <Row width="100%" height={50} gravity="center">
            <Pager
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              onNext={handleNext}
              onPrevious={handlePrevious}
              page={page}
              totalPages={totalPages}
            />
          </Row>
          <Column flexGrow={1} gravity="center">
            <Image src={source} />
          </Column>
        </Column>
        <Column
          p="md"
          height={"100%"}
          flexShrink={0}
          borderLeft="1px solid dividers"
        >
          <ImageProperties image={image} onClose={handleConfirm} p="md" />
          <Button
            labelKey="finished"
            mt="auto"
            onClick={handleConfirm}
            kind={isLastPage ? "primary" : "muted"}
          />
        </Column>
      </Dialog>
    </Scope>
  );
};
