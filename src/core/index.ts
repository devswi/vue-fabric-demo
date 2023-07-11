import { fabric } from 'fabric'
import { markRaw } from 'vue'
import { ANNOTATION_ID } from './types'
import DragEvent from './Event/DragEvent'
import ShortcutManager from './Manager/ShortcutManager'
import HistoryManager from './Manager/HistoryManager'
import Copier from './Manager/Copier'
import { RectangleDrawer, DrawingMode, type Drawer } from './Drawer'
import { Workspace, type WorkspaceOption } from './Workspace'

enum EditorState {
  Drawing,
  Selected,
}

class Editor {
  canvas: fabric.Canvas
  workspace: Workspace | null = null

  private workspaceEl: HTMLElement

  // 当前绘制对象
  private object?: fabric.Object

  private isDrawing = false
  private state = EditorState.Selected

  private dragEvent: DragEvent

  private _drawer?: Drawer

  private shortcutManager = new ShortcutManager()

  private defaultDrawerOptions = {
    stroke: 'black',
    strokeWidth: 5,
    strokeUniform: true,
    selectable: true,
    noScaleCache: false,
  }

  // 操作历史
  private history: HistoryManager

  private copier: Copier

  private readonly drawers: { [k in DrawingMode]?: Drawer } = {
    [DrawingMode.Rectangle]: new RectangleDrawer(),
  }

  constructor(selector: string) {
    const canvas = document.querySelector(`#${selector}`)
    if (!canvas) {
      throw new Error(`${selector} is not exist`)
    }
    // create canvas element
    const canvasEl = document.createElement('canvas')
    canvasEl.id = selector
    canvas.replaceWith(canvasEl)

    this.initializeConfs()

    const _canvas = new fabric.Canvas(selector, {
      fireRightClick: false,
      controlsAboveOverlay: true,
      stopContextMenu: true,
      hoverCursor: 'default',
      moveCursor: 'default',
    })
    this.canvas = markRaw(_canvas)

    const workspaceEl = document.querySelector('#workspace')
    if (!workspaceEl) {
      throw new Error('element #workspace is not exist')
    }
    this.workspaceEl = workspaceEl as HTMLElement
    this.setupWorkspace()

    // 创建工作区之后，初始化历史记录
    this.history = new HistoryManager(this.canvas)
    this.dragEvent = new DragEvent(this.canvas)

    this.initializeListenerEvent()
    this.initializeShortcutEvents()

    this.copier = new Copier(this)
  }

  /**
   * 创建空白/标注工作区
   *
   * @param option 工作区配置
   */
  createWorkspace(option: string): void
  createWorkspace(option: WorkspaceOption): void
  createWorkspace(option: WorkspaceOption | string) {
    // 图片 workspace
    if (typeof option === 'string') {
      // 图片加载完成之后，自动缩放
      fabric.Image.fromURL(option, (img) => {
        const { width = 0, height = 0 } = img
        const workspace = new Workspace(this.canvas, this.workspaceEl, {
          width,
          height,
        })
        img.set({
          width,
          height,
          selectable: false,
          hasControls: false,
          hoverCursor: 'default',
          id: ANNOTATION_ID,
        })
        this.canvas.add(img)
        this.workspace = workspace
        this.workspace.auto()
        this.history.reset()
      })
    } else {
      this.workspace = new Workspace(this.canvas, this.workspaceEl, option)
      this.history.reset()
    }
  }

  // 绘制矩形
  rectangle() {
    this.setDrawer(DrawingMode.Rectangle)
  }

  // 绘制圆形
  oval() {
    this.setDrawer(DrawingMode.Oval)
  }

  // 绘制三角形
  triangle() {
    this.setDrawer(DrawingMode.Triangle)
  }

  // 撤销操作
  undo() {
    this.history.undo()
  }

  // 重做操作
  redo() {
    this.history.redo()
  }

  // 切换拖动模式
  toggleDragMode() {
    this.dragEvent.toggleDragMode()
  }

  // 删除选中的对象
  delete() {
    const obj = this.canvas.getActiveObjects()
    if (obj) {
      this.canvas.remove(...obj)
      this.canvas.discardActiveObject()
      this.canvas.renderAll()
      this.saveState()
    }
  }

  saveState() {
    this.history.saveState()
  }

