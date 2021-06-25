import React from 'react'
import {Typography} from "@material-ui/core";

export default class Failure extends React.Component {
    render() {
        let message;
        switch (this.props.status) {
            case 404 :
                message = 'Страница не найдена.';
                break;
            case 500 :
                message = 'Ошибка на сервере.';
                break;
            default:
                message = 'Неизвестная ошибка.'
        }
        return <Typography variant="body1">{message}</Typography>
    }
}