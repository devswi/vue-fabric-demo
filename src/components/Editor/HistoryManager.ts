import { fabric } from 'fabric'

/**
 * 操作记录管理
 * @class HistoryManager
 *
 */
class HistoryManager {
  private currentState = ''
  private undoStack: string[]
  private redoStack: string[]
  private locked = false

  // 操作记录最大数量
  private maxCount = 100

  constructor(readonly canvas: fabric.Canvas) {
    this.undoStack = []
    this.redoStack = []
    this.updateState()
  }

  saveState() {
    if (this.locked) return
    if (this.undoStack.length === this.maxCount) {
      // 移除最早的一条记录
      this.undoStack.shift()
    }
    this.undoStack.push(this.currentState)
    this.updateState()
    // 清空重做栈
    this.redoStack = []
  }

  undo(callback?: Function) {
    this.replay(this.redoStack, this.undoStack, callback)
  }

  redo(callback?: Function) {
    this.replay(this.undoStack, this.redoStack, callback)
  }

  private replay(inStack: string[], outStack: string[], callback?: Function) {
    // 当前状态入栈
    inStack.push(this.currentState)

    const newState = outStack.pop()
    if (!newState) return
    // 保存新状态
    this.currentState = newState

    this.locked = true

    this.canvas.clear()
    // 加载新状态
    this.canvas.loadFromJSON(this.currentState, () => {
      if (callback !== undefined) {
        callback()
      }
      this.canvas.renderAll()
      this.locked = false
    })
  }

  private updateState() {
    this.currentState = JSON.stringify(this.canvas.toDatalessJSON(['selectionBackgroundColor']))
  }
}

export default HistoryManager