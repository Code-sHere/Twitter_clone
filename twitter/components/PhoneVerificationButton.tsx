"use client";

import React, { useEffect } from "react";

declare global {
    interface Window {
        phoneEmailListener?: (userObj: any) => void;
    }
}

interface PhoneEmailButtonProps {
    onSuccess: (userObj: any) => void;
}

export default function PhoneEmailButton({
    onSuccess,
}: PhoneEmailButtonProps) {

    useEffect(() => {

        // Create Phone.Email listener
        window.phoneEmailListener = (userObj: any) => {

            console.log(
                "Phone.Email verification successful:",
                userObj
            );

            onSuccess(userObj);
        };

        // Load Phone.Email script
        const script = document.createElement("script");

        script.src =
            "https://www.phone.email/sign_in_button_v1.js";

        script.async = true;

        const container =
            document.querySelector(".pe_signin_button");

        if (container) {
            container.appendChild(script);
        }

        return () => {
            window.phoneEmailListener = undefined;
        };

    }, [onSuccess]);

    return (
        <div
            className="pe_signin_button"
            data-client-id="11719579498554585673"
        />
    );
}