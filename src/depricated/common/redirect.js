export function redirect(path, submit = true) {

    const form = document.createElement('form')
    form.action = path
    form.method = "POST"

    if (submit) {
        send()
        return
    }

    return {
        input: (name, value) => form.innerHTML += `<input name="${name}" value="${value}"/>`,
        submit: () => send()
    }

    function send() {
        document.body.append(form)
        form.submit()
    }
}

