import "./styles.js";
import { ModalManager } from "@/js/modules/ModalManager.js";
import { FormHandler } from "@/js/modules/FormHandler.js";
import { FormValidator } from "@/js/modules/FormValidator.js";
import { SectionAnimator } from "@/js/modules/SectionAnimator.js";
import { ScrollManager } from "@/js/utils/ScrollManager.js";

document.addEventListener("DOMContentLoaded", () => {
    const modalManager = new ModalManager();
    new FormValidator();
    new SectionAnimator();
    new FormHandler(modalManager);
    new ScrollManager();
});
