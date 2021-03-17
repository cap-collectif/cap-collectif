type Disclosure = {|
  +isOpen: boolean;
  +onOpen: () => void;
  +onClose: () => void;
  +onToggle: () => void;
|}

type MultipleDisclosure<T> = {|
  +isOpen: (id: T) => boolean;
  +onOpen: (id: T) => () => void;
  +onClose: (id: T) => () => void;
  +onToggle: (id: T) => () => void;
|};

type KeyboardShortcut = {|
  +preventDefault?: boolean;
  +keys: string[];
  +action: () => void;
|}

type Size = {|
  +width: number;
  +height: number;
|}

type Handler<T> = {|
  +value: T;
  +onChange: (e: SyntheticEvent<HTMLInputElement>) => void;
|}

declare module "@liinkiing/react-hooks" {
  declare export function useResize(): Size;
  declare export function useMatchMedia(query: string): boolean;
  declare export function useKeyboardShortcuts<T: HTMLElement>(shortcuts: KeyboardShortcut[], ref?: RefObject<typeof T>, deps?: Array<any>): void;
  declare export function useInput<T>(initialValue: T): [Handler<T>, () => void]
  declare export function useDisclosure(defaultIsOpen?: boolean): Disclosure;
  declare export function useMultipleDisclosure<T: {| [key: string]: any |}>(initialDisclosures: T): MultipleDisclosure<$Keys<typeof T>>;
}
