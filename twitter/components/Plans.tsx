"use client";

import React from 'react'
import { Check, Crown, Medal, ShieldCheck, ShieldLockIcon, StarIcon, RefreshCcwDotIcon, Send, XIcon, Zap } from "lucide-react";
import { Button } from "./ui/button";
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { FaBolt, FaTwitter } from "react-icons/fa";



const Plans = () => {

    const { user } = useAuth();

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");

            script.src = "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => {
                resolve(true);
            };

            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async (plan: string): Promise<void> => {
        console.log(plan);

        if (!user?.email) {
            toast.error("Please log in to subscribe");
            return;
        }

        try {
            const isLoaded = await loadRazorpay();

            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load");
                return;
            }

            const stored = localStorage.getItem("twitter-user");
            const email = stored ? JSON.parse(stored).email : null;

            if (!email) {
                toast.error("Please log in to subscribe");
                return;
            }

            const response = await fetch("http://localhost:5000/api/subscriptions/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    plan,
                    email,
                })
            })

            const data = await response.json();

            if (!data.success) {
                toast.error(data.message);
                return;
            }

            const options = {
                key: data.key,
                subscription_id: data.subscriptionId,

                name: "Twitter Clone",

                description: `${data.plan.name} Subscription`,
                prefill: {
                    email: data.user?.email || user?.email,
                    contact: "8595232967",
                },
                theme: {
                    color: "#1DA1F2",
                },
                handler: async (
                    response: RazorpayPaymentResponse
                ): Promise<void> => {
                    try {
                        const verifyResponse = await fetch(
                            "http://localhost:5000/api/subscriptions/verify",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json",
                                },

                                body: JSON.stringify({
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,

                                    razorpay_subscription_id:
                                        response.razorpay_subscription_id,

                                    razorpay_signature:
                                        response.razorpay_signature,
                                }),
                            }
                        );

                        const verifyData = await verifyResponse.json();

                        console.log("Verify Data:", verifyData);

                        if (verifyData.success) {
                            toast.success(verifyData.message);
                        } else {
                            toast.error(verifyData.message);
                        }
                    } catch (error) {
                        console.error(
                            "Verification Error:",
                            error
                        );
                    }
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", function (response: any) {
                console.error("RAZORPAY PAYMENT FAILED:", response);

                console.log("Error Code:", response.error?.code);
                console.log("Description:", response.error?.description);
                console.log("Reason:", response.error?.reason);
                console.log("Metadata:", response.error?.metadata);

                toast.error(
                    response.error.description || "Payment failed"
                );
            });
            razorpay.open();

        }
        catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    const plans = [
        {
            id: "free",
            name: "FREE",
            tagline: "For getting started",
            price: 0,
            icon: Send,
            accent: "text-slate-300",
            iconBg: "drop-shadow-[0_0_5px_#3b82f6]",
            border: "border-slate-700/40",
            bordershaow: "drop-shadow-[0_0_5px_#3b82f6]",
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
            icon: FaTwitter,
            accent: "text-orange-400",
            iconBg: "drop-shadow-[0_0_5px_#ea580c]",
            border: "border-orange-700/40",
            bordershaow: "drop-shadow-[0_0_5px_#ea580c]",
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
            icon: Zap,
            accent: "text-purple-400",
            iconBg: "drop-shadow-[0_0_5px_#a855f7]",
            border: "border-purple-500",
            bordershaow: "drop-shadow-[0_0_5px_#a855f7]",
            button: "bg-purple-500 hover:bg-purple-400 text-white",
            check: "bg-purple-500 text-white",
            nameColor: "text-purple-400",
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
            iconBg: "drop-shadow-[0_0_5px_#f59e0b]",
            border: "border-yellow-700/40",
            bordershaow: "drop-shadow-[0_0_5px_#f59e0b]",
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

    const bottomSection = [
        {
            badge: ShieldCheck,
            title: "Secure Payments",
            bg: "text-sky-600",
            desccription: "100% Safe and Secure",
        }, {
            badge: RefreshCcwDotIcon,
            title: "Cancel Anytime",
            bg: "text-green-600",
            desccription: "Change or cancel your plan anytime you want",
        }, {
            badge: StarIcon,
            title: "Permium Support",
            bg: "text-purple-600",
            desccription: "Our support team is here for you 24/7",
        }, {
            badge: ShieldLockIcon,
            title: "Your Data is Safe",
            bg: "text-yellow-600",
            desccription: "We never sell your data. Privacy is our priority",
        }

    ];

    return (
        <div className="min-h-screen bg-[#030817] py-16 text-center">
            <div className="flex flex-col items-center text-center justify-center p-2">
                <h1 className="text-2xl font-bold md:text-4xl sm:text-3xl text-white font-mono shadow-2xl drop-shadow-white/20">Level up your </h1>
                <h1 className="text-3xl font-bold md:text-5xl sm:text-4xl text-sky-500 font-mono">Twitter experience
                    
                </h1>
                <span className="absolute right-7 top-20 text-xl text-blue-500 drop-shadow-[0_0_8px_#3b82f6]">
                    ✦
                </span>

                <span className="absolute right-13 text-sm text-blue-400 drop-shadow-[0_0_6px_#3b82f6]">
                    ✦
                </span>
                <p className="text-l text-gray-400 font-mono mt-5">Pick a plan that's fits your vibe. More tweets. more reach, more impact.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-7 p-5 mx-8">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border ${plan.border} ${plan.bordershaow} bg-[#0b1424] p-5 transition-transform duration-200 hover:-translate-y-1 w-full min-w-[300px] ${plan.popular ? "ring-1 ring-purple-800/60 shadow-blue-800/30" : ""
                                } h-[450px] `}
                        >
                            {plan.popular && (
                                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-6 py-1 text-[12px] font-bold tracking-wide text-white shadow-xl shadow-blue-500/20 `}>
                                    POPULAR
                                </span>
                            )}

                            <div className={`flex  flex-col items-center justify-center`}>
                                <div className={`flex mt-2 h-10 w-10 items-center justify-center rounded-full `}>
                                    <Icon className={`h-10 w-10 ${plan.accent} shadow-2xl ${plan.iconBg}`} />
                                </div>
                                <div className="mt-4 flex ">
                                    <h3 className={`text-lg font-extrabold tracking-wide ${plan.nameColor}`}>
                                        {plan.name}
                                    </h3>
                                    <span className='text-white px-2 text-3xl'> / </span>
                                    <p className="mt-1 text-s text-slate-400"> {plan.tagline}</p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-baseline gap-1 mx-5">
                                <span className="text-3xl font-mono text-white">
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

                            <Button
                                className={`mt-6 w-full rounded-full py-3 text-sm font-semibold h-12 transition ${plan.button}`} onClick={() => handleSubscribe(`${plan.id}`)}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    );
                })}
            </div>
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-4 sm:grid-cols-2 shadow-2xl rounded-3xl h-full p-2">
                    {bottomSection.map((feature) => {
                        const Icon = feature.badge;
                        return (
                            <div className="flex flex-col items-center border-gray-600 p-2" key={feature.title}>
                                <Icon className={`h-8 w-8 ${feature.bg}`} />
                                <h4 className="text-white text-lg font-mono">{feature.title}</h4>
                                <span className="text-sm text-gray-600 ">{feature.desccription}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
    )
}

export default Plans
