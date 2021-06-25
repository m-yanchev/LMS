//@flow
import React, {useState} from "react"
import type {Element} from "react"
import {FormTextField} from "./Dialog";

type InputValidationProps = {|
    defaultValue?: string,
    error?: boolean,
    onConfirm: void => void,
    onChange: (string | null) => void,
    validate: string => boolean,
    errorMessage: string,
    autoFocus?: boolean,
    label: string,
    required?: boolean,
    min?: number,
    onClose: void => void,
    type: string
|}

export type InputValidationElement = Element<FormTextField>

function InputValidation(props: InputValidationProps): InputValidationElement {

    const {defaultValue, error, errorMessage, onConfirm, onChange, validate, ...rest} = props
    const [value, setValue] = useState<string>(defaultValue || "")
    const [valid, setValid] = useState<boolean>(true)
    const errorOrNotValid = error || !valid

    return <FormTextField value={value}
                          error={errorOrNotValid}
                          helperText={errorOrNotValid && errorMessage}
                          onConfirm={handleConfirm}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          {...rest}/>

    function handleConfirm(): void {
        if (validate(value)) {
            onConfirm()
        } else {
            setValid(false)
        }
    }

    function handleBlur(): void {
        if(!validate(value)) {
            setValid(false)
        }
    }

    function handleChange(value: string): void {
        setValid(true)
        setValue(value)
        if (validate(value)) {
            onChange(value);
        } else {
            onChange(null);
        }
    }
}

export default InputValidation