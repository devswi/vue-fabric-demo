import { fabric } from 'fabric'
import type { Drawer } from './Base'
import { DrawingMode } from './Base'

class RectangleDrawer implements Drawer {
  drawing = DrawingMode.Rectangle

  private originX = 0
  private originY = 0

  // eslint-disable-next-line max-params
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    width?: number,
    height?: number,
  ): Promise<fabric.Object> {
    this.originX = x
    this.originY = y

    return new Promise<fabric.Object>((resolve) => {
      const rect = new fabric.Rect({
        left: x,
        top: y,
        width,
        height,
        fill: 'transparent',
        ...options,
      })
      resolve(rect)
    })
  }

  resize(object: fabric.Rect, x: number, y: number): Promise<fabric.Object> {
    object
      .set({
        originX: this.originX > x ? 'right' : 'left',
        originY: this.originY > y ? 'bottom' : 'top',
        width: Math.abs(this.originX - x),
        height: Math.abs(this.originY - y),
      })
      .setCoords()

    return new Promise((resolve) => {
      resolve(object)
    })
  }
}

export default RectangleDrawer
