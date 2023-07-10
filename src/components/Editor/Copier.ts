import { fabric } from 'fabric'
import DrawingEditor from './DrawingEditor'
import { PROPERTIES_TO_INCLUDE } from './types'

class Copier {
  private memorizedObject: fabric.Object | undefined

  constructor(private readonly editor: DrawingEditor) {}

  copy(callback?: Function) {
    const activeObject = this.editor.canvas.getActiveObject()
    if (activeObject !== null) {
      // activeObject.clone((object: fabric.Object) => {
      //   this.memorizedObject = object
      //   const { left = 0, top = 0 } = object
      //   object.set({
      //     left: left + 10,
      //     top: top + 10,
      //   })
      //
      //   if (callback !== undefined) {
      //     callback()
      //   }
      // }, PROPERTIES_TO_INCLUDE)
    }
  }

  cut() {
    this.copy(() => this.editor.deleteCurrent())
  }

  paste() {
    if (this.memorizedObject) {
      // this.memorizedObject.clone((clonedObject: fabric.Object) => {
      //   this.editor.canvas.add(clonedObject)
      //   this.editor.canvas.setActiveObject(clonedObject)
      //   this.editor.canvas.renderAll()
      // }, PROPERTIES_TO_INCLUDE)
      // this.memorizedObject = undefined
    }
  }
}

export default Copier
