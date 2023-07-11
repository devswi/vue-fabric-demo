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
      callback?.()
    }, PROPERTIES_TO_INCLUDE)
  }

  cut() {
    this.copy(() => this.editor.delete())
  }

  paste() {
    this.memorizedObject?.clone((clonedObject: fabric.Object) => {
      this.editor.canvas.discardActiveObject()
      const { left = 0, top = 0 } = clonedObject
      clonedObject.set({
        left: left + 15,
        top: top + 15,
        evented: true,
      })
      if (clonedObject.type === 'activeSelection') {
        clonedObject.canvas = this.editor.canvas
        const group = clonedObject as fabric.Group
        group.forEachObject((obj: fabric.Object) => {
          this.editor.canvas.add(obj)
        })
        group.setCoords()
      } else {
        this.editor.canvas.add(clonedObject)
      }
      this.editor.canvas.setActiveObject(clonedObject)
      this.editor.canvas.requestRenderAll()
      this.editor.saveState()
      this.memorizedObject = null
    }, PROPERTIES_TO_INCLUDE)
  }
}

export default Copier
