export function openImageOne() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `image/png`;
    input.click();
    return new Promise(resolve => {
        input.onchange = event => {
            const {files} = event.target;
            resolve(files[0])
        }
    })
}

export function openFiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true
    input.click();
    return new Promise(resolve => {
        input.onchange = event => {
            const {files} = event.target;
            resolve(files)
        }
    })
}