// ==UserScript==
// @name         Unity & .NET ZH Docs Redirector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动将.NET和Unity文档的英文链接重定向到中文链接；通过快捷键 Ctrl+Shift+L 全局控制是否启用跳转。快捷键在所有learn.microsoft.com和docs.unity3d.com页面下生效,主要适用于Rider文档跳转。
// @author       cheng
// @match        *://learn.microsoft.com/*
// @match        *://docs.unity3d.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';
	
    GM_addStyle(`
        .custom-toast {
            position: fixed;
            top: 0;
            left: 45%;
            transform: translateY(50px);
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .custom-toast.visible {
            opacity: 1;
            transform: translateY(100px);
        }
        .custom-toast.enabled {
            background-color: #4CAF50;
        }
        .custom-toast.disabled {
            background-color: #F44336;
        }
    `);


    function showToast(message, isEnabled) {
        const toast = document.createElement('div');
        toast.className = `custom-toast ${isEnabled ? 'enabled' : 'disabled'}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => document.body.removeChild(toast), 300); 
        }, 3000);
    }


    const KEY = 'isRedirectEnabled';


    let isRedirectEnabled = GM_getValue(KEY, true);

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'L') {
            isRedirectEnabled = !isRedirectEnabled; 
            GM_setValue(KEY, isRedirectEnabled); 
            const message = `Unity & .NET 文档自动切换为中文已${isRedirectEnabled ? '启用' : '禁用'}`;
            //alert(message);
            showToast(message, isRedirectEnabled);
        }
    });

    // const referer = document.referrer;
    // const isFromRider = referer && (referer.includes('jetbrains://') || referer.includes('rider://'));
    // console.log("referer:" + referer)

    // const isNewTab = window.opener !== null || window.history.length === 1;
    // console.log("isNewTab:" + isNewTab)

    if (isRedirectEnabled) {
        const currentUrl = window.location.href;

        const redirectRules = [
            {
                pattern: /https:\/\/learn\.microsoft\.com\/en-us\/dotnet\/api\/(.*)/,
                replacement: 'https://learn.microsoft.com/zh-cn/dotnet/api/$1'
            },
            {
                pattern: /https:\/\/docs\.unity3d\.com\/(\d+\.\d+)\/Documentation\/ScriptReference\/(.*)/,
                replacement: 'https://docs.unity3d.com/cn/current/ScriptReference/$2'
            },
            {
                pattern: /https:\/\/docs\.unity3d\.com\/ScriptReference\/(.*)/,
                replacement: 'https://docs.unity3d.com/cn/current/ScriptReference/$1'
            }
        ];

        for (const rule of redirectRules) {
            if (rule.pattern.test(currentUrl)) {
                const newUrl = currentUrl.replace(rule.pattern, rule.replacement);
                if (newUrl !== currentUrl) {
                    window.location.href = newUrl;
                    break;
                }
            }
        }
    }
})();
