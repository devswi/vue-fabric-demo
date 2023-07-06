import { fabric } from 'fabric'
import { markRaw } from 'vue'
import { DrawingMode, CursorMode, type Drawer } from './Drawer'
import LineDrawer from './LineDrawer'
import RectangleDrawer from './RectangleDrawer'
import OvalDrawer from './OvalDrawer'
import TriangleDrawer from './TriangleDrawer'
import PolylineDrawer from './PolylineDrawer'
import HistoryManager from './HistoryManager'
import Copier from './Copier'
import ShortcutManager, { type ShortcutAction } from './ShortcutManager'

/**
 * @class DrawingEditor 绘图类
 */
class DrawingEditor {
  canvas: fabric.Canvas

  readonly drawerOptions: fabric.IObjectOptions = {}

  // 操作历史
  readonly history: HistoryManager

  private _drawer?: Drawer

  private _image?: fabric.Image

  // 支持绘制器集合
  private readonly drawers: { [k in DrawingMode]?: Drawer } = {
    [DrawingMode.Line]: new LineDrawer(),
    [DrawingMode.Rectangle]: new RectangleDrawer(),
    [DrawingMode.Oval]: new OvalDrawer(),
    [DrawingMode.Triangle]: new TriangleDrawer(),
    [DrawingMode.Polyline]: new PolylineDrawer(),
  }

  // 当前绘制对象
  private object?: fabric.Object

  // 是否正在绘制
  private isDrawing = false

  // 光标类型
  private cursorMode = CursorMode.Draw

  // 快捷键管理
  private shortcutManager: ShortcutManager

  // 拷贝
  private copier: Copier

  /**
   * @constructor DrawingEditor 构造函数
   * @param selector 选择器
   * @param width 画布宽度
   * @param height 画布高度
   */
  constructor(readonly selector: string, width: number, height: number) {
    const canvas = document.querySelector(`#${selector}`)
    if (canvas === null) {
      throw new Error(`${selector} is not exist`)
    }
    // create canvas element
    const canvasEl = document.createElement('canvas')
    canvasEl.id = selector
    canvasEl.width = width
    canvasEl.height = height
    canvas.replaceWith(canvasEl)
    // create fabric.Canvas object
    const canvasObject = new fabric.Canvas(selector, {
      width,
      height,
      selection: false,
    })

    this.canvas = markRaw(canvasObject)
    this.history = new HistoryManager(this.canvas)

    // set default drawer
    this._drawer = this.drawers[DrawingMode.Rectangle]
    this.drawerOptions = {
      stroke: 'black',
      strokeWidth: 1,
      strokeUniform: true,
      selectable: true,
      noScaleCache: false,
      lockRotation: true,
    }

    this.shortcutManager = new ShortcutManager()
    this.copier = new Copier(this)

    this.initializeCanvasEvents()
    this.initializeShortcutEvents()
  }

  undo() {
    this.history.undo()
  }

  redo() {
    this.history.redo()
  }

  deleteCurrent() {
    const obj = this.canvas.getActiveObject()
    if (obj) {
      this.canvas.remove(obj)
      this.canvas.renderAll()
      this.saveState()
    }
  }

  /**
   * 设置背景图片
   */
  setBackgroundImage(url: string) {
    this._image = fabric.Image.fromURL(url, (img) => {
      const { width = 0, height = 0 } = img
      const { width: canvasWidth = 0, height: canvasHeight = 0 } = this.canvas
      const scaleRatio = Math.min(canvasWidth / width, canvasHeight / height)
      // 背景图片居中
      this.canvas.setBackgroundImage(url, this.canvas.renderAll.bind(this.canvas), {
        scaleX: scaleRatio,
        scaleY: scaleRatio,
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'middle',
        originY: 'middle',
      })
    })
  }

  private saveState() {
    this.history.saveState()
  }

  /**
   * 初始化 canvas 事件
   */
  private initializeCanvasEvents() {
    // 鼠标按下事件
    this.canvas.on('mouse:down', (event) => {
      const e = event.e
      const { x, y } = this.canvas.getPointer(e)
      this.mouseDown(x, y)
    })
    // 鼠标移动事件
    this.canvas.on('mouse:move', (event) => {
      const e = event.e
      const { x, y } = this.canvas.getPointer(e)
      this.mouseMove(x, y)
    })
    // 鼠标释放事件
    this.canvas.on('mouse:up', () => {
      this.isDrawing = false
      if (this.cursorMode === CursorMode.Draw) {
        this.saveState()
      }
    })
    //
    this.canvas.on('mouse:out', () => {})
    // 对象选中事件
    // v4 break change - remove object:selected event
    this.canvas.on('selection:created', (event) => {
      this.cursorMode = CursorMode.Select
      this.object = event.target
    })
    // 对象取消选中事件
    this.canvas.on('selection:cleared', () => {
      this.cursorMode = CursorMode.Draw
    })
    // 对象变更
    this.canvas.on('object:modified', () => {
      this.saveState()
    })
    // 鼠标滚轮事件
    this.canvas.on('mouse:wheel', (opt) => {
      const { e } = opt
      const delta = e.deltaY
      let zoom = this.canvas.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.01) zoom = 0.01
      this.canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom)
      e.preventDefault()
      e.stopPropagation()
    })
  }

  private initializeShortcutEvents() {
    this.shortcutManager.on((action: ShortcutAction) => {
      switch (action) {
        case 'undo':
          this.undo()
          break
        case 'redo':
          this.redo()
          break
        case 'copy':
          this.copier.copy()
          break
        case 'paste':
          this.copier.paste()
          break
        case 'cut':
          this.copier.cut()
          break
        case 'delete':
          this.deleteCurrent()
          break
      }
    })
  }

  /**
   * 鼠标按下事件
   */
  private async mouseDown(x: number, y: number) {
    this.isDrawing = true

    if (this.cursorMode !== CursorMode.Draw) return

    this.object = await this.make(x, y)
    if (this.object) {
      this.canvas.add(this.object)
      this.canvas.renderAll()
    }
  }

  private async mouseMove(x: number, y: number) {
    if (!(this.cursorMode === CursorMode.Draw && this.isDrawing)) return
    if (this.object) {
      this._drawer?.resize(this.object, x, y)
      this.canvas.renderAll()
    }
  }

  private async make(x: number, y: number): Promise<fabric.Object | undefined> {
    if (!this._drawer) return
    return await this._drawer.make(x, y, this.drawerOptions)
  }

  private mouseWheel(x: number, y: number, delta: number) {
    console.log('mouseWheel', x, y, delta)
  }
}

export default DrawingEditor
