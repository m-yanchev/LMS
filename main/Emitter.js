class Emitter {

    constructor() {
        this._events = {};
    }

    on( props, listener, count ) {
        try {
            if ( typeof props === 'string' ) {
                this._onByType( props, listener, count )
            } else {
                props.forEach( type => {
                    this._onByType( type, listener, count )
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    _onByType( type, listener, count ) {
        this._events[type] = this._events[type] || [];
        this._events[type].push( { listener, count } );
    }

    emit( props, event ) {
        try {
            if ( typeof props === 'string' ) {
                this._emitByType( props, event )
            } else {
                props.forEach( type => {
                    this._emitByType( type, event )
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    _emitByType( type, event ) {
        try {
            if ( this._events[type] ) {
                this._events[type].forEach( ( { listener, count }, i, listeners ) => {
                    listener(event);
                    if (count !== undefined) {
                        count--;
                        if (count < 1) {
                            listeners.splice(i, 1);
                        } else {
                            listeners[i].count--
                        }
                    }
                } )
            }
        } catch (e) {
            console.error(e)
        }
    }

    unsubscribe() {
        this._events = {};
    }
}

export default Emitter