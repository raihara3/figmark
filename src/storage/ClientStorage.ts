class ClientStorage {
  key: string

  constructor(projectName) {
    this.key = `figmark_${projectName}`
  }

  set(value) {
    figma.clientStorage.setAsync(this.key, value)
  }

  get() {
    return figma.clientStorage.getAsync(this.key)
  }
}

export default ClientStorage
