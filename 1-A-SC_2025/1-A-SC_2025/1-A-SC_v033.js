(function ($) {
    function applyRule_CAP4_Exclusive401_402(context) {
        const ids = ["#CAP4_R401_C1", "#CAP4_R402_C1"];
        const $all = jQuery(ids.join(","), context);
        if (!$all.length) return;

        // evită dublarea la re-attach (AJAX)
        $all.once("cap4-exclusive-401-402").on("change.cap4Exclusive", function () {
            const $cb = jQuery(this);

            // doar când se bifează
            if (!$cb.is(":checked")) return;

            // debifează celălalt
            $all.not(this).prop("checked", false).trigger("change");
        });
    }

    function initCAP1_TypeSingleSelect(context) {
        const selectors = [
            "#CAP1_R101_C1",
            "#CAP1_R102_C1",
            "#CAP1_R103_C1",
            "#CAP1_R104_C1",
            "#CAP1_R105_C1",
            "#CAP1_R106_C1",
            "#CAP1_R107_C1",
            "#CAP1_R108_C1",
            "#CAP1_R109_C1",
            "#CAP1_R110_C1",
            "#CAP1_R111_C1",
            "#CAP1_R112_C1",
            "#CAP1_R1121_C1",
            "#CAP1_R1122_C1",
            "#CAP1_R1131_C1",
            "#CAP1_R1132_C1",
            "#CAP1_R1133_C1",
            "#CAP1_R1134_C1",
            "#CAP1_R1135_C1",
        ];

        jQuery(context)
            .find(selectors.join(","))
            .off("change.cap1TypeSingle")
            .on("change.cap1TypeSingle", function () {
                if (!this.checked) return;

                selectors.forEach((sel) => {
                    if (this.id !== sel.substring(1)) {
                        jQuery(sel, context).prop("checked", false);
                    }
                });
            });
    }

    function initCAP1_CategorySingleSelect(context) {
        const selectors = [
            "#CAP1_R1_C1",
            "#CAP1_R2_C1",
            "#CAP1_R3_C1",
            "#CAP1_R4_C1",
            "#CAP1_R5_C1",
            "#CAP1_R6_C1",
        ];

        jQuery(context)
            .find(selectors.join(","))
            .off("change.cap1CategorySingle")
            .on("change.cap1CategorySingle", function () {
                if (!this.checked) return;

                selectors.forEach((sel) => {
                    if (this.id !== sel.substring(1)) {
                        jQuery(sel, context).prop("checked", false);
                    }
                });
            });
    }

    Drupal.behaviors.asc1 = {
        attach: function (context, settings) {
            // Scrie doar numere
            jQuery("table").on(
                "keypress",
                "input.float, input.numeric",
                function (event) {
                    if (isNumberPressed(this, event) === false) {
                        event.preventDefault();
                    }
                },
            );
            pasteValuesYears("#CAP1_R00_C1");

            applyRule_CAP4_Exclusive401_402(context);
            initCAP1_TypeSingleSelect(context);
            initCAP1_CategorySingleSelect(context);
        },
    };
})(jQuery);

function pasteValuesYears(selector) {
    var selectedYear =
        typeof Drupal.settings.mywebform.values.CAP1_R00_C1 !== "undefined"
            ? Drupal.settings.mywebform.values.CAP1_R00_C1
            : "";
    if (!Drupal.settings.mywebform.preview) {
        var currentYear = new Date().getFullYear() - 1,
            obj = jQuery(selector);

        obj.empty();
        obj.append(jQuery("<option></option>").attr("value", "").text(""));

        for (var startYear = 1940; startYear <= currentYear; startYear++) {
            if (startYear == selectedYear) {
                obj.append(
                    jQuery("<option></option>")
                        .attr("value", startYear)
                        .attr("selected", "selected")
                        .text(startYear),
                );
            } else {
                obj.append(
                    jQuery("<option></option>").attr("value", startYear).text(startYear),
                );
            }
        }

        obj.trigger("change");
    }
}

// helper local
function toNumberSafe(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const s = String(v).trim().replace(",", ".");
    if (s === "") return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}

function hasValue(v) {
    return v !== null && v !== undefined && String(v).trim() !== "";
}

// checkbox: acceptă 1 / "1" / true
function isChecked(v) {
    return v === true || v === 1 || v === "1";
}

webform.afterLoad.asc1 = function () {
    pasteValuesYears();
};

