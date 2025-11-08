/**
 * Manga Blog - Main JavaScript Bundle
 * Modular, performance-optimized, accessibility-focused
 */

'use strict';

// ============================================================================
// Mobile Menu Module
// ============================================================================
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const body = document.body;

    if (!menuBtn || !mobileMenu || !menuClose) return;

    function openMenu() {
        mobileMenu.classList.remove('hidden');
        mobileMenu.setAttribute('aria-hidden', 'false');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.setAttribute('aria-label', 'メニューを閉じる');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.classList.add('hidden');
        mobileMenu.setAttribute('aria-hidden', 'true');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'メニューを開く');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
        if (mobileMenu.classList.contains('hidden')) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    menuClose.addEventListener('click', closeMenu);

    // Close on overlay click
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            closeMenu();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            closeMenu();
        }
    });

    // Close on navigation
    const navLinks = mobileMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// ============================================================================
// Countdown Timer Module
// ============================================================================
function initCountdown() {
    const countdownEl = document.getElementById('countdown-timer');
    if (!countdownEl) return; // Not on countdown page

    const targetDateStr = countdownEl.getAttribute('data-target-date');
    if (!targetDateStr) {
        console.error('Target date attribute missing');
        return;
    }

    // Parse Japanese date format: 2025年11月10日
    const match = targetDateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!match) {
        console.error('Invalid date format:', targetDateStr);
        return;
    }

    // Create target date at midnight JST
    const targetDate = new Date(
        parseInt(match[1], 10),
        parseInt(match[2], 10) - 1,
        parseInt(match[3], 10),
        0, 0, 0, 0
    );

    // Validate date
    if (isNaN(targetDate.getTime())) {
        console.error('Invalid date created from:', targetDateStr);
        return;
    }

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        console.error('Countdown display elements missing');
        return;
    }

    let intervalId;

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            if (intervalId) {
                clearInterval(intervalId);
            }
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    // Update immediately
    updateCountdown();

    // Update every second
    intervalId = setInterval(updateCountdown, 1000);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    });
}

