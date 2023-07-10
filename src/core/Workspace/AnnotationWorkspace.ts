import { fabric } from 'fabric'
import Workspace from './Workspace'

class AnnotationWorkspace extends Workspace {
  private _image: fabric.Image | null = null

  constructor(
    readonly canvas: fabric.Canvas,
    readonly workspaceEl: HTMLElement,
    readonly imageUrl: string,
  ) {
    super(canvas, workspaceEl)
    this.createAnnotationWorkspace()
  }

  private createAnnotationWorkspace() {
    fabric.Image.fromURL(this.imageUrl, (img) => {
      const { width = 0, height = 0 } = img
      this.option = {
        width,
        height,
      }

      const workspace = new fabric.Rect({
        fill: '#fff',
        width,
        height,
        id: 'workspace',
        selectable: false,
        hasControls: false,
        hoverCursor: 'default',
      })
      this.canvas.add(workspace)

      img.set({
        width,
        height,
        selectable: false,
        hasControls: false,
      })
      this.canvas.add(img)
      this.canvas.renderAll()

      this.workspace = workspace
      this.auto()
    })
  }
}

export default AnnotationWorkspace
