let appControllerService = SYMPHONY.services.register("app:controller")
let navService
const origin = window.location.origin;
let appId = window.location.hostname === 'localhost' ? 'localhost-10443' : 'workflower';

let authenticate = () => {
    return $.post({
        url: '/bdk/v1/app/auth',
        success: res => $.when(res)
    })
}

let register = data => {
    let appToken = data["appToken"]
    return SYMPHONY.application.register(
            {
                appId: appId,
                tokenA: data["appToken"]
            },
            ['modules', 'applications-nav', 'extended-user-info'],
            ['app:controller']
    ).then(res => {
        res["tokenA"] = appToken
        let modulesService = SYMPHONY.services.subscribe("modules")
        navService = SYMPHONY.services.subscribe("applications-nav")
        navService.add('show-module', 'Workflower', 'app:controller')
        appControllerService.implement({
            select: id => {
                if (id === 'show-module') {
                    modulesService.show("test-app", {title: "Workflower"}, "app:controller", origin + "/app.html")
                }
            }
        })

        return $.when(res)
    })
}
SYMPHONY.remote.hello()
        .then(authenticate)
        .then(register)
