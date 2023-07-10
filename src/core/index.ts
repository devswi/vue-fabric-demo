import { fabric } from 'fabric'
import { markRaw } from 'vue'
import DragEvent from './Event/DragEvent'
import ShortcutManager from './Event/ShortcutManager'
import HistoryManager from './Event/HistoryManager'
import { RectangleDrawer, DrawingMode, type Drawer } from './Drawer'
import { Workspace, AnnotationWorkspace, BlankWorkspace, type WorkspaceOption } from './Workspace'

enum EditorState {
  Drawing,
  Selected,
}

class Editor {
  canvas: fabric.Canvas
  workspace: Workspace | null = null

  // 当前绘制对象
  private object?: fabric.Object

  private isDrawing = false
  private state = EditorState.Selected

  private dragEvent: DragEvent

  private workspaceEl: HTMLElement

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

    const _canvas = new fabric.Canvas(selector, {
      fireRightClick: false,
      controlsAboveOverlay: true,
      stopContextMenu: true,
    })
    this.canvas = markRaw(_canvas)

    const workspaceEl = document.querySelector('#workspace')
    if (!workspaceEl) {
      throw new Error('element #workspace is not exist')
    }
    this.workspaceEl = workspaceEl as HTMLElement
    this.setupWorkspace()
    this.initializeListenerEvent()
    this.initializeShortcutEvents()
    this.dragEvent = new DragEvent(this.canvas)
    // 创建工作区之后，初始化历史记录
    this.history = new HistoryManager(this.canvas)
  }

  /**
   * 创建空白/标注工作区
   *
   * @param option 工作区配置
   */
  createWorkspace(option: string): void
  createWorkspace(option: WorkspaceOption): void
  createWorkspace(option: WorkspaceOption | string) {
    // create workspace
    if (typeof option === 'string') {
      this.workspace = new AnnotationWorkspace(this.canvas, this.workspaceEl, option)
    } else {
      this.workspace = new BlankWorkspace(this.canvas, this.workspaceEl, option)
    }
  }

  addImage(url: string) {
    fabric.Image.fromURL(url, (img) => {
      img.set({})

      this.canvas.add(img)
      this.canvas.renderAll()
    })
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

  private setupWorkspace() {
    const {
      workspaceEl: { offsetWidth: width, offsetHeight: height },
    } = this
    this.canvas.setWidth(width)
    this.canvas.setHeight(height)
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
      console.log('mouse:up', opt)
      this.isDrawing = false
    })

    this.canvas.on('object:added', (opt) => {
      console.log('object:added', opt)
      // this.saveState()
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
          this.deleteCurrent()
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
      }
    })
  }

  private deleteCurrent() {
    const obj = this.canvas.getActiveObjects()
    if (obj) {
      this.canvas.remove(...obj)
      this.canvas.discardActiveObject()
      this.canvas.renderAll()
    }
  }

  private setDrawer(mode: DrawingMode) {
    if (this._drawer) {
      this.resetDrawer()
      return
    }
    this.state = EditorState.Drawing
    this.canvas.selection = false
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
      this.saveState()
    }
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

  private saveState() {
    this.history.saveState()
  }
}

export default Editor
