"use client";

import {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {useAuth} from "@/context/AuthContext";

export default function LanguageSync() {
    const {user} = useAuth();
    const {i18n} = useTranslation();

    useEffect(()=>{
        const lang = (user as any)?.language || localStorage.getItem("lang") || "en";
        i18n.changeLanguage(lang);
    },[user?._id]);

    return null;
}