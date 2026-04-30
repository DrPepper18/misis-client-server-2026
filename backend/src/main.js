function sendActionToApp(type, payload, context) {
    context.response.replies = context.response.replies || [];
    context.response.replies.push({
        type: "raw",
        body: {
            items: [{
                command: {
                    type: "smart_app_data",
                    smart_app_data: {
                        type: type,
                        payload: payload
                    }
                }
            }]
        }
    });
}