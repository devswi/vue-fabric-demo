import { fabric } from 'fabric'
import { PROPERTIES_TO_INCLUDE } from '../types'
import type Editor from '../'

class Copier {
  private memorizedObject: fabric.Object | null = null

  constructor(readonly editor: Editor) {}

  copy(callback?: Function) {
    const activeObject = this.editor.canvas.getActiveObject()
    activeObject?.clone((object: fabric.Object) => {
      this.memorizedObject = object
      const { left = 0, top = 0 } = object
      object.set({
        left: left + 15,
        top: top + 15,
      })
      callback?.()
    }, PROPERTIES_TO_INCLUDE)
  }

  cut() {
    this.copy(() => this.editor.delete())
  }

  paste() {
    this.memorizedObject?.clone((clonedObject: fabric.Object) => {
      this.editor.canvas.add(clonedObject)
      this.editor.canvas.setActiveObject(clonedObject)
      this.editor.saveState()
      this.editor.canvas.renderAll()
      this.memorizedObject = null
    }, PROPERTIES_TO_INCLUDE)
  }
}

export default Copier
