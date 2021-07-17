//@flow
import React from "react"
import InputValidation from "./InputValidation";
import type {InputValidationElement} from "./InputValidation";

export type NumberFieldProps = {|
    defaultValue: number,
    onConfirm: void => void,
    onClose: void => void,
    onChange: (number | null) => void,
    min: number,
    errorMessage: string,
    autoFocus?: boolean,
    label: string,
    required?: boolean
|}

function NumberField(props: NumberFieldProps): InputValidationElement {

    const {onChange, min, defaultValue, ...rest} = props

    return <InputValidation type="number"
                            validate={validate}
                            onChange={handleChange}
                            min={min}
                            defaultValue={String(defaultValue)}
                            {...rest}/>

    function handleChange(value: string | null): void {
        onChange(value === null ? null : Number(value))
    }

    function validate(value: string): boolean {
        return !Boolean(value.match(/\D/)) && Number(value) >= min
    }
}

export default NumberField