import { fabric } from 'fabric'

// 拖拽事件
class DragEvent {
  // 是否响应拖动事件
  dragMode = false

  private lastPosX = 0
  private lastPosY = 0

  // 是否正在拖动
  private dragging = false

  constructor(readonly canvas: fabric.Canvas) {
    this.addEventListener()
  }

  toggleDragMode() {
    this.dragMode = !this.dragMode
  }

  private addEventListener() {
    this.canvas.on('mouse:down', (opt) => {
      const { e } = opt
      // 非拖动模式下，支持按住 alt 拖动
      if (e.altKey || this.dragMode) {
        this.dragging = true
        this.canvas.selection = false
        this.canvas.discardActiveObject()
        this.makeDraggableOnly()
        this.lastPosX = e.clientX
        this.lastPosY = e.clientY
        this.canvas.requestRenderAll()
      }
    })

    this.canvas.on('mouse:move', (opt) => {
      if (this.dragging) {
        const { e } = opt
        if (this.canvas.viewportTransform) {
          const vpt = this.canvas.viewportTransform
          vpt[4] += e.clientX - this.lastPosX
          vpt[5] += e.clientY - this.lastPosY
          this.lastPosX = e.clientX
          this.lastPosY = e.clientY
          this.canvas.requestRenderAll()
        }
      }
    })

    this.canvas.on('mouse:up', () => {
      if (this.dragging && this.canvas.viewportTransform) {
        this.canvas.setViewportTransform(this.canvas.viewportTransform)
        this.dragging = false
        this.canvas.selection = true
        this.canvas.getObjects().forEach((obj) => {
          obj.selectable = obj.id !== 'workspace' && obj.hasControls
        })
        this.canvas.requestRenderAll()
      }
    })
  }

  private makeDraggableOnly() {
    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = obj.id === 'workspace'
    })
  }
}

export default DragEvent
