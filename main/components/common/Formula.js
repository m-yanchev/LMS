import React from 'react'
import ErrorBoundary from "../../../ReactApp/smartComponents/ErrorBoundary";

export default class Formula extends React.Component {

    state = {
        visibility: 'hidden'
    };

    ref = React.createRef();

    componentDidMount() {
        this._typeset()
    }

    isUnmounted = false;

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {children} = this.props;
        const {visibility} = this.state;
        return <ErrorBoundary><span ref={this.ref} style={{visibility}}>{children}</span></ErrorBoundary>
    }

    _typeset() {
        if (!window.MathJax || !window.MathJax.isReady) {
            if (!window.waitMathJax) {
                window.waitMathJax = {
                    formulas: [this],
                    queueTypesets
                }
            } else {
                window.waitMathJax.formulas.push(this)
            }
        } else {
            queueTypeset(this);
        }

        function queueTypesets() {
            window.waitMathJax.formulas.forEach(formula => queueTypeset(formula))
        }

        function queueTypeset(formula) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, formula.ref.current], formula._setVisible)
        }
    }

    _setVisible = () => {
        if(!this.isUnmounted) this.setState({visibility: 'inherit'})
    }
}