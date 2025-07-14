// ==UserScript==
// @name         Docs Redirector
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  自动将.NET和Unity文档和Python的英文链接重定向到中文链接；通过快捷键 Ctrl+Shift+L 全局控制是否启用跳转。快捷键在所有learn.microsoft.com和docs.unity3d.com和docs.python.org页面下生效。
// @author       cheng
// @match        *://learn.microsoft.com/*
// @match        *://docs.unity3d.com/*
// @match        *://docs.python.org/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/cheng-dcl/Cheng-Tampermonkey/main/Redirector/docs_redirector.user.js
// @downloadURL  https://raw.githubusercontent.com/cheng-dcl/Cheng-Tampermonkey/main/Redirector/docs_redirector.user.js
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

    const redirectRules = [
        {
            name: ".Net",
            pattern: /https:\/\/learn\.microsoft\.com\/en-us\/dotnet\/api\/(.*)/,
            replacement: 'https://learn.microsoft.com/zh-cn/dotnet/api/$1',
            reversePattern: /https:\/\/learn\.microsoft\.com\/zh-cn\/dotnet\/api\/(.*)/,
            reverseReplacement: 'https://learn.microsoft.com/en-us/dotnet/api/$1'
        },
        {
            name: "Unity",
            pattern: /https:\/\/docs\.unity3d\.com\/(\d+\.\d+)\/Documentation\/ScriptReference\/(.*)/,
            replacement: 'https://docs.unity3d.com/cn/current/ScriptReference/$2',
            reversePattern: /https:\/\/docs\.unity3d\.com\/cn\/current\/ScriptReference\/(.*)/,
            reverseReplacement: 'https://docs.unity3d.com/2022.3/Documentation/ScriptReference/$1' // 注意这里写死了版本号，可优化
        },
        {
            name: "Unity",
            pattern: /https:\/\/docs\.unity3d\.com\/ScriptReference\/(.*)/,
            replacement: 'https://docs.unity3d.com/cn/current/ScriptReference/$1',
            reversePattern: /https:\/\/docs\.unity3d\.com\/cn\/current\/ScriptReference\/(.*)/,
            reverseReplacement: 'https://docs.unity3d.com/ScriptReference/$1'
        },
        {
            name: "Python",
            pattern: /https:\/\/docs\.python\.org\/(?!zh-cn\/)(.*)/,
            replacement: 'https://docs.python.org/zh-cn/$1',
            reversePattern: /https:\/\/docs\.python\.org\/zh-cn\/(.*)/,
            reverseReplacement: 'https://docs.python.org/$1'
        }
    ];



    let isRedirectEnabled = GM_getValue(KEY, true);
    let curName = ""

    UpdateStatus();

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'L') {
            isRedirectEnabled = !isRedirectEnabled;
            GM_setValue(KEY, isRedirectEnabled);
            UpdateStatus();
            const message = `${curName}文档自动切换为中文已${isRedirectEnabled ? '启用' : '禁用'}`;
            //alert(message);
            showToast(message, isRedirectEnabled);

        }
    });

    // const referer = document.referrer;
    // const isFromRider = referer && (referer.includes('jetbrains://') || referer.includes('rider://'));
    // console.log("referer:" + referer)

    // const isNewTab = window.opener !== null || window.history.length === 1;
    // console.log("isNewTab:" + isNewTab)


    function UpdateStatus() {
        const currentUrl = window.location.href;

        for (const rule of redirectRules) {

            if (isRedirectEnabled) {
                if (rule.pattern.test(currentUrl)) {
                    const newUrl = currentUrl.replace(rule.pattern, rule.replacement);
                    if (newUrl !== currentUrl) {
                        window.location.href = newUrl;
                        curName = rule.name;
                        break;
                    }
                }
            } else {
                if (rule.reversePattern && rule.reversePattern.test(currentUrl)) {
                    const newUrl = currentUrl.replace(rule.reversePattern, rule.reverseReplacement);
                    if (newUrl !== currentUrl) {
                        window.location.href = newUrl;
                        curName = rule.name;
                        break;
                    }
                }
            }
        }
    }
})();
