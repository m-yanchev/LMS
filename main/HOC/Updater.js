import React from 'react'

export default function Updater(WrappedComponent, otherProps = {}) {

    return class Components extends React.Component {

        constructor(props) {
            super(props);
            this.initialization();
        }

        initialization = () => {

            const {content} = this.props;
            if (!content || typeof content !== 'object') throw new TypeError('content is not an object');

            this.state = {
                contentData: content
            };
        };

        render = () => {

            const {userModeProps} = this.props;
            if (!userModeProps || typeof userModeProps !== 'object')
                throw new Error('Expected "userModeProps" prop is an object');
            const {avatarRootDiv} = otherProps;
            if(avatarRootDiv && typeof avatarRootDiv !== 'object')
                throw new TypeError('avatarRootDiv is not an object');

            return (
                <WrappedComponent
                    itemProps={{
                        taskDesc: this.props.content.taskDesc,
                        onUpdate: this.handleUpdate,
                        contentData: this.state.contentData,
                        isEditMode: userModeProps.isEditMode
                    }}
                    {...this.props}
                />
            )
        };

        handleUpdate = async (event) => {

            const {modalProps, loaderProps} = this.props;
            if (!modalProps || typeof modalProps !== 'object')
                throw new Error('Expected "modalProps" prop is an object');
            if (typeof modalProps.onInput !== 'function')
                throw new Error('Expected "modalProps.onInput" prop is a boolean');
            if (!loaderProps || typeof loaderProps !== 'object')
                throw new Error('Expected "loaderProps" prop is an object');
            if (typeof loaderProps.update !== 'function')
                throw new Error('Expected "loaderProps.update" prop is a boolean');

            const {model, Form, id, key, prevContent} = event;
            if (typeof Form !== 'function')
                throw new Error('Expected "Form" is an function');
            if (typeof model !== 'string')
                throw new Error('Expected "model" is string');
            if (typeof id !== 'string')
                throw new Error('Expected "id" is string');
            if (key !== undefined && typeof key !== 'string')
                throw new Error('Expected "key" is string');
            if (!prevContent || typeof prevContent !== 'object')
                throw new Error('Expected "prevContent" is an object');

            const newContent = await modalProps.onInput(Form, prevContent, key);
            if (newContent) {
                this.setState({contentData: {...newContent, id, key}});
                await loaderProps.update({
                    content: newContent, name: "Problem", model, id, key: key||id, restore: () => {
                        this.setState({contentData: {...prevContent, id, key}});
                    }
                });
            }
        };
    }
}