// ============================================================================
// Sticky CTA Module
// ============================================================================
function initStickyCta() {
    const stickyCta = document.getElementById('sticky-cta');
    if (!stickyCta) return; // Not on blog detail page

    const threshold = 300; // Show after scrolling 300px

    function handleScroll() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > threshold) {
            stickyCta.classList.remove('translate-y-full');
        } else {
            stickyCta.classList.add('translate-y-full');
        }
    }

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// ============================================================================
// CTA Interstitial Dialog + Full-screen Reader - Google Compliant
// Purpose: Legal disclaimer + external content viewer
// Compliance: User-triggered, easy dismiss, SAME experience for ALL users
// Flow: Click CTA → Warning Dialog (3s) → Full-screen Reader with iframe
// ============================================================================
function initCtaLoading() {
    let dialog, confirmBtn, targetUrl;
    let timer = null;
    
    // Create warning dialog
    dialog = document.createElement('div');
    dialog.className = 'hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'interstitial-title');
    
    dialog.innerHTML = `
        <div class="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-xl relative">
            <!-- Close button - Easy dismiss -->
            <button id="cta-close-x" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors" aria-label="閉じる">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
            
            <div class="flex justify-center mb-4">
                <div class="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center">
                    <svg class="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </div>
            </div>
            
            <h2 id="interstitial-title" class="text-xl font-bold text-center text-stone-900 mb-2">外部サイトへ移動します</h2>
            <p class="text-sm text-center text-stone-600 mb-6">
                公式配信サイトに移動します。<br>
                外部サイトのコンテンツについて当サイトは責任を負いません。
            </p>
            
            <div class="flex flex-col gap-3">
                <button id="cta-confirm" class="w-full px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                    確認して移動
                </button>
                <button id="cta-cancel" class="w-full px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2">
                    キャンセル
                </button>
            </div>
            
            <p class="text-xs text-center text-stone-500 mt-4">
                <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                安全な公式サイトです
            </p>
        </div>
    `;
    document.body.appendChild(dialog);
    
    confirmBtn = document.getElementById('cta-confirm');
    const cancelBtn = document.getElementById('cta-cancel');
    const closeX = document.getElementById('cta-close-x');
    
    // Show warning dialog
    function showDialog(url) {
        if (!dialog.classList.contains('hidden')) return;
        
        targetUrl = url;
        dialog.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Countdown for safety warning
        let count = 3;
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-60', 'cursor-not-allowed');
        confirmBtn.textContent = `確認して移動 (${count}秒)`;
        
        timer = setInterval(() => {
            count--;
            if (count > 0) {
                confirmBtn.textContent = `確認して移動 (${count}秒)`;
            } else {
                clearInterval(timer);
                confirmBtn.disabled = false;
                confirmBtn.classList.remove('opacity-60', 'cursor-not-allowed');
                confirmBtn.textContent = '確認して移動';
                confirmBtn.focus();
            }
        }, 1000);
        
        document.onkeydown = (e) => {
            if (e.key === 'Escape') closeDialog();
        };
    }
    
    // Close warning dialog
    function closeDialog() {
        if (timer) clearInterval(timer);
        dialog.classList.add('hidden');
        document.body.style.overflow = '';
        document.onkeydown = null;
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        confirmBtn.textContent = '確認して移動';
    }
    
    // Confirm - Show full-screen reader (SAME for ALL users - no bot detection)
    function confirmAndShowReader() {
        if (confirmBtn.disabled) return;
        closeDialog();
        
        // Show full-screen reading modal (same for bots and humans)
        showReadingModal(targetUrl);
    }
    
    // Full-screen reading modal with iframe
    function showReadingModal(url) {
        const modal = document.createElement('div');
        modal.id = 'reading-modal';
        modal.className = 'fixed inset-0 bg-black z-[100] flex flex-col';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', '外部コンテンツビューア');
        
        modal.innerHTML = `
            <!-- Header Bar -->
            <div class="bg-stone-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
                <div class="flex items-center gap-3">
                    <button id="close-reader" class="flex items-center gap-2 px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        <span class="text-sm font-medium">戻る</span>
                    </button>
                    <div class="h-6 w-px bg-stone-700"></div>
                    <span class="text-sm text-stone-400">外部コンテンツを表示中</span>
                </div>
                <a href="${url}" target="_blank" rel="noopener noreferrer" 
                   class="flex items-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    新しいタブで開く
                </a>
            </div>
            
            <!-- Iframe Content -->
            <iframe 
                id="content-frame"
                src="${url}"
                class="flex-1 w-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                referrerpolicy="no-referrer"
                loading="eager"
                title="External Content"
                allow="fullscreen">
            </iframe>
            
            <!-- Fallback if iframe blocked by X-Frame-Options -->
            <div id="iframe-blocked" class="hidden flex-1 flex items-center justify-center bg-stone-50">
                <div class="text-center p-8 max-w-md">
                    <svg class="w-16 h-16 mx-auto mb-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <h3 class="text-lg font-bold text-stone-900 mb-2">埋め込み表示できません</h3>
                    <p class="text-sm text-stone-600 mb-4">
                        このサイトは埋め込み表示をブロックしています。<br>
                        新しいタブで開いてご覧ください。
                    </p>
                    <a href="${url}" target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500">
                        新しいタブで開く
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                    </a>
                </div>
            </div>
            
            <!-- Footer Attribution -->
            <div class="bg-stone-900 text-stone-400 px-4 py-2 text-xs text-center border-t border-stone-800">
                <span>Content from: </span>
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">${new URL(url).hostname}</a>
                <span class="mx-2">•</span>
                <span>当サイトは外部コンテンツを所有していません</span>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Detect if iframe is blocked by X-Frame-Options
        const iframe = modal.querySelector('#content-frame');
        const fallback = modal.querySelector('#iframe-blocked');
        
        // Check iframe load status
        iframe.addEventListener('load', () => {
            setTimeout(() => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc || iframeDoc.location.href === 'about:blank') {
                        iframe.classList.add('hidden');
                        fallback.classList.remove('hidden');
                        fallback.classList.add('flex');
                    }
                } catch (e) {
                    // Cross-origin restriction is normal and OK
                    // Iframe loaded successfully, just can't access content
                }
            }, 1000);
        });
        
        // Fallback if iframe doesn't load at all
        setTimeout(() => {
            if (iframe.classList.contains('hidden') === false && !iframe.src) {
                iframe.classList.add('hidden');
                fallback.classList.remove('hidden');
                fallback.classList.add('flex');
            }
        }, 5000);
        
        // Close button handler
        modal.querySelector('#close-reader').onclick = () => {
            modal.remove();
            document.body.style.overflow = '';
        };
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.body.style.overflow = '';
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    // Event listeners
    confirmBtn.onclick = confirmAndShowReader;
    cancelBtn.onclick = closeDialog;
    closeX.onclick = closeDialog;
    dialog.onclick = (e) => {
        if (e.target === dialog) closeDialog();
    };
    
    // Attach to all CTA links
    document.querySelectorAll('a[data-cta-redirect]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showDialog(link.href);
        });
    });
}

// ============================================================================
// Initialize All Modules (DOMContentLoaded)
// ============================================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded (script loaded async/defer)
    init();
}

function init() {
    // Always init mobile menu (present on all pages)
    initMobileMenu();

    // Conditional inits (only if elements exist)
    initCountdown();
    initStickyCta();
    initCtaLoading();
}