  private setupWorkspace() {
    const {
      workspaceEl: { offsetWidth: width, offsetHeight: height },
    } = this
    this.canvas.setWidth(width)
    this.canvas.setHeight(height)
  }

  private initializeConfs() {
    // 基础配置
    // 禁用旋转
    fabric.Object.prototype.controls.mtr.visible = false
    // 禁用 skew 歪斜形变
    fabric.Object.prototype.lockSkewingX = true
    fabric.Object.prototype.lockSkewingY = true

    // 移动时不改变选中边框透明度
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerSize: 10,
      cornerColor: 'white',
      cornerStrokeColor: '#c0c0c0',
      borderScaleFactor: 1,
      borderOpacityWhenMoving: 1,
    })

    fabric.Rect.prototype.set({
      cornerStyle: 'circle',
    })
  }

  private initializeListenerEvent() {
    // 鼠标滚轮缩放
    this.canvas.on('mouse:wheel', (opt) => {
      const e = opt.e
      const delta = e.deltaY
      let zoom = this.canvas.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.01) zoom = 0.01
      const center = this.canvas.getCenter()
      this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom)
      e.preventDefault()
      e.stopPropagation()
    })

    this.canvas.on('mouse:down', (opt) => {
      const e = opt.e
      if (e.altKey || this.dragEvent.dragMode) return
      const { x, y } = this.canvas.getPointer(e)
      this.mouseDown(x, y)
    })

    this.canvas.on('mouse:move', (opt) => {
      if (!this.isDrawing) return
      const e = opt.e
      const { x, y } = this.canvas.getPointer(e)
      this.mouseMove(x, y)
    })

    this.canvas.on('mouse:up', (opt) => {
      this.mouseUp(opt.e)
    })

    this.canvas.on('selection:created', () => {
      this.state = EditorState.Selected
    })

    this.canvas.on('selection:cleared', () => {
      if (this._drawer) {
        // 当前有 '绘图器' 恢复绘图状态
        this.state = EditorState.Drawing
      }
    })

    this.canvas.on('selection:updated', () => {
      this.saveState()
    })

    this.canvas.on('object:modified', () => {
      this.saveState()
    })
  }

  private initializeShortcutEvents() {
    this.shortcutManager.on((action) => {
      switch (action) {
        case 'rectangle':
          this.rectangle()
          break
        case 'delete':
          this.delete()
          break
        case 'select':
          this.resetDrawer()
          break
        case 'undo':
          this.undo()
          break
        case 'redo':
          this.redo()
          break
        case 'cut':
          this.copier.cut()
          break
        case 'paste':
          this.copier.paste()
          break
        case 'copy':
          this.copier.copy()
          break
      }
    })
  }

  private setDrawer(mode: DrawingMode) {
    if (this._drawer) {
      this.resetDrawer()
      return
    }
    // 取消选中
    this.canvas.discardActiveObject()
    this.canvas.requestRenderAll()
    this.canvas.selection = false
    this.state = EditorState.Drawing
    this._drawer = this.drawers[mode]
  }

  private resetDrawer() {
    // 重置绘图状态
    this.state = EditorState.Selected
    this.canvas.selection = true
    this._drawer = undefined
  }

  private async mouseDown(x: number, y: number) {
    if (this.state !== EditorState.Drawing) return
    // 设置正在绘图状态
    this.isDrawing = true
    this.canvas.selection = false
    const object = await this.make(x, y)
    if (object) {
      this.object = object
      this.canvas.add(object)
      this.canvas.renderAll()
    }
  }

  private async mouseUp(_e: MouseEvent) {
    if (this.state !== EditorState.Drawing) return
    if (!this.object) return
    // 当前对象为脏数据，删除
    if (this.object.dirty) {
      this.canvas.remove(this.object)
    } else if (this.isDrawing) {
      this.saveState()
    }
    this.isDrawing = false
  }

  private async mouseMove(x: number, y: number) {
    if (this.object) {
      this._drawer?.resize(this.object, x, y)
      this.canvas.renderAll()
    }
  }

  private async make(x: number, y: number): Promise<fabric.Object | undefined> {
    if (!this._drawer) return
    return await this._drawer.make(x, y, this.defaultDrawerOptions)
  }
}

export default Editor
