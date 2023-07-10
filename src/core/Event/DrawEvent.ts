import { fabric } from 'fabric'

// 绘图事件
class DrawEvent {
  constructor(private canvas: fabric.Canvas) {
    this.addEventListeners()
  }

  private addEventListeners() {}
}

export default DrawEvent
