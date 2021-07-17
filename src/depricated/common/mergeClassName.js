// flow

function mergeClassName(localClassName: string, importedClassName: ?string): string {
    return localClassName + (importedClassName ? " " + importedClassName : "")
}

export default mergeClassName