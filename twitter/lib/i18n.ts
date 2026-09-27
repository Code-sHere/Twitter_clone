import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/eng.json";
import es from "@/locales/spa.json";
import hi from "@/locales/hin.json";
import pt from "@/locales/ptu.json";
import zh from "@/locales/chi.json";
import fr from "@/locales/fre.json";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: en
            },
            es: {
                translation: es
            },
            hi: {
                translation: hi
            },
            pt: {
                translation: pt
            },
            zh: {
                translation: zh
            },
            fr: {
                translation: fr
            }
        },

        lng: "en",

        fallbackLng: "en",

        interpolation: {
            escapeValue: false
        }
    });

export default i18n;