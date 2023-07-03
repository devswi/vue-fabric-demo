import { fabric } from 'fabric'
import { DrawingMode } from './Drawer'
import type { Drawer } from './Drawer'

class LineDrawer implements Drawer {
  drawing: DrawingMode = DrawingMode.Line

  // eslint-disable-next-line max-params
  make(
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number,
  ): Promise<fabric.Object> {
    const points = [x, y, x2, y2].filter((n) => n) as number[]
    return new Promise<fabric.Object>((resolve) => {
      resolve(new fabric.Line(points, options))
    })
  }

  resize(object: fabric.Line, x: number, y: number): Promise<fabric.Object> {
    object
      .set({
        x2: x,
        y2: y,
      })
      .setCoords()
    return new Promise<fabric.Object>((resolve) => {
      resolve(object)
    })
  }
}

export default LineDrawer
