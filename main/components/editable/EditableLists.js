import React, {useEffect, useState} from 'react'
import ReactDOM from "react-dom";
import {Grid, List, ListItem, ListItemText, Typography, IconButton, Button} from '@material-ui/core';
import {makeStyles, styled} from '@material-ui/core/styles';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import ItemComponents from "../../HOC/ItemComponents";
import HandleDragAndDrop from "../../HOC/HandleDragAndDrop";
import ItemLoader from "../../HOC/ItemLoader";
import CallModal from "../../HOC/CallModal";
import WrapComponentFunctionStack from "../../HOC/WrapComponentFunctionStack";
import {ItemBox, ItemCard, ItemsContainer} from "./EditableBoxes";
import {RemoveButton, UpdateButton} from "../common/ButtonsForEdit";
import {EditableTest} from "../Test";

const useStyles = makeStyles(theme => ({
    editableGridItem: {
        width: "100%",
        overflow: "auto",
    },
    editableMenuList: {
        paddingTop: theme.spacing(3),
        paddingLeft: theme.spacing(2)
    }
}))

export function Tests(props) {
    return <EditableCards {...props} EditableField={EditableTest}/>
}

export function EditorShell(props) {

    const {EditingComponent, avatarRootDiv, modalRootDiv, path, ...otherProps} = props
    let listFuncStack = [{name: ItemComponents, otherProps: {path}}]
    if (avatarRootDiv) listFuncStack.push({name: HandleDragAndDrop, otherProps: {avatarRootDiv}})
    listFuncStack = listFuncStack.concat([{name: ItemLoader}, {name: CallModal, otherProps: {modalRootDiv}}])
    const WrapperComponent = WrapComponentFunctionStack(EditingComponent, listFuncStack)

    return <WrapperComponent modalRootDiv={modalRootDiv} {...otherProps}/>
}

export function HeadingGrid(props) {

    const {itemProps} = props;
    const {heading} = itemProps || {};

    return (<>
        <Typography variant="h1">{heading}</Typography>
        <EditableCards {...props}/></>)
}

export function EditableMenuList(props) {

    const classes = useStyles()
    const componentProps = {
        Container: List,
        containerProps: {className: classes.editableMenuList},
        Item
    }

    return <EditableBasis {...props} componentProps={componentProps}/>

    function Item(props) {

        const {styles, children, itemRef, id, editableActions} = props
        const StyledListItem = styled(ListItem)(styles || {})

        return (
            <StyledListItem ref={itemRef} id={id}>
                <ListItemText>{children}</ListItemText>
                {editableActions}
            </StyledListItem>
        )
    }
}

export function EditableCards(props) {

    const {EditableField, fullSize, ...rest} = props
    const {isEditMode} = props.userModeProps
    const [editingItemId, setEditingItemId] = useState(null)
    const open = Boolean(editingItemId && isEditMode)

    const componentProps = {
        Container: ItemsContainer,
        containerProps: {},
        Item: Item
    }

    return <>
        {EditableField &&
        <EditableField open={open}
                       id={editingItemId}
                       onClose={handleClose}
                       avatarRootDiv={props.avatarRootDiv}
                       modalRootDiv={props.modalRootDiv}/>}
        <EditableBasis {...rest} componentProps={componentProps} editableActions={EditableField && [EditButton]}/>
    </>

    function handleClose() {
        setEditingItemId(null)
    }

    function Item(props) {

        const {children, ...rest} = props

        return <ItemBox><ItemCard fullSize={fullSize} {...rest}>{children}</ItemCard></ItemBox>
    }

    function EditButton(props) {

        return <Button onClick={handleClick}>Редактировать</Button>

        function handleClick(event) {
            event.stopPropagation()
            setEditingItemId(props.id)
        }
    }
}

