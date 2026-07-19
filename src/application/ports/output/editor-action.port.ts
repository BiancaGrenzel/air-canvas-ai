/**
 * Editor control port (VS Code / IDEs — future).
 */
export interface EditorActionPort {
  toggleTerminal: () => Promise<void>
  toggleSidebar: () => Promise<void>
  saveFile: () => Promise<void>
  commandPalette: () => Promise<void>
}
