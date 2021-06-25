// @flow

import {setYandexMetrikaGoal} from "../YandexMetrika";
import {v4} from "uuid"
import {redirect} from "../redirect";
import type {HTTPRequestSend} from "../../server/HTTPRequest";
import type {PostTransportInterface} from "../../server/PostTransport";
import {ABSOLUTE_SITE_ADDRESS} from "../constants";
import type {MakeResponse} from "../../server/Schema/Schema";
import WebinarRegistration from "./WebinarRegistration";
import Profile from "./Profile";
import Subscription from "./Subscription";
import Webinar from "../../rules/Webinar";

type PaymentProps = {
    ...DBUpdateProps,
    amount: Amount,
    confirmation?: Confirmation
}

type CreatePaymentProps = {|
    ...CreateSystemPaymentProps,
    serviceId: string,
    userId: string,
    makeResponse: MakeResponse,
    redirect: string => void,
|}

type MakePaymentProps = {
    id: string,
    httpRequestMethod: HTTPRequestSend,
    makeResponse: MakeResponse,
    PostTransport: PostTransportInterface
}

type DBPayment = {
    ...DBUpdateProps,
    userId: string,
    ...PaymentArgs
}

type DBUpdateProps = {|
    id: string,
    status: PaymentStatus
|}

type GetSystemPaymentProps = {
    id: string,
    httpRequestMethod: HTTPRequestSend
}

type GetFromDBProps = {
    id: string,
    makeResponse: MakeResponse
}

type CreateSystemPaymentProps = {|
    count: number,
    service: Service,
    returnURL?: string,
    httpRequestMethod: HTTPRequestSend
|}

type InsertToDBProps = {|
    userId: string,
    ...PaymentArgs,
    makeResponse: MakeResponse
|}

type PaymentArgs = {|
    serviceId: ?string,
    ...AmountValueProps
|}

type AmountValueProps = {|
    count: number,
    service: Service
|}

export type PaymentFields = {
    count?: ?number,
    service: Service,
    serviceId?: string,
    returnURL?: string
}

export type Service = "checks" | "webinar" | "subscription"
type PaymentStatus = "pending" | "waiting_for_capture" | "canceled" | "succeeded"

type Headers = {
    "Idempotence-Key": string
}

type Data = {
    amount: Amount,
    description: string,
    capture: false,
    confirmation: Confirmation
}

type Amount = {
    value: string,
    currency: "RUB"
}

type Confirmation = {
    type: 'redirect',
    return_url: string,
    confirmation_url?: string
}

type HandleProps = {
    payment: DBPayment,
    makeResponse: MakeResponse,
    PostTransport: PostTransportInterface
}

class Payment {

    static _auth() {
        const YANDEX_AUTH_TEST = '741591:test_EEoucVj5tRy1Fo-bIoMzWpEsH8ZJPXqlRAEIniCmjh8'
        const YANDEX_AUTH_PROD = '736152:live_y-iyKf558hXzp1h64QKGAjP-M-BCcXOTFes5rDSzhzw'
        return process.env.NODE_ENV === 'production' ? YANDEX_AUTH_PROD : YANDEX_AUTH_TEST
    }
    static _path = "/v3/payments"
    static _hostname = "api.yookassa.ru"

    _id: string
    _status: PaymentStatus
    _confirmationURL: string | null
    _amountValue: number

    constructor(props: PaymentProps) {

        const {id, status, confirmation, amount} = props

        this._id = id
        this._status = status
        this._confirmationURL = (confirmation && confirmation.confirmation_url) ? confirmation.confirmation_url : null
        this._amountValue = Number(amount.value)
    }

    get id(): string {
        return this._id
    }

    get status(): PaymentStatus {
        return this._status
    }

    get confirmationURL(): string | null {
        return this._confirmationURL
    }

