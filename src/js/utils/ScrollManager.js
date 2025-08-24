export class ScrollManager {
    static #locked = false;
    static #scrollY = 0;

    static attrs = {
        lockClass: "lock",
        unlockClass: "unlock",
        scrolledTopVar: "--scrolledTop",
    };

    static get isLocked() {
        return ScrollManager.#locked;
    }

    static lock() {
        if (ScrollManager.#locked) return;
        ScrollManager.#scrollY = window.scrollY || window.pageYOffset || 0;
        document.body.style.setProperty(
            ScrollManager.attrs.scrolledTopVar,
            `-${ScrollManager.#scrollY}px`
        );
        document.body.classList.add(ScrollManager.attrs.lockClass);
        document.body.classList.remove(ScrollManager.attrs.unlockClass);
        ScrollManager.#locked = true;
    }

    static unlock() {
        if (!ScrollManager.#locked) return;
        document.body.classList.remove(ScrollManager.attrs.lockClass);
        document.body.classList.add(ScrollManager.attrs.unlockClass);
        const stored = document.body.style.getPropertyValue(
            ScrollManager.attrs.scrolledTopVar
        );
        const y = Number.parseInt(stored, 10) || 0;
        window.scrollTo({ top: -y, behavior: "instant" });
        document.body.style.removeProperty(ScrollManager.attrs.scrolledTopVar);
        ScrollManager.#locked = false;
    }
}