import React from 'react'
import { Check, Crown, Medal, Star, ShieldCheck, Minus, Badge, LoaderPinwheel, LoaderCircle, RefreshCcw, HelpCircle, BadgeHelp, Lock } from "lucide-react";


const Plans = () => {

    const plans = [
        {
            id: "free",
            name: "FREE",
            tagline: "For getting started",
            price: 0,
            icon: Star,
            accent: "text-slate-300",
            iconBg: "bg-slate-700/40",
            border: "border-slate-700",
            button: "bg-slate-700 hover:bg-slate-600 text-slate-200",
            check: "bg-slate-600 text-white",
            nameColor: "text-white",
            popular: false,
            cta: "Current Plan",
            features: ["1 Tweet per month", "Basic profile", "Standard support"],
        },
        {
            id: "bronze",
            name: "BRONZE",
            tagline: "More tweets, more power",
            price: 100,
            icon: Star,
            accent: "text-orange-400",
            iconBg: "bg-orange-500/15",
            border: "border-orange-700/40",
            button: "bg-orange-600 hover:bg-orange-500 text-white",
            check: "bg-orange-500 text-white",
            nameColor: "text-orange-400",
            popular: false,
            cta: "Upgrade Now",
            features: [
                "3 Tweets per month",
                "Basic profile",
                "Standard support",
                "Access to analytics",
            ],
        },
        {
            id: "silver",
            name: "SILVER",
            tagline: "More tweets, more reach",
            price: 300,
            icon: Medal,
            accent: "text-sky-400",
            iconBg: "bg-sky-500/15",
            border: "border-sky-500",
            button: "bg-sky-500 hover:bg-sky-400 text-white",
            check: "bg-sky-500 text-white",
            nameColor: "text-white",
            popular: true,
            cta: "Upgrade Now",
            features: [
                "5 Tweets per month",
                "Profile customization",
                "Advanced analytics",
                "Priority support",
                "Early access to new features",
            ],
        },
        {
            id: "gold",
            name: "GOLD",
            tagline: "Unlimited & premium",
            price: 1000,
            icon: Crown,
            accent: "text-yellow-400",
            iconBg: "bg-yellow-500/15",
            border: "border-yellow-700/40",
            button: "bg-yellow-500 hover:bg-yellow-400 text-black",
            check: "bg-yellow-500 text-black",
            nameColor: "text-yellow-400",
            popular: false,
            cta: "Go Premium",
            features: [
                "Unlimited tweets",
                "All premium features",
                "Advanced analytics",
                "Priority support",
                "Early access to new features",
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#14243f]">
            <div className="flex flex-col items-center text-center justify-center p-2">
                <h1 className="text-2xl font-bold md:text-4xl sm:text-3xl text-white font-mono">Level up your Twitter experience</h1>
                <p className="text-l text-gray-400 font-mono mt-5">Pick a plan that's fits your vibe. More tweets. more reach, more impact.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 p-5 ">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border ${plan.border} bg-[#0b1424] p-5 shadow-xl transition-transform duration-200 hover:-translate-y-1 w-full  min-w-[350px] ${plan.popular ? "ring-1 ring-sky-500/60 shadow-sky-500/10" : ""
                                } h-[450px]`}
                        >
                            {plan.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                                    POPULAR
                                </span>
                            )}

                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className={`text-lg font-extrabold tracking-wide ${plan.nameColor}`}>
                                        {plan.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-400">{plan.tagline}</p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${plan.iconBg}`}>
                                    <Icon className={`h-5 w-5 ${plan.accent}`} />
                                </div>
                            </div>

                            <div className="mt-5 flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-white">
                                    ₹{(plan.price)}
                                </span>
                                <span className="text-xs text-slate-500">
                                    /month
                                </span>
                            </div>

                            <div className="my-4 h-px bg-slate-800" />

                            <ul className="flex-1 space-y-2.5">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${plan.check}`}>
                                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition ${plan.button}`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-row gap-5 items-center text-center justify-center p-2 h-[180px] border-2 rounded-3xl mt-10 ml-10 mr-10">
                <div className="flex flex-col items-center">
                    <ShieldCheck className="text-purple-500 h-10 w-10" />
                    <h4 className="text-white mt-2 font-bold">Secure Payments</h4>
                    <span className="text-gray-400 font-light">100% Safe and Secure.</span>
                </div>
                <div className="flex flex-col items-center">
                    <RefreshCcw className="text-purple-500 h-10 w-10" />
                    <h4 className="text-white mt-2 font-bold">Cancel Anytime</h4>
                    <span className="text-gray-400 font-light">Change or cancel your plan anytime you want.</span>
                </div>
                <div className="flex flex-col items-center">
                    <BadgeHelp className="text-purple-500 h-10 w-10" />
                    <h4 className="text-white mt-2 font-bold">Permium Support</h4>
                    <span className="text-gray-400 font-light">Our support team is here for you 24/7.</span>
                </div>
                <div className="flex flex-col items-center">
                    <Lock className="text-purple-500 h-10 w-10" />
                    <h4 className="text-white mt-2 font-bold">Your Data is Safe</h4>
                    <span className="text-gray-400 font-light">We never sell your data. Privacy is our priority.</span>
                </div>
            </div>

        </div>
    )
}

export default Plans
