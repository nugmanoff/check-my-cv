export default class URLwithStore extends URL {
  static store: any;

  static createObjectURL(blob: any) {
    const url = super.createObjectURL(blob);
    URLwithStore.store = { ...(URLwithStore.store ?? {}), [url]: blob };
    return url;
  }

  static getFromObjectURL(url: any) {
    return (URLwithStore.store ?? {})[url] ?? null;
  }

  static revokeObjectURL(url: any) {
    super.revokeObjectURL(url);
    if (
      new URL(url).protocol === "blob:" &&
      URLwithStore.store &&
      url in URLwithStore.store
    )
      delete URLwithStore.store[url];
  }
}
