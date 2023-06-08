import { KeySequence, KeybindSequence } from "@revolt/keybinds";

import { State } from "..";

import { AbstractStore } from ".";

enum KeybindAction {
  NavigateChannelUp = "navigate_channel_up",
  NavigateChannelDown = "navigate_channel_down",
  NavigateServerUp = "navigate_server_up",
  NavigateServerDown = "navigate_server_down",
}

type KeybindActions = Record<KeybindAction, KeySequence[]>;

/** utility to make writing the default keybinds easier, requires all `KeybindAction` values to be filled out */
function keybindMap(
  obj: Record<KeybindAction, string[]>
): Record<KeybindAction, KeySequence[]> {
  const entries = Object.entries(obj) as [KeybindAction, string[]][];
  const parsed = entries.map(([act, seqs]) => [
    act,
    seqs.map((seq) => ({ sequence: KeybindSequence.parse(seq) })),
  ]);
  return Object.fromEntries(parsed);
}

export const DEFAULT_VALUES: KeybindActions = keybindMap({
  [KeybindAction.NavigateChannelUp]: ["Alt+ArrowUp"],
  [KeybindAction.NavigateChannelDown]: ["Alt+ArrowDown"],
  [KeybindAction.NavigateServerUp]: ["Control+Alt+ArrowUp"],
  [KeybindAction.NavigateServerDown]: ["Control+Alt+ArrowDown"],
});

export type TypeKeybinds = {
  keybinds: KeybindActions;
};

export class Keybinds extends AbstractStore<"keybinds", TypeKeybinds> {
  keybinds = Map;

  /**
   * Construct store
   * @param state State
   */
  constructor(state: State) {
    super(state, "keybinds");
  }

  /**
   * Hydrate external context
   */
  hydrate(): void {
    /** nothing needs to be done */
  }

  /**
   * Generate default values
   */
  default() {
    return {
      keybinds: DEFAULT_VALUES,
    };
  }

  /**
   * Validate the given data to see if it is compliant and return a compliant object
   */
  clean(input: Partial<TypeKeybinds>): TypeKeybinds {
    const actions = this.default();
    // todo: implement this
    throw new Error(`clean is not implemented for Keybinds yet`);
  }

  getKeybinds() {
    return this.get().keybinds;
  }

  /** Get the default built-in keybind of an action */
  getDefaultKeybind(action: KeybindAction, index: number) {
    return this.default().keybinds[action]?.[index];
  }

  /**
   * Binds a keybind to an action at the given index
   * @param action action to bind to
   * @param index index to bind to
   * @param sequence the keybind sequence
   */
  setKeybind(action: KeybindAction, index: number, sequence: string) {
    this.set("keybinds", action, index, KeybindSequence.parse(sequence));
  }

  /**
   * Adds a new keybind to an action
   * @param action the action to add a keybind to
   * @param sequence the keybind sequence to add
   */
  addKeybind(action: KeybindAction, sequence: string) {
    this.set("keybinds", action, (keybinds) => [
      ...keybinds,
      KeybindSequence.parse(sequence),
    ]);
  }

  /**
   * Resets a keybind back to the built-in default.
   * If there is none, remove it from the list of keybinds for the given action.
   * @param action action to reset
   * @param index index to reset
   */
  resetKeybindToDefault(action: KeybindAction, index: number) {
    const defaultValue = this.getDefaultKeybind(action, index);
    if (defaultValue) {
      this.set("keybinds", action, index, defaultValue);
    } else {
      // todo: maybe convert into a more efficient utility
      this.set("keybinds", action, (keybinds) => {
        // shallow copy so splice doesn't mutate the original
        keybinds = [...keybinds];
        keybinds.splice(index, 1);
        return keybinds;
      });
    }
  }
}