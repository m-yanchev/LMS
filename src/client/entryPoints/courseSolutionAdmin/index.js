import ReactDOM from "react-dom";
import React, {useEffect, useState} from "react";
import CourseSolutionAdmin from "./CourseSolutionAdmin";
import UserMode from "../../../depricated/common/components/UserMode";
import Profile from "../../../depricated/common/logic/Profile";
import BackDropSpinner from "../../../depricated/common/components/BackDropSpinner";
import ErrorView from "../../../depricated/common/components/ErrorView";

ReactDOM.render(<App/>, document.getElementById('root'))

function App() {

    const [profile, setProfile] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isInstance = true
        Profile.load().then(profile => {
            if (isInstance) setProfile(profile)
        }).catch(e => {
            console.error(e)
            setError(e)
        })
        return () => isInstance = false
    }, [])

    const CourseSolutionAdminWithAuth = UserMode(CourseSolutionAdmin)

    return <>{profile ?
        <CourseSolutionAdminWithAuth profile={profile}/> :
        <>{error ?
            <ErrorView/> :
            <BackDropSpinner/>}
        </>}
    </>
}