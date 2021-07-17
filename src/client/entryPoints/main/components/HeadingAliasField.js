//@flow
import React, {Fragment, useState} from "react"
import type {Element} from "react"
import {FormTextField} from "../../../../depricated/common/components/Dialog";
import {CHAR_MAP} from "../constants";

type HeadingAliasFieldProps = {|
    autoFocus?: boolean,
    values: {heading: string, alias: string},
    onChange: (FieldName, string) => void,
    onConfirm: void => void,
    onClose: void => void
|}

type FieldName = "heading" | "alias"

function HeadingAliasField(props: HeadingAliasFieldProps): Element<typeof Fragment> {

    const {autoFocus, values, onChange, ...rest} = props
    const [heading, setHeading] = useState<string>(values.heading)
    const [alias, setAlias] = useState<string>(values.alias)

    return <>
        <FormTextField autoFocus={autoFocus || false}
                       label="Заголовок"
                       type="text"
                       value={heading}
                       onChange={value => handleChange("heading", value)}
                       {...rest}/>
        <FormTextField value={alias}
                       label="Алиас"
                       type="text"
                       onChange={value => handleChange("alias", value)}
                       {...rest}/>
    </>

    function handleChange(name: FieldName, value: string) :void {
        if (name === 'heading') {
            const newAlias = getAliasByHeading(value);
            setHeading(value);
            setAlias(newAlias);
            onChange('heading', value);
            onChange('alias', newAlias);
        } else {
            setAlias(value);
            onChange('alias', value);
        }
    }

    function getAliasByHeading(value: string) :string {
        const headingValue = value.toLowerCase();
        const aliasChars = [];
        let isPrevSpace = true;
        for (let i = 0; i < headingValue.length; i++) {
            const char = headingValue[i];
            if ((char <= 'z' && char >= 'a') || (char <= '9' && char >= '0')) {
                aliasChars.push(char);
                isPrevSpace = false;
            } else if (char <= 'я' && char >= 'а') {
                aliasChars.push(CHAR_MAP[char]);
                isPrevSpace = false;
            } else {
                if (!isPrevSpace) {
                    aliasChars.push('-');
                    isPrevSpace = true;
                }
            }
        }
        if (isPrevSpace) aliasChars.pop();
        return aliasChars.join('');
    }
}

export default HeadingAliasField