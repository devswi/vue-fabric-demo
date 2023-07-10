export type ShortcutAction =
  | 'select'
  | 'undo'
  | 'redo'
  | 'copy'
  | 'paste'
  | 'cut'
  | 'delete'
  | 'save'
  | 'rectangle'
  | 'clear'

class ShortcutManager {
  on(callback: (action: ShortcutAction) => void) {
    document.addEventListener('keydown', (e) => {
      const key = e.key
      if (e.ctrlKey) {
        // 按下 ctrl 键
        switch (key) {
          case 'z':
            callback('undo')
            break
          case 'Z':
            callback('redo')
            break
          case 'c':
            callback('copy')
            break
          case 'x':
            callback('cut')
            break
          case 'v':
            callback('paste')
            break
        }
        e.preventDefault()
        e.stopPropagation()
      } else if (key === 'Backspace' || key === 'Delete') {
        callback('delete')
      } else {
        switch (key) {
          case 'w':
            callback('rectangle')
            break
          case 'v':
            callback('select')
            break
        }
      }
    })
    return false
  }
}

export default ShortcutManager
