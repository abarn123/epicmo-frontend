(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/app/login/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>LoginPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
<<<<<<< HEAD
=======
// Create axios instance with default config
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: "http://192.168.110.100:8080",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
function LoginPage() {
    _s();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: "",
        password: ""
    });
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
<<<<<<< HEAD
=======
    const [rememberMe, setRememberMe] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
    const handleChange = (e)=>{
        const { id, value } = e.target;
        setFormData((prev)=>({
                ...prev,
                [id]: value
            }));
    };
<<<<<<< HEAD
=======
    const handleRememberMeChange = (e)=>{
        setRememberMe(e.target.checked);
    };
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
<<<<<<< HEAD
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("http://192.168.110.100:8080/login", {
                name: formData.name,
                password: formData.password
            });
            const data = response.data; // Menggunakan axios langsung untuk mendapatkan data
            if (!response.status === 200 || !data.status) {
                throw new Error(data.message || "Username atau password tidak sesuai");
            }
            console.log("Login successful", data);
            // Simpan token jika kamu mau pakai untuk autentikasi
            // localStorage.setItem("token", data.user.key);
            window.location.href = "/dashboard"; // Arahkan ke dashboard
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat login");
=======
            const { data } = await api.post("/login", {
                name: formData.name,
                password: formData.password,
                remember: rememberMe
            });
            if (!data.status) {
                throw new Error(data.message || "Username atau password tidak sesuai");
            }
            // Store token if available
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            // Redirect to dashboard
            window.location.href = "/dashboard";
        } catch (err) {
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isAxiosError(err)) {
                setError(err.response?.data?.message || "Terjadi kesalahan saat login");
            } else {
                setError(err.message || "Terjadi kesalahan saat login");
            }
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md border border-blue-100",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-50 h-50 flex items-center justify-center mb-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: "/epicmo.logo.png",
<<<<<<< HEAD
                                alt: "User Avatar",
                                className: "w-full h-full object-contain rounded-full"
                            }, void 0, false, {
                                fileName: "[project]/app/login/page.tsx",
                                lineNumber: 56,
=======
                                alt: "Company Logo",
                                className: "w-full h-full object-contain rounded-full",
                                onError: (e)=>{
                                    e.target.src = "/default-avatar.png";
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/login/page.tsx",
                                lineNumber: 74,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                            lineNumber: 55,
=======
                            lineNumber: 73,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl font-bold text-gray-800",
                            children: "Welcome Back"
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
                            lineNumber: 83,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-500 text-sm",
                            children: "Sign in to your account"
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                            lineNumber: 62,
=======
                            lineNumber: 84,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                    lineNumber: 54,
=======
                    lineNumber: 72,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                    lineNumber: 65,
=======
                    lineNumber: 88,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    className: "space-y-6",
                    onSubmit: handleSubmit,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "name",
                                    className: "block text-sm font-semibold text-gray-700 mb-1",
                                    children: "Username"
                                }, void 0, false, {
                                    fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                                    lineNumber: 71,
=======
                                    lineNumber: 95,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    id: "name",
                                    className: "block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-gray-900 placeholder-gray-400",
<<<<<<< HEAD
                                    placeholder: "Username",
                                    required: true,
                                    value: formData.name,
                                    onChange: handleChange
                                }, void 0, false, {
                                    fileName: "[project]/app/login/page.tsx",
                                    lineNumber: 77,
=======
                                    placeholder: "Enter your username",
                                    required: true,
                                    value: formData.name,
                                    onChange: handleChange,
                                    disabled: loading,
                                    autoComplete: "username"
                                }, void 0, false, {
                                    fileName: "[project]/app/login/page.tsx",
                                    lineNumber: 101,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                            lineNumber: 70,
=======
                            lineNumber: 94,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "password",
                                    className: "block text-sm font-semibold text-gray-700 mb-1",
                                    children: "Password"
                                }, void 0, false, {
                                    fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                                    lineNumber: 88,
=======
                                    lineNumber: 115,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "password",
                                    id: "password",
                                    className: "block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-gray-900 placeholder-gray-400",
<<<<<<< HEAD
                                    placeholder: "Password",
                                    required: true,
                                    value: formData.password,
                                    onChange: handleChange
                                }, void 0, false, {
                                    fileName: "[project]/app/login/page.tsx",
                                    lineNumber: 94,
=======
                                    placeholder: "Enter your password",
                                    required: true,
                                    value: formData.password,
                                    onChange: handleChange,
                                    disabled: loading,
                                    autoComplete: "current-password"
                                }, void 0, false, {
                                    fileName: "[project]/app/login/page.tsx",
                                    lineNumber: 121,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                            lineNumber: 87,
=======
                            lineNumber: 114,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "remember",
                                            type: "checkbox",
<<<<<<< HEAD
                                            className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/app/login/page.tsx",
                                            lineNumber: 106,
=======
                                            className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500",
                                            disabled: loading,
                                            checked: rememberMe,
                                            onChange: handleRememberMeChange
                                        }, void 0, false, {
                                            fileName: "[project]/app/login/page.tsx",
                                            lineNumber: 136,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "remember",
                                            className: "ml-2 block text-sm text-gray-600",
                                            children: "Remember me"
                                        }, void 0, false, {
                                            fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                                            lineNumber: 111,
=======
                                            lineNumber: 144,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "#",
=======
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "/forgot-password",
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                    className: "text-sm text-blue-600 hover:underline",
                                    children: "Forgot password?"
                                }, void 0, false, {
                                    fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                                    lineNumber: 118,
=======
                                    lineNumber: 151,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                            lineNumber: 104,
=======
                            lineNumber: 134,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
<<<<<<< HEAD
                            className: "w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50",
                            disabled: loading,
                            children: loading ? "Signing in..." : "Sign In"
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
                            lineNumber: 122,
=======
                            className: "w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50 flex justify-center items-center",
                            disabled: loading,
                            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                className: "opacity-25",
                                                cx: "12",
                                                cy: "12",
                                                r: "10",
                                                stroke: "currentColor",
                                                strokeWidth: "4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/login/page.tsx",
                                                lineNumber: 172,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                className: "opacity-75",
                                                fill: "currentColor",
                                                d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            }, void 0, false, {
                                                fileName: "[project]/app/login/page.tsx",
                                                lineNumber: 180,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/login/page.tsx",
                                        lineNumber: 166,
                                        columnNumber: 17
                                    }, this),
                                    "Signing in..."
                                ]
                            }, void 0, true) : "Sign In"
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
                            lineNumber: 159,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                    lineNumber: 69,
=======
                    lineNumber: 93,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-8 text-center text-sm text-gray-500",
                    children: [
                        "Don't have an account?",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
<<<<<<< HEAD
                            href: "register",
=======
                            href: "/register",
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                            className: "text-blue-600 font-semibold hover:underline",
                            children: "Sign up"
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                            lineNumber: 132,
=======
                            lineNumber: 196,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
                    lineNumber: 130,
=======
                    lineNumber: 194,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
            lineNumber: 53,
=======
            lineNumber: 71,
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/login/page.tsx",
<<<<<<< HEAD
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_s(LoginPage, "ryGUWd5MTrcDrMEMNa8p4wR70Pc=");
=======
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_s(LoginPage, "5EEvosLVDXH1jULp4PzaadhzgFs=");
>>>>>>> 2acdc468cbaa20459b444116c434e2de1b53cce2
_c = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=app_login_page_tsx_ed82f28e._.js.map