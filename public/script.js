const $ = (selector) => document.querySelector(selector);

async function api(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

function getFormData(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function showMessage(element, message, isError = false) {
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? "red" : "green";
}

// LIST PATIENTS

async function loadPatients() {
    const body = $("#patientsBody");

    if (!body) return;

    try {
        const patients = await api("/api/patients");

        if (patients.length === 0) {
            body.innerHTML =
                '<tr><td colspan="7">No patients registered.</td></tr>';
            return;
        }

        body.innerHTML = "";

        patients.forEach(patient => {
            const row = document.createElement("tr");

            [
                patient.patient_id,
                patient.patient_name,
                patient.patient_email,
                patient.phone_no,
                patient.gender,
                patient.age,
                patient.problem
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            body.appendChild(row);
        });

    } catch (error) {
        body.innerHTML =
            `<tr><td colspan="7">${error.message}</td></tr>`;
    }
}

// ADD PATIENT

const addForm = $("#addPatientForm");

if (addForm) {
    addForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            const result = await api("/api/patients", {
                method: "POST",
                body: JSON.stringify(getFormData(addForm))
            });

            showMessage(
                $("#formMessage"),
                result.message + " Patient ID: " + result.patient_id
            );

            addForm.reset();

        } catch (error) {
            showMessage($("#formMessage"), error.message, true);
        }
    });
}

// FIND PATIENT

const findForm = $("#findPatientForm");

if (findForm) {
    findForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const id = $("#patientId").value.trim();
        const output = $("#patientDetails");

        output.innerHTML = "";

        try {
            const patient = await api(
                `/api/patients/${encodeURIComponent(id)}`
            );

            const table = document.createElement("table");

            const details = {
                "Patient ID": patient.patient_id,
                "Name": patient.patient_name,
                "Email": patient.patient_email,
                "Phone": patient.phone_no,
                "Gender": patient.gender,
                "Age": patient.age,
                "Problem": patient.problem
            };

            Object.entries(details).forEach(([label, value]) => {
                const row = document.createElement("tr");
                const heading = document.createElement("th");
                const cell = document.createElement("td");

                heading.textContent = label;
                cell.textContent = value ?? "";

                row.append(heading, cell);
                table.appendChild(row);
            });

            output.appendChild(table);

            showMessage($("#detailsMessage"), "Patient found.");

        } catch (error) {
            showMessage($("#detailsMessage"), error.message, true);
        }
    });
}

// LOAD AND UPDATE PATIENT

const editForm = $("#editPatientForm");

if (editForm) {
    $("#loadPatientButton").addEventListener("click", async function () {
        const id = $("#editPatientId").value.trim();

        try {
            const patient = await api(
                `/api/patients/${encodeURIComponent(id)}`
            );

            [
                "patient_name",
                "patient_email",
                "phone_no",
                "gender",
                "age",
                "problem"
            ].forEach(field => {
                editForm.elements[field].value = patient[field] ?? "";
            });

            showMessage(
                $("#editMessage"),
                "Patient loaded. Change the details and click Update."
            );

        } catch (error) {
            showMessage($("#editMessage"), error.message, true);
        }
    });

    editForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const id = $("#editPatientId").value.trim();

        if (!id) {
            showMessage($("#editMessage"), "Enter a patient ID first.", true);
            return;
        }

        try {
            const result = await api(
                `/api/patients/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    body: JSON.stringify(getFormData(editForm))
                }
            );

            showMessage($("#editMessage"), result.message);

        } catch (error) {
            showMessage($("#editMessage"), error.message, true);
        }
    });
}

// DELETE PATIENT

const deleteForm = $("#deletePatientForm");

if (deleteForm) {
    deleteForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const id = $("#deletePatientId").value.trim();

        if (!confirm("Are you sure you want to delete this patient?")) {
            return;
        }

        try {
            const result = await api(
                `/api/patients/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );

            showMessage($("#deleteMessage"), result.message);
            deleteForm.reset();

        } catch (error) {
            showMessage($("#deleteMessage"), error.message, true);
        }
    });
}

loadPatients();