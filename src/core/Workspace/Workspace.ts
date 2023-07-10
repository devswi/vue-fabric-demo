import { fabric } from 'fabric'
import { throttle } from 'lodash'
import type { WorkspaceOption } from './types'

class Workspace {
  workspace: fabric.Object | null
  option: WorkspaceOption

  constructor(readonly canvas: fabric.Canvas, readonly workspaceEl: HTMLElement) {
    this.workspace = null
    this.option = {
      width: 0,
      height: 0,
    }
    this.initResizeObserve()
  }

  /**
   * 自动缩放
   */
  auto() {
    const scale = this.getScaleRatio()
    this.setAutoZoom(scale)
  }

  setAutoZoom(scale: number, callback?: (left?: number, top?: number) => void) {
    if (!this.workspace) return
    const scaleRatio = scale
    const center = this.canvas.getCenter()
    this.canvas.setViewportTransform(fabric.iMatrix.concat())
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), scaleRatio)
    this.setCenterFromObject(this.workspace)
    // 重新计算裁剪区域
    this.workspace.clone((cloned: fabric.Rect) => {
      this.canvas.clipPath = cloned
      this.canvas.requestRenderAll()
    })
    callback?.(this.workspace.left, this.workspace.top)
  }

  private getScaleRatio() {
    const { width, height } = this.option
    const { offsetWidth: viewPortWidth, offsetHeight: viewPortHeight } = this.workspaceEl
    // 0.03 保证画板距离边框一定边距
    return Math.min(viewPortWidth / width, viewPortHeight / height) - 0.03
  }

  private setCenterFromObject(obj: fabric.Object) {
    const { canvas } = this
    const objCenter = obj.getCenterPoint()
    const viewportTransform = canvas.viewportTransform
    // http://fabricjs.com/docs/fabric.Canvas.html#viewportTransform
    if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return
    viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0]
    viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3]
    canvas.setViewportTransform(viewportTransform)
    canvas.renderAll()
  }

  private initResizeObserve() {
    const resizeObserver = new ResizeObserver(
      throttle(() => {
        this.auto()
      }, 100),
    )
    resizeObserver.observe(this.workspaceEl)
  }
}

export default Workspace
