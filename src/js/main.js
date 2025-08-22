import "./styles.js";
import {ModalManager} from "@/js/modules/ModalManager.js";
import {FormHandler} from "@/js/modules/FormHandler.js";
import {FormValidator} from "@/js/modules/FormValidator.js";
import {ScrollManager} from "@/js/utils/ScrollManager.js";
import {SectionAnimator} from "@/js/modules/SectionAnimator.js";

document.addEventListener("DOMContentLoaded", () => {
    new ModalManager();
    new FormHandler();
    new FormValidator();
    new ScrollManager();
    new SectionAnimator();
});
