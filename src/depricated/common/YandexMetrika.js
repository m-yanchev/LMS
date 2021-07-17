export function setYandexMetrikaGoal({name, price}) {
    return new Promise((resolve, reject) => {
        if (!name) reject(new Error("Не заданано имя цели"))
        const params = price ? {order_price: price, currency: "RUB"} : {}
        if (window["ym"]) {
            window["ym"](56917897, 'reachGoal', name, params, () => resolve())
        }
        resolve()
    })
}