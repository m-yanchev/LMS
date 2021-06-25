function WrapComponentFunctionStack ( WrapComponent, HOCData ) {
    try {
        return HOCData.reduce( ( prevComponent, item ) => {
            return item.name(prevComponent, item.otherProps)
        }, WrapComponent );
    } catch (e) {
        console.error(e)
    }
}

export default WrapComponentFunctionStack