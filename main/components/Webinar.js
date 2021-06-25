import React, {useState} from "react";
import {Description, GreatInfo, ItemCardHeader} from "./common/Boxes";
import {CardActionArea, CardContent} from "@material-ui/core";
import {formatDate, formatTime} from "../../common/DateTime";
import {RegistrationDialog} from "../../common/components/Dialog";
import {Informer} from "../../common/components/Informer";
import BackdropSpinner from "../../common/components/BackDropSpinner";
import {WEBINAR_PRICE} from "../../common/constants";

export default function WebinarComponent(props) {

    const {id, content, userProps} = props;
    const {heading, date} = content
    const {onAuth, profile, activeService} = userProps
    const [view, setView] = useState("base")
    const ERROR_MESSAGE = "Извините, не получилось записать Вас на вебинар из за ошибки в системе. Попробуйте " +
        "повторить позже."
    const REGISTRATION_MESSAGE = `Стоимость участия в вебинаре ${WEBINAR_PRICE} рублей. После оплаты, ` +
        `на указанный электронный адрес система пришлет инструкцию для подключения и код доступа.`

    return <>
        <CardActionArea onClick={handleClick}>
            <ItemCardHeader title={heading}/>
            <CardContent>
                <Description>Начинаем </Description>
                <GreatInfo>{formatDate(date)}</GreatInfo>
                <Description> в </Description>
                <GreatInfo>{formatTime(date)}</GreatInfo>
            </CardContent>
        </CardActionArea>
        <RegistrationDialog open={view === "registration"}
                            activeService={activeService}
                            title={'Запись на вебинар "' + heading + '"'}
                            message={REGISTRATION_MESSAGE}
                            price={WEBINAR_PRICE}
                            defaultEmail={profile.email}
                            onClose={handleClose}
                            service={"webinar"}
                            onError={() => setView("error")}
                            onBackDrop={() => setView("backdrop-spinner")}
                            id={id}/>
        <Informer message={view === "error" && {desc: ERROR_MESSAGE, title: "Ошибка"}} onClose={handleClose}/>
        <BackdropSpinner open={view === "backdrop-spinner"}/>
    </>

    function handleClick() {
        onAuth({
            callback: () => setView("registration"),
            activeService: {name: "webinar", id},
            message: "Для получения ссылки на вебинар, необходимо войти в систему"
        })
    }

    function handleClose() {
        setView("base")
    }
}