    async insertToDB(props: InsertToDBProps): Promise<void> {
        const {userId, service, serviceId, count, makeResponse} = props
        const query = `mutation InsertPayment($id: ID!, 
                                              $userId: ID!, 
                                              $status: PaymentStatus!, 
                                              $price: Int!, 
                                              $service: Service!, 
                                              $serviceId: ID,
                                              $count: Int) {
                    insertPayment(id: $id, 
                                  userId: $userId, 
                                  status: $status, 
                                  price: $price, 
                                  service: $service, 
                                  serviceId: $serviceId,
                                  count: $count)
                }`
        const variables = {
            id: this.id, userId, status: this.status, service, serviceId, price: Payment.price(service), count
        }
        await makeResponse<DBPayment, void>(query, variables)
    }

    async updateDB(makeResponse: MakeResponse): Promise<void> {
        const mutation = `
                mutation UpdatePayment($id: ID!, $status: PaymentStatus!) {
                    updatePayment(id: $id, status: $status)
                }`
        const variables = {id: this.id, status: this.status}
        await makeResponse<DBUpdateProps, void>(mutation, variables)
    }

    handleService(props: HandleProps): ?Promise<void> {

        const {payment} = props
        const {count, status, service} = payment

        const amountValue = Payment.price(service) * count

        if(this._status === "waiting_for_capture" && status === "pending" && this._amountValue >= amountValue){
            switch (service) {
                case "checks":
                    return Payment.checks(props)
                case "webinar":
                    return Payment.webinar(props)
                case "subscription":
                    return Payment.subscription(props)
            }
        }
    }

    static async _createSystemPayment(props: CreateSystemPaymentProps): Promise<Payment> {

        const {count, service, httpRequestMethod} = props

        const serviceDescriptions = {
            checks: `Проверка самостоятельной работы в количестве ${count} шт.`,
            webinar: "Участие в вебинаре",
            subscription: "Подписка"
        }
        const description = serviceDescriptions[service]
        const headers = {"Idempotence-Key": v4()}
        const returnURL = ABSOLUTE_SITE_ADDRESS + (props.returnURL ? props.returnURL : "/")
        const data = {
            amount: {value: String(Payment.amountValue({service, count})), currency: "RUB"},
            description,
            capture: false,
            confirmation: {type: 'redirect', return_url: returnURL}
        }

        return new Payment(await httpRequestMethod<Headers, Data, PaymentProps>({
            auth: Payment._auth(), path: Payment._path, hostname: Payment._hostname, method: "POST", headers, data
        }))
    }

    static async _getSystemPayment(props: GetSystemPaymentProps): Promise<Payment> {
        const {id, httpRequestMethod} = props
        const path = Payment._path + '/' + id
        const paymentProps = await httpRequestMethod<null, null, PaymentProps>({
            auth: Payment._auth(), path, hostname: Payment._hostname, method: "GET"
        })
        return new Payment(paymentProps)
    }

    static async _getFromDB(props: GetFromDBProps): Promise<DBPayment | null> {
        const {id, makeResponse} = props
        const query = `query Payment($id: ID!) {
                payment(id: $id) {
                    id
                    status
                    service
                    serviceId
                    count
                    price
                    userId
                }
            }`
        return (await makeResponse<{id: string}, DBPayment>(query, {id})).payment
    }

    static price(service: Service): number {
        switch(service) {
            case "checks":
                return 50
            case "subscription":
                return 250
            case "webinar":
                return 150
            default:
                throw new Error("Сервис не существует")
        }
    }

    static amountValue(props: AmountValueProps): number {
        return props.count * Payment.price(props.service)
    }

    static async send(props: PaymentFields): Promise<void> {

        const {service, returnURL, serviceId} = props
        if (!props.count && service === "checks") return
        if (!props.serviceId && service === "webinar")
            throw new Error('Для сервиса "webinar" ожидалось наличие serviceId')
        const count = props.count ? props.count : 1

        await setYandexMetrikaGoal({name: service + "Payment", price: Payment.amountValue({service, count})})

        const form = redirect("/payment/create", false)
        form.input("service", service)
        form.input("count", count)
        if(serviceId) form.input("serviceId", serviceId)
        if(returnURL) form.input("returnURL", returnURL)
        form.submit()
    }

