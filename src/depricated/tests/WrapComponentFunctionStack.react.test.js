import React from 'react'
import WrapComponentFunctionStack from '../../client/entryPoints/main/HOC/WrapComponentFunctionStack'
import renderer from "react-test-renderer";

test('functionStack', () => {

    const funcData = [
        {
            name: func1,
            otherProps: {value:2, data:{name: 'Nicholas', phone: '+7 917 951 75 34' }}
        },{
            name: func2
        },{
            name: func3,
            otherProps: {}
        },{
            name: func4,
            otherProps: {str:'yes'}
        },{
            name: func5,
            otherProps: {array:[1, 2, 3]}
        }];

    class ReactComponent extends React.Component {
        render() {
            return <div>Hello</div>
        }
    }

    const ResultComponent = WrapComponentFunctionStack( ReactComponent, funcData);

    const component = renderer.create(
        <ResultComponent/>,
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    function func1(WrapComponent, otherProps) {
        return class extends React.Component {
            render(){
                return (<>
                        <WrapComponent/>
                        <p>{otherProps.value}</p>
                        <p>{otherProps.data.name}</p>
                        <p>{otherProps.data.phone}</p>
                    </>
                )
            }
        }
    }

    function func2(WrapComponent) {
        return class extends React.Component {
            render(){
                return (<>
                        <WrapComponent/>
                        <p>func2</p>
                    </>
                )
            }
        }
    }

    function func3(WrapComponent) {
        return class extends React.Component {
            render(){
                return (<>
                        <WrapComponent/>
                        <p>func3</p>
                    </>
                )
            }
        }
    }

    function func4(WrapComponent, otherProps) {
        return class extends React.Component {
            render(){
                return (<>
                        <WrapComponent/>
                        <p>{otherProps.str}</p>
                    </>
                )
            }
        }
    }

    function func5(WrapComponent) {
        return class extends React.Component {
            render(){
                return <WrapComponent/>
            }
        }
    }
});