webform.validators.asc1 = function () {
    var values = Drupal.settings.mywebform.values;
    var errors = webform.errors;
    var warnings = webform.warnings;

    // ======================================================================
    // [20-028] Dacă CAP1 rînd 108 (Camping) este bifat =>
    //          CAP2 rînd 207 (input) trebuie completat ( > 0 / sau cel puțin să aibă valoare)
    //          și CAP5 rînd 510 trebuie să fie bifat
    // ======================================================================
    (function () {
        const r108 = isChecked(values["CAP1_R108_C1"]);
        if (!r108) return;

        const f207 = "CAP2_R207_C1";
        const r510 = isChecked(values["CAP5_R510_C1"]);

        // R207 este INPUT numeric => cerem să fie completat (și > 0)
        if (!hasValue(values[f207]) || !(toNumberSafe(values[f207]) > 0)) {
            errors.push({
                weight: 10,
                fieldName: f207,
                msg: "[20-028] Dacă CAP1 rînd 108 este bifat, atunci CAP2 rînd 207 trebuie să fie completat (valoare > 0).",
            });
        }

        // R510 rămâne checkbox
        if (!r510) {
            errors.push({
                weight: 10,
                fieldName: "CAP5_R510_C1",
                msg: "[20-028] Dacă CAP1 rînd 108 este bifat, atunci CAP5 rînd 510 trebuie să fie bifat.",
            });
        }
    })();


    // ======================================================================
    // CAP2 (201-205) validations: COD 01, 02, 03, 04
    // IMPORTANT: COD 04 trebuie să fie ÎN ACEST (function(){ ... }) ca să aibă acces la n() și hv().
    // ======================================================================
    (function () {
        // helper scurt (numeric)
        function n(field) {
            return toNumberSafe(values[field]);
        }
        function hv(field) {
            return hasValue(values[field]);
        }

        const rows = [201, 202, 203, 204, 205];

        // -------------------------
        // COD 01: R201 C1 = SUM R202..R205 C1
        // -------------------------
        (function () {
            const r201 = n("CAP2_R201_C1");
            const sum =
                n("CAP2_R202_C1") +
                n("CAP2_R203_C1") +
                n("CAP2_R204_C1") +
                n("CAP2_R205_C1");

            const any =
                hv("CAP2_R201_C1") ||
                hv("CAP2_R202_C1") ||
                hv("CAP2_R203_C1") ||
                hv("CAP2_R204_C1") ||
                hv("CAP2_R205_C1");

            if (!any) return;

            if (r201 !== sum) {
                errors.push({
                    weight: 10,
                    fieldName: "CAP2_R201_C1",
                    msg: "[COD 01] Rînd 201 col.1 trebuie să fie egal cu suma rîndurilor 202–205 col.1.",
                });
            }
        })();

        // -------------------------
        // COD 02: R201 C2 = SUM R202..R205 C2
        // -------------------------
        (function () {
            const r201 = n("CAP2_R201_C2");
            const sum =
                n("CAP2_R202_C2") +
                n("CAP2_R203_C2") +
                n("CAP2_R204_C2") +
                n("CAP2_R205_C2");

            const any =
                hv("CAP2_R201_C2") ||
                hv("CAP2_R202_C2") ||
                hv("CAP2_R203_C2") ||
                hv("CAP2_R204_C2") ||
                hv("CAP2_R205_C2");

            if (!any) return;

            if (r201 !== sum) {
                errors.push({
                    weight: 10,
                    fieldName: "CAP2_R201_C2",
                    msg: "[COD 02] Rînd 201 col.2 trebuie să fie egal cu suma rîndurilor 202–205 col.2.",
                });
            }
        })();

        // -------------------------
        // COD 03: pentru fiecare rînd 201..205 => col.2 <= col.1
        // -------------------------
        (function () {
            rows.forEach((r) => {
                const c1Field = `CAP2_R${r}_C1`;
                const c2Field = `CAP2_R${r}_C2`;

                // dacă ambele sunt goale, nu validăm
                if (!hv(c1Field) && !hv(c2Field)) return;

                const c1 = n(c1Field);
                const c2 = n(c2Field);

                if (c2 > c1) {
                    errors.push({
                        weight: 11,
                        fieldName: c2Field,
                        msg: `[COD 03] Rînd ${r} col.2 nu poate depăși col.1 (col.2 ≤ col.1).`,
                    });
                }
            });
        })();

        // -------------------------
        // COD 04: R201 C3 ≥ R202 C1 + (R203 C1 * 2) + (R204 C1 * 3) + R205 C1
        // (rulează dacă există ceva completat în zona implicată)
        // -------------------------
        (function () {
            const r201c3 = n("CAP2_R201_C3");

            const rhs =
                n("CAP2_R202_C1") +
                n("CAP2_R203_C1") * 2 +
                n("CAP2_R204_C1") * 3 +
                n("CAP2_R205_C1");

            const any =
                hv("CAP2_R201_C3") ||
                hv("CAP2_R202_C1") ||
                hv("CAP2_R203_C1") ||
                hv("CAP2_R204_C1") ||
                hv("CAP2_R205_C1");

            if (!any) return;

            if (r201c3 < rhs) {
                errors.push({
                    weight: 12,
                    fieldName: "CAP2_R201_C3",
                    msg: "[COD 04] Rînd 201 col.3 trebuie să fie ≥ R202 col.1 + (R203 col.1×2) + (R204 col.1×3) + R205 col.1.",
                });
            }
        })();
    })();

    // ======================================================================
    // CAP3 validations (301-305): COD 01, 02, 03
    // 01: R302 <= R301
    // 02: R303 <= R301
    // 03: R305 col.2 <= R301
    // ======================================================================
    (function () {
        const r301 = toNumberSafe(values["CAP3_R301_C1"]);

        // rulăm regulile doar dacă există ceva completat
        const any =
            hasValue(values["CAP3_R301_C1"]) ||
            hasValue(values["CAP3_R302_C1"]) ||
            hasValue(values["CAP3_R303_C1"]) ||
            hasValue(values["CAP3_R305_C2"]);

        if (!any) return;

        // COD 01: R302 <= R301
        (function () {
            if (!hasValue(values["CAP3_R302_C1"])) return;

            const r302 = toNumberSafe(values["CAP3_R302_C1"]);
            if (r302 > r301) {
                errors.push({
                    weight: 10,
                    fieldName: "CAP3_R302_C1",
                    msg: "[COD 01] Rînd 302 nu poate depăși rînd 301 (R302 ≤ R301).",
                });
            }
        })();

        // COD 02: R303 <= R301
        (function () {
            if (!hasValue(values["CAP3_R303_C1"])) return;

            const r303 = toNumberSafe(values["CAP3_R303_C1"]);
            if (r303 > r301) {
                errors.push({
                    weight: 10,
                    fieldName: "CAP3_R303_C1",
                    msg: "[COD 02] Rînd 303 nu poate depăși rînd 301 (R303 ≤ R301).",
                });
            }
        })();

        // COD 03: R305 col.2 <= R301
        (function () {
            // col.2 există doar la rînd 305
            if (!hasValue(values["CAP3_R305_C2"])) return;

            const r305_c2 = toNumberSafe(values["CAP3_R305_C2"]);
            if (r305_c2 > r301) {
                errors.push({
                    weight: 10,
                    fieldName: "CAP3_R305_C2",
                    msg: "[COD 03] Rînd 305 col.2 nu poate depăși rînd 301 (R305 col.2 ≤ R301).",
                });
            }
        })();
    })();

    // ======================================================================
    // CAP5 validations (COD 01, COD 02) pentru rînd 601
    // 01: R601 > 0
    // 02: R601 <= 3000
    // ======================================================================
    (function () {
        const v601_raw = values["CAP5_R601_C1"];

        // dacă e gol, nu validăm (ca să nu dăm erori pe necompletat)
        if (!hasValue(v601_raw)) return;

        const r601 = toNumberSafe(v601_raw);

        // COD 01: Rînd 601 > 0
        if (!(r601 > 0)) {
            errors.push({
                weight: 10,
                fieldName: "CAP5_R601_C1",
                msg: "[COD 01] Rînd 601 trebuie să fie > 0.",
            });
            // dacă e invalid deja, nu mai are sens să verificăm plafonul
            return;
        }

        // COD 02: Rînd 601 <= 3000
        if (r601 > 3000) {
            errors.push({
                weight: 10,
                fieldName: "CAP5_R601_C1",
                msg: "[COD 02] Rînd 601 trebuie să fie ≤ 3000.",
            });
        }
    })();

    // ====================================================================================
    // Validări între capitole (COD 01–05)
    // Condiția comună: dacă CAP1_R00_C1 (anul) este selectat => aplicăm reguli
    // (în cerință: "Rînd 101 : Rînd 114 > 0", aici mapat pe CAP1_R00_C1)
    // ====================================================================================
    (function () {
        const yearSelected = hasValue(values["CAP1_R00_C1"]); // dropdown (nu e gol)

        if (!yearSelected) return;

        const cap2_201_c1 = toNumberSafe(values["CAP2_R201_C1"]);
        const cap3_301_c1 = toNumberSafe(values["CAP3_R301_C1"]);
        const cap3_303_c1 = toNumberSafe(values["CAP3_R303_C1"]);
        const cap4_401 = isChecked(values["CAP4_R401_C1"]);
        const cap4_402 = isChecked(values["CAP4_R402_C1"]);

        // ------------------------------------------------------------
        // COD 01: Dacă (CAP1_R00_C1 selectat) => CAP2_R201_C1 > 0
        // ------------------------------------------------------------
        if (!(cap2_201_c1 > 0)) {
            errors.push({
                weight: 10,
                fieldName: "CAP2_R201_C1",
                msg: "[INT-01] Dacă în CAP1 este selectat anul (rd.00), atunci CAP2 rînd 201 col.1 trebuie să fie > 0.",
            });
        }

        // ------------------------------------------------------------
        // COD 02: Dacă (CAP1_R00_C1 selectat) => CAP3_R301_C1 > 0
        // ------------------------------------------------------------
        if (!(cap3_301_c1 > 0)) {
            errors.push({
                weight: 10,
                fieldName: "CAP3_R301_C1",
                msg: "[INT-02] Dacă în CAP1 este selectat anul (rd.00), atunci CAP3 rînd 301 col.1 trebuie să fie > 0.",
            });
        }

        // ------------------------------------------------------------
        // COD 03: Dacă (CAP1_R00_C1 selectat) => CAP3_R303_C1 > 0
        // ------------------------------------------------------------
        if (!(cap3_303_c1 > 0)) {
            errors.push({
                weight: 10,
                fieldName: "CAP3_R303_C1",
                msg: "[INT-03] Dacă în CAP1 este selectat anul (rd.00), atunci CAP3 rînd 303 col.1 trebuie să fie > 0.",
            });
        }

        // ------------------------------------------------------------
        // COD 04: Dacă (CAP1_R00_C1 selectat) => CAP4_R401_C1 = Da sau CAP4_R402_C1 = Da
        // (adică minim un checkbox bifat)
        // ------------------------------------------------------------
        if (!(cap4_401 || cap4_402)) {
            errors.push({
                weight: 10,
                fieldName: "CAP4_R401_C1", // ancorăm pe primul
                msg: "[INT-04] Dacă în CAP1 este selectat anul (rd.00), atunci în CAP4 trebuie bifat cel puțin unul: rînd 401 sau rînd 402.",
            });
        }

        // ------------------------------------------------------------
        // COD 05: CAP3_R301_C1 / CAP3_R303_C1 ≥ 1,5
        // (atenție la împărțirea la 0)
        // ------------------------------------------------------------
        if (cap3_303_c1 > 0) {
            const ratio = cap3_301_c1 / cap3_303_c1;
            if (!(ratio >= 1.5)) {
                errors.push({
                    weight: 10,
                    fieldName: "CAP3_R301_C1",
                    msg: `[INT-05] Raportul CAP3 rînd 301 col.1 / rînd 303 col.1 trebuie să fie ≥ 1,5. (Acum: ${ratio.toFixed(
                        3,
                    )})`,
                });
            }
        } else {
            // dacă 303 e 0, raportul nu se poate calcula => tot e o problemă pentru COD 05
            errors.push({
                weight: 10,
                fieldName: "CAP3_R303_C1",
                msg: "[INT-05] Nu se poate calcula raportul (301/303) deoarece CAP3 rînd 303 col.1 este 0 sau gol. Completați rînd 303.",
            });
        }
    })();

    // ======================================================================
    // 20-023: Dacă Rînd 201 > 0, atunci Rînd 601 > 0 și invers
    // (CAP2_R201_C1 <-> CAP5_R601_C1)
    // ======================================================================
    (function () {
        const f201 = "CAP2_R201_C1";
        const f601 = "CAP5_R601_C1";

        const v201_has = hasValue(values[f201]);
        const v601_has = hasValue(values[f601]);

        // dacă ambele sunt goale, nu validăm
        if (!v201_has && !v601_has) return;

        const v201 = toNumberSafe(values[f201]);
        const v601 = toNumberSafe(values[f601]);

        const cond201 = v201 > 0;
        const cond601 = v601 > 0;

        // dacă una e >0 și cealaltă nu e >0 => eroare
        if (cond201 !== cond601) {
            // ancorăm eroarea pe câmpul "care lipsește"
            const fieldName = cond201 ? f601 : f201;

            errors.push({
                weight: 10,
                fieldName,
                msg: "[20-023] Dacă rînd 201 (CAP2) > 0, atunci rînd 601 (CAP5) > 0 și invers.",
            });
        }
    })();

    // ======================================================================
    // [20-08] Cap. II: pentru rîndurile 201,202,203,204,205,205.1 -> Col.1 ≥ Col.2
    // (Numărul de camere total >= camere cu baie/duș)
    // ======================================================================
    (function () {
        const rows = ["201", "202", "203", "204", "205", "2051"];

        const fields = [];
        rows.forEach((r) => {
            fields.push(`CAP2_R${r}_C1`, `CAP2_R${r}_C2`);
        });

        // rulează doar dacă există ceva completat în câmpurile vizate
        const any = fields.some((f) => hasValue(values[f]));
        if (!any) return;

        rows.forEach((r) => {
            const c1f = `CAP2_R${r}_C1`;
            const c2f = `CAP2_R${r}_C2`;

            // dacă ambele sunt goale, nu validăm
            if (!hasValue(values[c1f]) && !hasValue(values[c2f])) return;

            const c1 = toNumberSafe(values[c1f]);
            const c2 = toNumberSafe(values[c2f]);

            // dacă C2 e completat, C1 trebuie să fie completat și >= C2
            if (hasValue(values[c2f]) && (!hasValue(values[c1f]) || c1 < c2)) {
                errors.push({
                    weight: 10,
                    fieldName: c1f,
                    msg: `[20-08] Cap. II: pentru rîndul ${r === "2051" ? "205.1" : r}, Col.1 trebuie să fie ≥ Col.2.`,
                });
            }

            // dacă ambele sunt completate, verificăm strict relația
            if (hasValue(values[c1f]) && hasValue(values[c2f]) && c1 < c2) {
                errors.push({
                    weight: 10,
                    fieldName: c2f,
                    msg: `[20-08] Cap. II: pentru rîndul ${r === "2051" ? "205.1" : r}, Col.2 nu poate depăși Col.1.`,
                });
            }
        });
    })();

    // ======================================================================
    // CAP3 validations (301-305): COD 01, 02, 03 + 20-025 + 20.20
    // 01: R302 <= R301
    // 02: R303 <= R301
    // 03: R305 col.2 <= R301
    // 20-025: R301 - R303 >= R305 col.2
    // 20.20:  R301 / R303 >= 1,5
    // ======================================================================
    (function () {
        function n(field) {
            return toNumberSafe(values[field]);
        }
        function hv(field) {
            return hasValue(values[field]);
        }

        const any =
            hv("CAP3_R301_C1") ||
            hv("CAP3_R302_C1") ||
            hv("CAP3_R303_C1") ||
            hv("CAP3_R304_C1") ||
            hv("CAP3_R305_C1") ||
            hv("CAP3_R305_C2");

        if (!any) return;

        const r301 = n("CAP3_R301_C1");
        const r302 = n("CAP3_R302_C1");
        const r303 = n("CAP3_R303_C1");
        const r305c2 = n("CAP3_R305_C2");

        // COD 01: R302 <= R301
        if (hv("CAP3_R302_C1") && r302 > r301) {
            errors.push({
                weight: 10,
                fieldName: "CAP3_R302_C1",
                msg: "[COD 01] Rînd 302 nu poate depăși rînd 301 (R302 ≤ R301).",
            });
        }

        // COD 02: R303 <= R301
        if (hv("CAP3_R303_C1") && r303 > r301) {
            errors.push({
                weight: 10,
                fieldName: "CAP3_R303_C1",
                msg: "[COD 02] Rînd 303 nu poate depăși rînd 301 (R303 ≤ R301).",
            });
        }

        // COD 03: R305 col.2 <= R301
        if (hv("CAP3_R305_C2") && r305c2 > r301) {
            errors.push({
                weight: 10,
                fieldName: "CAP3_R305_C2",
                msg: "[COD 03] Rînd 305 col.2 nu poate depăși rînd 301 (R305 col.2 ≤ R301).",
            });
        }

        // 20-025: R301 - R303 >= R305 col.2
        // (validăm dacă există ceva în câmpurile implicate)
        if (hv("CAP3_R301_C1") || hv("CAP3_R303_C1") || hv("CAP3_R305_C2")) {
            const diff = r301 - r303;
            if (diff < r305c2) {
                errors.push({
                    weight: 10,
                    fieldName: "CAP3_R305_C2",
                    msg: "[20-025] Condiția trebuie respectată: (Rînd 301 - Rînd 303) ≥ Rînd 305 col.2.",
                });
            }
        }

        // 20.20: R301 / R303 >= 1,5
        // (dacă R303 e 0/gol -> nu se poate calcula)
        if (hv("CAP3_R301_C1") || hv("CAP3_R303_C1")) {
            if (r303 > 0) {
                const ratio = r301 / r303;
                if (ratio < 1.5) {
                    warnings.push({
                        weight: 10,
                        fieldName: "CAP3_R301_C1",
                        msg:
                            "[20.20] Raportul Rînd 301 / Rînd 303 trebuie să fie ≥ 1,5. " +
                            "(Acum: " +
                            ratio.toFixed(3) +
                            ")",
                    });
                }
            } else {
                errors.push({
                    weight: 10,
                    fieldName: "CAP3_R303_C1",
                    msg: "[20.20] Nu se poate calcula raportul (301/303) deoarece Rînd 303 este 0 sau gol. Completați Rînd 303.",
                });
            }
        }
    })();

    // ======================================================================
    // CAP3 extra validations: 20-029 / 20-030 / 20-031
    // 20-029: Dacă R305 col.1 = 1 => R305 col.2 > 15
    // 20-030: Dacă R305 col.1 = 2 => R305 col.2 > 30
    // 20-031: Dacă R305 col.1 = 3 => R305 col.2 > 45
    // ======================================================================
    (function () {
        function n(field) {
            return toNumberSafe(values[field]);
        }
        function hv(field) {
            return hasValue(values[field]);
        }

        const c1Field = "CAP3_R305_C1";
        const c2Field = "CAP3_R305_C2";

        // dacă rînd 305 nu e atins deloc, nu validăm
        if (!hv(c1Field) && !hv(c2Field)) return;

        const c1 = n(c1Field);
        const c2 = n(c2Field);

        // aplicăm regula doar pentru cazurile cerute (1/2/3)
        const map = {
            1: { min: 15, code: "20-029" },
            2: { min: 30, code: "20-030" },
            3: { min: 45, code: "20-031" },
        };

        if (!map.hasOwnProperty(c1)) return;

        const rule = map[c1];

        // dacă C1 e 1/2/3, dar C2 e gol -> tot e problemă (nu poate fi > prag)
        if (!hv(c2Field) || !(c2 > rule.min)) {
            errors.push({
                weight: 10,
                fieldName: c2Field,
                msg:
                    "[" +
                    rule.code +
                    "] Dacă rînd 305 col.1 = " +
                    c1 +
                    ", atunci rînd 305 col.2 trebuie să fie > " +
                    rule.min +
                    ".",
            });
        }
    })();

    // ======================================================================
    // 20-022: CAP5 R508 bifat <=> CAP3 R305 col.1 > 0 (și invers)
    // ======================================================================
    (function () {
        const r305 = toNumberSafe(values["CAP3_R305_C1"]);
        const r508 = isChecked(values["CAP5_R508_C1"]);

        // rulează doar dacă una din părți e completată/bifată
        const any = hasValue(values["CAP3_R305_C1"]) || r508;
        if (!any) return;

        // dacă 305 > 0 => 508 trebuie bifat
        if (r305 > 0 && !r508) {
            errors.push({
                weight: 10,
                fieldName: "CAP5_R508_C1",
                msg: "[20-022] Dacă CAP3 rînd 305 col.1 > 0, atunci CAP5 rînd 508 trebuie să fie bifat.",
            });
        }

        // dacă 508 e bifat => 305 trebuie > 0
        if (r508 && !(r305 > 0)) {
            errors.push({
                weight: 10,
                fieldName: "CAP3_R305_C1",
                msg: "[20-022] Dacă CAP5 rînd 508 este bifat, atunci CAP3 rînd 305 col.1 trebuie să fie > 0.",
            });
        }
    })();

    // ======================================================================
    // 20.014: Cap. II (Rînd.*) (Col.*) > 0
    // ======================================================================
    (function () {
        const cap2Fields = [
            "CAP2_R201_C1",
            "CAP2_R201_C2",
            "CAP2_R201_C3",

            "CAP2_R202_C1",
            "CAP2_R202_C2",

            "CAP2_R203_C1",
            "CAP2_R203_C2",

            "CAP2_R204_C1",
            "CAP2_R204_C2",

            "CAP2_R205_C1",
            "CAP2_R205_C2",

            "CAP2_R2051_C1",
            "CAP2_R2051_C2",

            "CAP2_R206_C1",
            "CAP2_R207_C1",
        ];

        // rulează doar dacă există ceva completat în CAP2
        const any = cap2Fields.some((f) => hasValue(values[f]));
        if (!any) return;

        cap2Fields.forEach((f) => {
            if (!hasValue(values[f])) return; // nu cere completarea
            const v = toNumberSafe(values[f]);
            if (!(v > 0)) {
                errors.push({
                    weight: 10,
                    fieldName: f,
                    msg: "[20.014] Cap. II: toate valorile completate trebuie să fie > 0.",
                });
            }
        });
    })();

    // ======================================================================
    // 20.015: Cap. III (Rînd.*) (Col.*) > 0
    // ======================================================================
    (function () {
        const cap3Fields = [
            "CAP3_R301_C1",
            "CAP3_R302_C1",
            "CAP3_R303_C1",
            "CAP3_R304_C1",
            "CAP3_R305_C1",
            "CAP3_R305_C2",
        ];

        // rulează doar dacă există ceva completat în CAP3
        const any = cap3Fields.some((f) => hasValue(values[f]));
        if (!any) return;

        cap3Fields.forEach((f) => {
            if (!hasValue(values[f])) return; // nu cere completarea
            const v = toNumberSafe(values[f]);
            if (!(v > 0)) {
                errors.push({
                    weight: 10,
                    fieldName: f,
                    msg: "[20.015] Cap. III: toate valorile completate trebuie să fie > 0.",
                });
            }
        });
    })();

    // ======================================================================
    // 20-31: 0 ≤ Rînd 700 ≤ 180 (Cap. V)
    // ======================================================================
    (function () {
        const field = "CAP5_R700_C1";

        // dacă nu e completat, nu validăm
        if (!hasValue(values[field])) return;

        const v = toNumberSafe(values[field]);

        if (v < 0 || v > 180) {
            errors.push({
                weight: 10,
                fieldName: field,
                msg: "[20-31] Cap. V: rînd 700 trebuie să fie între 0 și 180.",
            });
        }
    })();

    (function () {
        const fields = [
            "CAP1_R101_C1",
            "CAP1_R102_C1",
            "CAP1_R103_C1",
            "CAP1_R104_C1",
            "CAP1_R105_C1",
            "CAP1_R106_C1",
            "CAP1_R107_C1",
            "CAP1_R108_C1",
            "CAP1_R109_C1",
            "CAP1_R110_C1",
            "CAP1_R111_C1",
            "CAP1_R112_C1",
            "CAP1_R1121_C1",
            "CAP1_R1122_C1",
            "CAP1_R1131_C1",
            "CAP1_R1132_C1",
            "CAP1_R1133_C1",
            "CAP1_R1134_C1",
            "CAP1_R1135_C1",
        ];

        const anyChecked = fields.some((f) => isChecked(values[f]));

        if (!anyChecked) {
            errors.push({
                weight: 10,
                fieldName: "CAP1_R101_C1", // ancorăm pe primul
                msg: "[CAP1] Selectați obligatoriu un tip al structurii (rîndurile 101–113.5).",
            });
        }
    })();

    (function () {
        const fields = [
            "CAP1_R1_C1",
            "CAP1_R2_C1",
            "CAP1_R3_C1",
            "CAP1_R4_C1",
            "CAP1_R5_C1",
            "CAP1_R6_C1",
        ];

        const anyChecked = fields.some((f) => isChecked(values[f]));

        if (!anyChecked) {
            errors.push({
                weight: 10,
                fieldName: "CAP1_R1_C1", // ancorăm pe primul
                msg: "[CAP1] Selectați obligatoriu o categorie de clasificare (rîndurile 1–6).",
            });
        }
    })();

    webform.validatorsStatus.asc1 = 1;
    validateWebform();
};
