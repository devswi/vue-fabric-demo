import { fabric } from 'fabric'
import { DrawingMode } from './Drawer'
import type { Drawer } from './Drawer'

class TriangleDrawer implements Drawer {
  drawing = DrawingMode.Triangle

  private originX: number = 0
  private originY: number = 0

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
      resolve(
        new fabric.Triangle({
          left: x,
          top: y,
          width,
          height,
          fill: 'transparent',
          ...options,
        }),
      )
    })
  }

  resize(object: fabric.Triangle, x: number, y: number): Promise<fabric.Object> {
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

export default TriangleDrawer
