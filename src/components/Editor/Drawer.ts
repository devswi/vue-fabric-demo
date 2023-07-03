import { fabric } from 'fabric'

// 绘图类型
enum DrawingMode {
  Line,
  Rectangle,
  Oval,
  Text,
}

// 光标类型
enum CursorMode {
  Draw,
  Select,
}

interface Drawer {
  drawing: DrawingMode

  /**
   * @method make 创建绘图对象
   * @param x 起始点x坐标
   * @param y 起始点y坐标
   * @param options 绘图对象属性
   * @param x2 终点x坐标
   * @param y2 终点y坐标
   * @returns Promise<fabric.Object> 返回创建的绘图对象
   */
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number,
  ): Promise<fabric.Object>

  /**
   * @method resize 调整绘图对象大小
   * @param object 绘图对象
   * @param x x坐标
   * @param y y坐标
   * @returns Promise<fabric.Object> 返回调整大小后的绘图对象
   */
  resize(object: fabric.Object, x: number, y: number): Promise<fabric.Object>
}

export { DrawingMode, CursorMode }
export type { Drawer }
