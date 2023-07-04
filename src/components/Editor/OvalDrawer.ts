import { fabric } from 'fabric'
import { DrawingMode } from './Drawer'
import type { Drawer } from './Drawer'

class OvalDrawer implements Drawer {
  drawing = DrawingMode.Oval

  private originX = 0
  private originY = 0

  // eslint-disable-next-line max-params
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    rx?: number,
    ry?: number,
  ): Promise<fabric.Object> {
    this.originX = x
    this.originY = y

    return new Promise((resolve) => {
      resolve(
        new fabric.Ellipse({
          left: x,
          top: y,
          rx,
          ry,
          fill: 'transparent',
          ...options,
        }),
      )
    })
  }

  resize(object: fabric.Ellipse, x: number, y: number): Promise<fabric.Object> {
    const { left = 0, top = 0 } = object
    object
      .set({
        originX: this.originX > x ? 'right' : 'left',
        originY: this.originY > y ? 'bottom' : 'top',
        rx: Math.abs(x - left) / 2,
        ry: Math.abs(y - top) / 2,
      })
      .setCoords()

    return new Promise((resolve) => {
      resolve(object)
    })
  }
}

export default OvalDrawer
