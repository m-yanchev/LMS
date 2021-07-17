import {IMAGE_PREFIX, IMAGE_SUFFIX} from "../depricated/common/constants";

const fs = require('fs');
const path = require('path');

export const IMAGES_PATH = path.resolve('public', 'images')
const TASKS_FOLDER_PATH = path.resolve('public', 'images', 'tasks');
const SOLUTIONS_FOLDER_PATH = path.resolve("public", "images", "solutions")

export function getFileNamesFromImageFolder(folders) {

    const _path = [IMAGES_PATH, ...folders]

    return new Promise((resolve, reject) => {
        fs.readdir(path.join(..._path), (e, files) => {
            if (e) {
                reject(e)
            } else {
                resolve(files)
            }
        })
    })
}

export function removeProblemImages(key) {
    return removeExcessFiles(getPrefix(key), 0)
}

export async function saveSolutions({files, key}) {

    await makeFolder(path.join(SOLUTIONS_FOLDER_PATH, key))
    return Promise.all(files.map(file => createFile(file, path.join(SOLUTIONS_FOLDER_PATH, key, file.originalname))))

    function makeFolder(path) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, {recursive: true}, e => {
                if (e) {
                    console.error(e)
                    reject(e);
                }
                resolve();
            })
        })
    }
}

export function saveProblemImages({files, imageMap}) {

    if (!imageMap) return
    const {imageItems, key} = imageMap

    return createFilesOnServer({prefix: getPrefix(key), imageItems, files})
}

export function removePoster({key, prefix}) {
    return removeFile(getPosterPath({key, prefix}))
}

export function savePoster({files, key, prefix}) {
    if (!files || !files.length) return;
    return createFile(files[0], getPosterPath({key, prefix}));
}

function getPosterPath({prefix, key}) {
    return imgPath(getImagePath([prefix + "Posters"]), getPrefix(key), IMAGE_SUFFIX)
}

export function getImagePath(folders) {
    return path.join(IMAGES_PATH, ...folders)
}

export function getImageCount(key) {

    return countFilesByPrefix(getPrefix(key))

    function countFilesByPrefix(prefix) {
        let count = 0;
        fs.readdirSync(TASKS_FOLDER_PATH).forEach(fileName => {
            if (fileName.indexOf(prefix) === 0) count++
        });
        return count;
    }
}

async function createFilesOnServer({prefix, imageItems, files}) {
    try {
        const TMP_EXT = 'tmp';

        await createTmpFiles(prefix, imageItems);
        const promises = [];
        promises.push(removeExcessFiles(prefix, imageItems.length));
        promises.push(renameTmpToImg(prefix));
        await Promise.all(promises);

        function createTmpFiles(prefix, imageItems) {
            const promises = [];
            imageItems.forEach((item, i) => {
                const {type, index} = item;
                if (type === 'client') {
                    promises.push(createTmpFileFromLoadedFile(prefix, index, i))
                } else if (item.type === 'server') {
                    promises.push(createTmpFileFromServerFile(prefix, index, i))
                } else {
                    throw (new RangeError('imageItems.type is expected to be "client" or "server" string')).status = 400;
                }
            });
            return Promise.all(promises)
        }

        function renameTmpToImg(prefix) {
            const promises = [];
            const end = -TMP_EXT.length;
            fs.readdirSync(TASKS_FOLDER_PATH).forEach(fileName => {
                const suf = fileName.slice(end);
                if (fileName.indexOf(prefix) === 0 && suf === TMP_EXT) {
                    promises.push(new Promise((resolve, reject) => {
                        const newFileName = fileName.slice(0, end) + IMAGE_SUFFIX;
                        fs.rename(
                            path.join(TASKS_FOLDER_PATH, fileName),
                            path.join(TASKS_FOLDER_PATH, newFileName),
                            e => {
                                if (e) reject(e);
                                resolve();
                            })
                    }))
                }
            });
            return Promise.all(promises);
        }

        async function createTmpFileFromLoadedFile(prefix, index, serverIndex) {
            return await createFile(files[index], imgPath(TASKS_FOLDER_PATH, prefix, TMP_EXT, serverIndex));
        }

        function createTmpFileFromServerFile(prefix, index, i) {
            return new Promise((resolve, reject) => {
                fs.rename(
                    imgPath(TASKS_FOLDER_PATH, prefix, IMAGE_SUFFIX, index),
                    imgPath(TASKS_FOLDER_PATH, prefix, TMP_EXT, i),
                    (e) => {
                        if (e) reject(e);
                        resolve();
                    })
            })
        }

    } catch (e) {
        throw e
    }
}

async function createFile(file, path) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, file.buffer, e => {
            if (e) reject(e);
            resolve();
        })
    })
}

function removeExcessFiles(prefix, fileCount) {
    const promises = [];
    const start = prefix.length + 1;
    const end = -(IMAGE_SUFFIX.length + 1);
    fs.readdirSync(TASKS_FOLDER_PATH).forEach(fileName => {
        const i = +fileName.slice(start, end);
        if (fileName.indexOf(prefix) === 0 && i >= fileCount) {
            promises.push(removeFile(imgPath(TASKS_FOLDER_PATH, prefix, IMAGE_SUFFIX, i)))
        }
    });
    return Promise.all(promises);
}

function removeFile(fileName) {
    return new Promise((resolve, reject) => {
        fs.unlink(fileName, e => {
            if (e) reject(e);
            resolve();
        })
    })
}

function imgPath(folderPath, prefix, ext = 'png', index) {
    if (typeof prefix !== 'string') throw new TypeError('prefix is not a string');
    if (typeof ext !== 'string') throw new TypeError('ext is not a string');
    if (index !== undefined) {
        if (typeof index !== 'number') throw new TypeError('index is not a number');
        return path.join(folderPath, `${prefix}_${index}.${ext}`);
    }
    return path.join(folderPath, `${prefix}.${ext}`)
}

function getPrefix(key) {
    return `${IMAGE_PREFIX}${key}`
}