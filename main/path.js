export function getFullPath(path, alias) {
    const normalPath = path[path.length - 1] !== "/" ? path + "/" : path
    return normalPath + alias + "/"
}