import { contiansNotification, showTweetNotification } from "./notifications";

export const handleNotifications = ({
    tweet,
    notificationEnabled
}) =>{
    if(!notificationEnabled) return;

    if(!tweet?.content) return;

    const matched = contiansNotification(tweet.content);

    if(!matched) return;

    showTweetNotification(tweet.content);
}