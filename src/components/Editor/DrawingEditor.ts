import { fabric } from 'fabric'
import { markRaw } from 'vue'
import { DrawingMode, CursorMode, type Drawer } from './Drawer'
import LineDrawer from './LineDrawer'
import RectangleDrawer from './RectangleDrawer'
import OvalDrawer from './OvalDrawer'
import TriangleDrawer from './TriangleDrawer'
import PolylineDrawer from './PolylineDrawer'
import HistoryManager from './HistoryManager'

/**
 * @class DrawingEditor 绘图类
 */
class DrawingEditor {
  canvas: fabric.Canvas

  readonly drawerOptions: fabric.IObjectOptions = {}

  private _drawer: Drawer

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

  // 操作历史
  private history: HistoryManager

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
    const defaultDrawers = this.drawers[DrawingMode.Rectangle]
    if (defaultDrawers) {
      this._drawer = defaultDrawers
    }
    this.drawerOptions = {
      stroke: 'black',
      strokeWidth: 1,
      selectable: true,
      strokeUniform: true,
    }

    this.initializeCanvasEvents()
  }

  undo() {
    this.history.undo()
  }

  redo() {
    this.history.redo()
  }

  private save() {
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
        this.save()
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
      this.save()
    })
  }

  /**
   * 鼠标按下事件
   */
  private async mouseDown(x: number, y: number) {
    this.isDrawing = true

    if (this.cursorMode !== CursorMode.Draw) return

    this.object = await this.make(x, y)
    this.canvas.add(this.object)
    this.canvas.renderAll()
  }

  private async mouseMove(x: number, y: number) {
    if (!(this.cursorMode === CursorMode.Draw && this.isDrawing)) return
    if (this.object) {
      this._drawer.resize(this.object, x, y)
      this.canvas.renderAll()
    }
  }

  private async make(x: number, y: number): Promise<fabric.Object> {
    return await this._drawer.make(x, y, this.drawerOptions)
  }
}

export default DrawingEditor
