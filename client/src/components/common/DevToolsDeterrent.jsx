import React, { useEffect } from 'react';

/**
 * DevToolsDeterrent Component
 * 
 * NOTE & DISCLAIMER:
 * Client-side keyboard shortcut and context menu interceptors are UI deterrents
 * designed to disincentivize casual inspection via F12 or right-click.
 * True security and data protection are strictly enforced server-side using 
 * JWT authentication and role-based authorization (adminOnly / volunteerOnly).
 */
export const DevToolsDeterrent = () => {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      // Allow right-click on input/textarea fields for user convenience (cut/copy/paste)
      const tagName = e.target?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        return;
      }
      e.preventDefault();
    };

    // Intercept common DevTools shortcut keys (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key ? e.key.toUpperCase() : '';
      const keyCode = e.keyCode;

      // F12 Key
      if (key === 'F12' || keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
      if (isCmdOrCtrl && isShift && (key === 'I' || key === 'J' || key === 'C' || keyCode === 73 || keyCode === 74 || keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U / Cmd+U (View Page Source)
      if (isCmdOrCtrl && (key === 'U' || keyCode === 85)) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
};
