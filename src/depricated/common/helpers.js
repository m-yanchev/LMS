export function distance(pos1, pos2) {
    const x2 = Math.pow(pos1.left - pos2.left, 2);
    const y2 = Math.pow(pos1.top - pos2.top, 2);
    return Math.sqrt(x2 + y2);
}

export function changeSubString(str, fSub, chSub) {
    const subStrArray = [];
    let startPos = 0;
    while (true) {
        let foundPos = str.indexOf(fSub, startPos);
        if (foundPos === -1) break;
        subStrArray.push(str.slice(startPos, foundPos));
        startPos = foundPos + fSub.length;
    }
    subStrArray.push(str.slice(startPos));
    return subStrArray.join(chSub)
}

export function getImageBoxIntroCanvas(canvasSize, imageSize) {
    const proportion = {
        w: imageSize.w / canvasSize.w,
        h: canvasSize.h ? imageSize.h / canvasSize.h : imageSize.w / canvasSize.w
    };
    const newImageSize = proportion.w < proportion.h ?
        {w: imageSize.w / proportion.h, h: canvasSize.h} :
        {w: canvasSize.w, h: imageSize.h / proportion.w};
    const position = proportion.w < proportion.h ?
        {x: (canvasSize.w - newImageSize.w) / 2, y: 0} :
        {x: 0, y: canvasSize.h ? (canvasSize.h - newImageSize.h) / 2 : 0};
    return {...newImageSize, ...position}
}

export function getFinalPath(path="", alias="") {

    return beforeSlash(path) + beforeSlash(String(alias));

    function beforeSlash(str) {
        const withoutSlash = str ? removeSlash(str) : '';
        return withoutSlash === '' ? '' : '/' + withoutSlash
    }

    function removeSlash(str) {
        return str.replace(/^\/|\/$/g, '');
    }
}

export function getComponentClassName(nativeStylesObject, contextStylesObject, nativeComponentName, contextPrefix) {
    const contextComponentName = contextPrefix ? contextPrefix + '-' + nativeComponentName : nativeComponentName;
    const contextClassName = contextStylesObject && contextStylesObject[contextComponentName];
    const nativeClassName = nativeStylesObject && nativeStylesObject[nativeComponentName];
    return nativeClassName ? nativeClassName + (contextClassName ? ' ' + contextClassName : '') : contextClassName;
}

export class DOMHelpers {

    constructor(element) {
        this._element = element;
    }

    checkParentById = (id) => {
        try {
            let curElem = this._element;
            while (curElem) {
                if (String(curElem.id) === String(id.toString())) {
                    return true;
                }
                curElem = curElem.parentElement;
            }
            return false;
        } catch (e) {
            console.error(e)
        }
    };

    getDistanceToDOMElement = (element) => {
        const box1 = this._element.getBoundingClientRect();
        const box2 = element.getBoundingClientRect();
        return distance({left: box1.left, top: box1.top}, {left: box2.left, top: box2.top})
    }
}

export function getAliases(path) {
    if (typeof path !== 'string') throw TypeError('path is not string');
    const aliases = path.split('/');
    if (aliases.length > 0) {
        if (aliases[0] === '') aliases.shift();
        if (aliases[aliases.length - 1] === '') aliases.pop();
    }
    return aliases;
}

export function getRequestFromAliases(aliases) {
    if (!Array.isArray(aliases)) throw new TypeError('aliases is not an array');
    const copiedAliases = aliases.map(alias => alias);
    const path = aliases.join('/');
    switch (aliases.length) {
        case 0:
        case 1:
            return {model: 'router', task: 'find', dbData: {path}};
        case 2:
            return {model: 'headings', task: 'selectTaskTypesByPath', dbData: {path}};
        case 3:
            return {model: 'tasks', task: 'selectTypeTasksByPath', dbData: {path}};
        case 4:
            const number = copiedAliases.pop();
            return {model: 'tasks', task: 'selectTaskByPath', dbData:{path: copiedAliases.join('/'), number}};
        default:
            return null;
    }
}