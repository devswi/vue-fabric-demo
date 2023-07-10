import { fabric } from 'fabric'
import Workspace from './Workspace'
import type { WorkspaceOption } from './types'

class BlankWorkspace extends Workspace {
  constructor(
    readonly canvas: fabric.Canvas,
    readonly workspaceEl: HTMLElement,
    option: WorkspaceOption,
  ) {
    super(canvas, workspaceEl)
    this.option = option
    this.createBlankWorkspace()
  }

  private createBlankWorkspace() {
    // 创建空白工作区
    const { width, height } = this.option
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
    this.canvas.renderAll()

    this.workspace = workspace
    this.auto()
  }
}

export default BlankWorkspace