export function EditableGrid(props) {

    const classes = useStyles()
    const componentProps = {
        Container: ItemsContainer,
        containerProps: {container: true},
        Item: Item
    }

    return <EditableBasis {...props} componentProps={componentProps}/>

    function Item(props) {

        const {styles, children, itemRef, id, editableActions} = props
        const editableItemProps = props.editableItemProps || {}
        const StyledGrid = styled(Grid)(styles || {})

        return (
            <ItemBox>
                <StyledGrid className={classes.editableGridItem}
                            container
                            item
                            ref={itemRef}
                            id={id}
                            {...editableItemProps}>
                    <Grid item>
                        {editableActions}
                    </Grid>
                    <Grid item>
                        {children}
                    </Grid>
                </StyledGrid>
            </ItemBox>
        )
    }
}

export function EditableBasis(props) {
    const {itemProps, componentProps, ...rest} = props;
    const {componentList} = itemProps
    const {Container, containerProps, Item} = componentProps

    const handleMouseDown = (event) => {
        componentList.handleMouseDown(event)
    };

    return (<>
        {(componentList.length || componentList.editModeOn) &&
        <Container {...containerProps}
                   onMouseDown={handleMouseDown}>
            <EditableTools componentList={componentList}
                           Item={Item}
                           {...rest}/>
        </Container>}
    </>);
}

function EditableTools(props) {

    const {componentList, Item} = props;

    return (<>
        {componentList.map((item, index) =>
            <ItemTools key={item.id} item={item} index={index} {...props}/>)}
        {componentList.editModeOn &&
        <InsertBox index={componentList.length} Item={Item} componentList={componentList}/>}
        {componentList.dragComponentItem &&
        <DragItem {...props}/>}
    </>)
}

function ItemTools(props) {

    const {componentList, Item, index} = props;

    const styles = {
        boxSizing: 'border-box',
        marginTop: 0,
        marginLeft: 0,
        visibility: index + 1 === componentList.dragComponentNumber ? 'hidden' : 'inherit'
    }

    return (<>
        {componentList.editModeOn &&
        <InsertBox index={index} Item={Item} componentList={componentList}/>}
        <FormatItem styles={styles} {...props}/>
    </>)
}

function InsertBox(props) {

    const {index, componentList, Item} = props;

    const handleClick = (event) => {
        event.stopPropagation()
        componentList.handleClick({name: 'insert-box', number: index + 1, parentId: componentList.parentId})
    };
    return (
        <Item>
            <IconButton onClick={handleClick}><AddOutlinedIcon/></IconButton>
        </Item>
    )
}

function DragItem(props) {

    const {componentList} = props;
    const dragBox = componentList.dragData.box;

    const styles = {
        boxSizing: 'border-box',
        marginTop: 0,
        marginLeft: 0,
        position: "fixed",
        left: dragBox.left,
        top: dragBox.top,
        width: dragBox.width,
        height: dragBox.height,
        zIndex: 150
    }

    const {dragComponentItem, dragComponentNumber} = componentList;
    const index = dragComponentNumber - 1;

    return ReactDOM.createPortal(
        <FormatItem styles={styles} item={dragComponentItem} index={index} {...props}/>, props.avatarRootDiv)
}

function FormatItem(props) {

    const {styles, Item, item, index, componentList, itemProps, editableActions, ...rest} = props;
    const {editModeOn} = componentList;
    const ref = React.createRef();

    useEffect(() => {
        componentList.handleComponentMount(ref.current, item.id, item.component.type.displayName);
        return () => {
            componentList.handleComponentUnmount(item.id)
        }
    });

    const handleClick = (event) => {
        componentList.handleClick({name: event.name, number: index + 1, parentId: componentList.parentId});
    }

    const formatEditableActions = editModeOn ? [<EditButtons key="editButtons" onClick={handleClick}/>].concat(
        (editableActions || []).map((Action, i) => <Action key={i} id={item.id}/>)) : undefined
    return (
        <Item styles={styles}
              itemRef={ref}
              id={item.id}
              {...itemProps}
              editableActions={formatEditableActions}
              number={index + 1}
              {...rest}>
            {item.component}
        </Item>
    )
}

function EditButtons(props) {
    return [<UpdateButton key="update" {...props}/>, <RemoveButton key="remove" {...props}/>]
}