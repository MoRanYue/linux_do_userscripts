// ==UserScript==
// @name LINUX DO Bad Composing Preventor
// @author MoRanYue
// @namespace https://github.com/MoRanYue/linux_do_userscripts
// @version 0.1.0
// @updateURL https://github.com/MoRanYue/linux_do_userscripts/raw/refs/heads/main/ldbcp.user.js
// @downloadURL https://github.com/MoRanYue/linux_do_userscripts/raw/refs/heads/main/ldbcp.user.js
// @supportURL https://github.com/MoRanYue/linux_do_userscripts/issues
// @description Prevent awful and bad composing in LINUX DO communities.
// @license MIT
// @match *://linux.do/*
// @match *://idcflare.com/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=linux.do
// @grant none
// @run-at document-end
// ==/UserScript==

(function () {
    'use strict';

    const PROCESSED_ELEM_CLASS_NAME = "ldbcp-processed";

    function log(...s) {
        console.log("[LDBCP]", ...s);
    }
    function err(s) {
        console.error("[LDBCP]", new Error(s));
    }

    /**
     * @readonly
     * @type {Record<string, (elem: HTMLElement) => Promise<void>>}
     */
    const PROCESSORS = Object.freeze({
        async print_elem(elem) {
            const content_elem = elem.getElementsByClassName("cooked").item(0);
            if (content_elem) {
                log(elem);
            }
        },
        async flatten_spamming_nested_callouts(elem) {
            const content_elem = elem.getElementsByClassName("cooked").item(0);
            if (content_elem) {
                const children = Array.from(content_elem.children);
                for (const elem of children) {
                    if (elem.classList.contains("callout")) {
                        function final_elem(callout_elem) {
                            const callout_content_elem = callout_elem.getElementsByClassName("callout-content").item(0);
                            if (callout_content_elem) {
                                const nodes = callout_content_elem.childNodes;
                                if (nodes.length == 1) {
                                    const first_node = nodes.item(0);
                                    if (first_node && first_node.nodeType === Node.ELEMENT_NODE && first_node.classList.contains("callout")) {
                                        return final_elem(first_node)
                                    }
                                }
                            }

                            return callout_elem;
                        }

                        elem.replaceWith(final_elem(elem));

                        log(elem, "is replaced to its final inner callout element.");
                    }
                }
            }
        },
        async remove_callouts_have_not_content(elem) {
            const content_elem = elem.getElementsByClassName("cooked").item(0);
            if (content_elem) {
                const callout_elems = Array.from(content_elem.getElementsByClassName("callout"));
                for (const elem of callout_elems) {
                    if (
                        !elem.getElementsByClassName("callout-content").item(0) &&
                        elem.getElementsByClassName("callout-title-inner").item(0).textContent.trim().toLowerCase() ===
                        elem.dataset.calloutType.toLowerCase()
                    ) {
                        elem.remove();

                        log(elem, "is removed.");
                    }
                }
            }
        },
        async flatten_callouts_with_only_title(elem) {
            const content_elem = elem.getElementsByClassName("cooked").item(0);
            if (content_elem) {
                const callout_elems = Array.from(content_elem.getElementsByClassName("callout"));
                for (const elem of callout_elems) {
                    if (!elem.getElementsByClassName("callout-content").item(0)) {
                        elem.replaceWith(
                            ...Array.from(elem.getElementsByClassName("callout-title-inner").item(0).childNodes),
                            document.createElement("br")
                        );

                        log(elem, "is replaced to its title.");
                    }
                }
            }
        },
        async flatten_post_has_only_callouts(elem) {
            const content_elem = elem.getElementsByClassName("cooked").item(0);
            if (content_elem) {
                const children = Array.from(content_elem.children);
                children.pop(); // Remove `cooked-selection-barrier` element.
                for (const elem of children) {
                    if (!elem.classList.contains("callout")) {
                        return;
                    }
                }

                for (const elem of children) {
                    const title_elem = elem.getElementsByClassName("callout-title-inner").item(0);
                    const content_elem = elem.getElementsByClassName("callout-content").item(0);

                    if (
                        title_elem.textContent.trim().toLowerCase() ===
                        elem.dataset.calloutType.toLowerCase()
                    ) {
                        if (content_elem) {
                            elem.replaceWith(...content_elem.childNodes);
                        }
                        else {
                            elem.remove();
                        }
                    }
                    else {
                        if (content_elem) {
                            elem.replaceWith(...title_elem.childNodes);
                        }
                        else {
                            elem.replaceWith(
                                ...title_elem.childNodes,
                                document.createTextNode(":"),
                                ...content_elem.childNodes
                            );
                        }
                    }

                    log(elem, "is fattened due to this post has only callouts.");
                }
            }
        },
        async expand_all_callouts(elem) {
            const content_elem = elem.getElementsByClassName("cooked").item(0);
            if (content_elem) {
                const callout_elems = Array.from(content_elem.getElementsByClassName("callout"));
                for (const elem of callout_elems) {
                    if (elem.classList.contains("is-collapsible") && elem.classList.contains("is-collapsed")) {
                        elem.getElementsByClassName("callout-title").item(0).click();

                        log(elem, "has been expanded.");
                    }
                }
            }
        },
        async replace_collapsable_callouts_to_summary_and_detail(elem) {
            const content_elem = elem.getElementsByClassName("cooked").item(0);
            if (content_elem) {
                const callout_elems = Array.from(content_elem.getElementsByClassName("callout"));
                for (const elem of callout_elems) {
                    if (elem.classList.contains("is-collapsible")) {
                        const summary_elem = document.createElement("summary");
                        summary_elem.append(...Array.from(elem.getElementsByClassName("callout-title-inner").item(0).childNodes));

                        const details_elem = document.createElement("details");
                        details_elem.open = !elem.classList.contains("is-collapsed");
                        details_elem.append(
                            summary_elem,
                            ...Array.from(elem.getElementsByClassName("callout-content").item(0).childNodes)
                        );

                        elem.replaceWith(details_elem);

                        log(elem, "is replaced to equal summary and detail.");
                    }
                }
            }
        },
        async flatten_all_callouts(elem) {
            const content_elem = elem.getElementsByClassName("cooked").item(0);
            if (content_elem) {
                const callout_elems = Array.from(content_elem.getElementsByClassName("callout"));
                for (const elem of callout_elems) {
                    const title_elem = elem.getElementsByClassName("callout-title-inner").item(0);
                    const content_elem = elem.getElementsByClassName("callout-content").item(0);

                    if (
                        title_elem.textContent.trim().toLowerCase() ===
                        elem.dataset.calloutType.toLowerCase()
                    ) {
                        if (content_elem) {
                            elem.replaceWith(...content_elem.childNodes);
                        }
                        else {
                            elem.remove();
                        }
                    }
                    else {
                        if (content_elem) {
                            elem.replaceWith(...title_elem.childNodes);
                        }
                        else {
                            elem.replaceWith(
                                ...title_elem.childNodes,
                                document.createTextNode(":"),
                                ...content_elem.childNodes
                            );
                        }
                    }

                    log(elem, "is fattened.");
                }
            }
        }
    });

    /**
     * @type {Record<keyof typeof PROCESSORS, bool>}
     */
    const AUTO_PROCESSORS = Object.freeze({
        print_elem: false,
        flatten_spamming_nested_callouts: true,
        remove_callouts_have_not_content: true,
        flatten_callouts_with_only_title: true,
        flatten_post_has_only_callouts: true,
        expand_all_callouts: false,
        replace_collapsable_callouts_to_summary_and_detail: false,
        flatten_all_callouts: false
    });

    async function auto_process_post(elem) {
        if (elem instanceof HTMLElement && elem.classList.contains("topic-post") && !elem.classList.contains(PROCESSED_ELEM_CLASS_NAME)) {
            elem.classList.add(PROCESSED_ELEM_CLASS_NAME);

            for (const k in PROCESSORS) {
                if (Object.hasOwn(PROCESSORS, k) && AUTO_PROCESSORS[k]) {
                    try {
                        await PROCESSORS[k](elem);
                    }
                    catch (error) {
                        err(`Processor \`${k}\` throwed an error: ${error}`);
                    }
                }
            }
        }
    }
    function find_and_process_posts(root_elem = document) {
        for (const elem of root_elem.getElementsByClassName("topic-post")) {
            auto_process_post(elem);
        }
    }

    function observe_elem() {
        const observer = new MutationObserver(muts => {
            for (const mut of muts) {
                mut.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        find_and_process_posts(node);
                    }
                });

                const target = mut.target.nodeType === Node.ELEMENT_NODE ? mut.target : mut.target.parentElement;
                if (target && target.classList.contains("topic-post")) {
                    target.classList.remove(PROCESSED_ELEM_CLASS_NAME);

                    setTimeout(() => auto_process_post(target), 100);
                }
            }
        });

        const cont_elem = document.getElementsByClassName("post-stream").item(0) || document.body;

        observer.observe(cont_elem, { childList: true, subtree: true, characterData: true });
    }

    function init() {
        find_and_process_posts();

        observe_elem();
    }

    (function inject_history() {
        const _push_state = history.pushState;
        const _replace_state = history.replaceState;

        history.pushState = function(...args) {
            const ret = _push_state.apply(this, args);

            dispatchEvent(new Event('urlchange'));

            return ret;
        };

        history.replaceState = function(...args) {
            const ret = _replace_state.apply(this, args);

            dispatchEvent(new Event("urlchange"));

            return ret;
        };

        addEventListener("popstate", () => dispatchEvent(new Event("urlchange")));
    })();

    addEventListener("urlchange", init);
    init();
})();