    static async create(props: CreatePaymentProps): Promise<void> {
        const {userId, returnURL, httpRequestMethod, makeResponse, redirect, serviceId, ...paymentArgs} = props
        const payment: Payment = await Payment._createSystemPayment({...paymentArgs, returnURL, httpRequestMethod})
        await payment.insertToDB({userId, serviceId, makeResponse, ...paymentArgs})
        if(!payment.confirmationURL) throw("Не был передан URL для направления на оплату")
        redirect(payment.confirmationURL)
    }

    static async make(props: MakePaymentProps): Promise<void> {

        const {id, httpRequestMethod, makeResponse, PostTransport} = props
        const [dbPayment, payment] = await Promise.all([
            Payment._getFromDB({id, makeResponse}),
            Payment._getSystemPayment({id, httpRequestMethod})
        ])
        if (!dbPayment) {
            throw Error(`Получен запрос с ID платежа. Такой платеж не был зарегистрирован.`)
        }

        await Promise.all([
            payment.handleService({payment: dbPayment, makeResponse, PostTransport}),
            payment.updateDB(makeResponse)
        ])
    }

    static async checks(props: HandleProps): Promise<void> {

        const {payment, makeResponse, PostTransport} = props
        const {count, userId} = payment
        await Promise.all([
            Profile.incChecks({makeResponse, userId, count}),
            PostTransport.sendInfoToTeacher({subject: 'Payment', message: `Была сделана покупка проверок.`})
        ])
    }

    static async webinar(props: HandleProps): Promise<void> {
        try {
            const {payment, makeResponse, PostTransport} = props
            const {userId, serviceId} = payment

            const [profile, webinar] = await Promise.all([
                Profile.make({id: userId, makeResponse}),
                Webinar.make({id: serviceId, makeResponse}),
                WebinarRegistration.confirm({userId, webinarId: serviceId, makeResponse})
            ])

            const html = `<p>Добрый день, ${profile.name}! Вы записались на вебинар "${webinar.heading}", который ` +
                `состоится ${webinar.day} в ${webinar.time}. Для участия в вебинаре ` +
                `воспользуйтесь <a href="${webinar.link}">ссылкой</a></p>`
            const subject = "Тетрадка в клеточку приглашает на вебинар"
            await PostTransport.send({email: profile.email, html, subject})
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    static async subscription(props: HandleProps): Promise<void> {

        const {payment, makeResponse, PostTransport} = props
        const {userId} = payment

        const subscriber = await Profile.loadSubscriber({userId, makeResponse})
        const timeStamp = Subscription.addOneMonthByTimeStamp(subscriber.subscription)
        const html = `<p>Добрый день, ${subscriber.name}!</p><p>Спасибо, что подписались на мои услуги.</p>` +
            `<p>Теперь Вы можете бесплатно посещать любые мои вебинары и отправлять на проверку самостоятельные ` +
            `работы в неограниченном количестве.</p><p>Если у Вас возникнут вопросы по работе системы обучения, то можете отправлять их мне по ` +
            `электронной почте или отправить сообщение с помощью WhatsApp или Viber. Я всегда отвечу на Ваши вопросы ` +
            `<a href="https://vk.com/tetradkavkletochku">в сообществе в VK</a></p>` +
            `<p>С уважением, Николай Юрьевич Янчев!</p><p>email: nu.yanchev@gmail.com, тел +7 919 962 81 92</p>`
        const subject = "Тетрадка в клеточку. Подписка на месяц."
        await Promise.all([
            Profile.updateSubscription({userId, timeStamp, makeResponse}),
            PostTransport.send({email: subscriber.email, html, subject})
        ])
    }
}

export default Payment