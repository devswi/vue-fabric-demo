export type ShortcutAction = 'undo' | 'redo' | 'copy' | 'paste' | 'cut' | 'delete' | 'save'

class ShortcutManager {
  on(callback: Function) {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      const { key } = e
      console.log('keydown', key, e)
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
        e?.preventDefault()
        e?.stopPropagation()
        return false
      } else if (key === 'Backspace' || key === 'Delete') {
        callback('delete')
        return false
      }
    })
  }
}

export default ShortcutManager
