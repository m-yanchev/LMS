import React from "react";
import InputValidation from "./InputValidation";

export default function EmailInput(props) {

    const {error, ...rest} = props

    return <InputValidation id="email"
                            type="email"
                            label="E-mail"
                            error={error}
                            errorMessage='Неверный формат адреса электронной почты'
                            validate={validate}
                            {...rest}/>

    function validate(value) {
        return Boolean(value.match(/\S+@\S+\.\S+/))
    }
}