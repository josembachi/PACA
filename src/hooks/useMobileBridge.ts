"use client";

import { useState, useEffect } from "react";

export function useMobileBridge() {
  const [isMobile, setIsMobile] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    // Detect if the app is running in a mobile browser or a native wrapper
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|blackberry|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent));
      
      // Check for a custom global variable injected by the native bridge (e.g., in React Native WebView)
      setIsNativeApp(!!(window as any).PACA_NATIVE_BRIDGE);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const triggerNativeAction = (action: string, payload: any) => {
    if (isNativeApp && (window as any).PACA_NATIVE_BRIDGE) {
      (window as any).PACA_NATIVE_BRIDGE.postMessage(JSON.stringify({
        action,
        payload,
      }));
    } else {
      console.log(`[MobileBridge] Action ${action} triggered but not in native environment:`, payload);
    }
  };

  return {
    isMobile,
    isNativeApp,
    triggerNativeAction,
  };
}
