// flow-typed signature: ce9460b02a3ccf3df34711037f718704
// flow-typed version: <<STUB>>/react-dropzone_v5/flow_v0.75.0

declare module "react-dropzone" {
  declare export function useDropzone(options?: DropzoneOptions): DropzoneState;

  declare export { FileWithPath } from "file-selector";
 
  declare export type DropzoneFile = File & {
    preview?: string;
  }
  
  declare export default function Dropzone(
    props: DropzoneProps & React.RefAttributes<DropzoneRef>
  ): JSX.Element;

  declare export type DropzoneProps = {
    children?: Function
  } & DropzoneOptions;

  declare export type DropzoneOptions = Pick<React.HTMLProps<HTMLElement>, PropTypes> & {
    accept?: string | string[],
    minSize?: number,
    maxSize?: number,
    preventDropOnDocument?: boolean,
    noClick?: boolean,
    noKeyboard?: boolean,
    noDrag?: boolean,
    noDragEventsBubbling?: boolean,
    disabled?: boolean,
    onDrop?: (acceptedFiles: Array<DropzoneFile>, rejectedFiles: Array<DropzoneFile>, event: SyntheticDragEvent<>) => mixed,
    onDropAccepted?: (acceptedFiles: Array<DropzoneFile>, event: SyntheticDragEvent<>) => mixed,
    onDropRejected?: (rejectedFiles: Array<DropzoneFile>, event: SyntheticDragEvent<>) => mixed,
    getFilesFromEvent?: (
      event: DropEvent
    ) => Promise<Array<File | DataTransferItem>>,
    onFileDialogCancel?: () => void
  };

  declare export type DropEvent =
    | React.DragEvent<HTMLElement>
    | React.ChangeEvent<HTMLInputElement>
    | DragEvent
    | Event;

  declare export type DropzoneState = DropzoneRef & {
    isFocused: boolean,
    isDragActive: boolean,
    isDragAccept: boolean,
    isDragReject: boolean,
    isFileDialogActive: boolean,
    draggedFiles: File[],
    acceptedFiles: File[],
    rejectedFiles: File[],
    rootRef: React.RefObject<HTMLElement>,
    inputRef: React.RefObject<HTMLInputElement>,
    getRootProps(props?: DropzoneRootProps): DropzoneRootProps,
    getInputProps(props?: DropzoneInputProps): DropzoneInputProps
  };

  declare export interface DropzoneRef {
    open(): void;
  }

  declare export type DropzoneRootProps = {
    refKey?: string,
    [key: string]: any
  } & React.HTMLAttributes<HTMLElement>;

  declare export type DropzoneInputProps = {
    refKey?: string
  } & React.InputHTMLAttributes<HTMLInputElement>;

  declare type PropTypes =
    | "multiple"
    | "onDragEnter"
    | "onDragOver"
    | "onDragLeave";
}
