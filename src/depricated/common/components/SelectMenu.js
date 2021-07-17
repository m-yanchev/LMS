import React, {useState} from "react";
import {Popover, Paper, MenuList, MenuItem} from "@material-ui/core";

export function SelectMenu(props) {

    const {MainButton, itemList, onClick} = props
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    return <>
        <MainButton anchorRef={anchorEl} onClick={handleMainButtonClick}/>
        <Popover open={open}
                 anchorEl={anchorEl}
                 anchorOrigin={{vertical: "bottom", horizontal: "left"}}
                 onClose={handleClose}>
            <Paper>
                <MenuList autoFocusItem={open}>
                    {itemList.map(item =>
                        <MenuItem key={item.name} onClick={() => handleClick({name: item.name})}>
                            {item.title}
                        </MenuItem>
                    )}
                </MenuList>
            </Paper>
        </Popover>
    </>

    function handleMainButtonClick(event) {
        setAnchorEl(event.currentTarget)
    }

    function handleClose() {
        setAnchorEl(null)
    }

    function handleClick({name}) {
        onClick({name})
        setAnchorEl(null)
    }
}