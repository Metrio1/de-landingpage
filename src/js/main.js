import "./styles.js";
import { ModalManager } from "@/js/modules/ModalManager.js";
import { FormHandler } from "@/js/modules/FormHandler.js";
import { FormValidator } from "@/js/modules/FormValidator.js";
import { SectionAnimator } from "@/js/modules/SectionAnimator.js";

document.addEventListener("DOMContentLoaded", () => {
    const modal = new ModalManager();
    const validator = new FormValidator();
    const formHandler = new FormHandler({ modalManager: modal });
    const sections = new SectionAnimator();
    void validator; void formHandler; void sections;
});
