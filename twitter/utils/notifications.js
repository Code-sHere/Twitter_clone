const KEYWORDS = ["circket", "science"];

export const containsNotificationKeyword = (content) =>{
    if(!content) return false;

    const text = content.toLowerCase();

    return KEYWORDS.some((keyword) => text.includes(keyword));
}

export const requestNotificationPermission = async () =>{
    if(!("Notification" in window)){
        console.log("Browser does not support notifications");
        return "unsuported";
    }

    if(Notification.permission === "granted"){
        return "granted";
    }

    if(Notification.permission === "denied"){
        return "denied";
    }
    
    const permission = await Notification.requestPermission();
    return permission;

}

export const showTweetNotification = (tweetContent)=>{
    if(!("Notification" in window)){
        console.log("Browser does not support notifications");
        return;
    }

    if(Notification.permission === "granted"){
        new Notification("New Tweet", {
            body: tweetContent,
            icon: "/favicon.ico"
        });
    }else{
        console.log("Notification permission not granted");
        return;
    }
}