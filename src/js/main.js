'use strict';

function onSuccess(form) {
    console.log('form:', form);
}

function serializeForm(form) {
    return new FormData(form);
}

async function sendData(data, formAction) {
    return await fetch(formAction, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: data
    });
}

async function handleFormSubmit(form) {
    const data = serializeForm(form);
    const formAction = form.action;
    const response = await sendData(data, formAction);
    const { status } = response;

    if (status === 200) {
        onSuccess(form);
    }

    if (status === 404) {
        onSuccess(form);
    }
}

function initValidation(form) {
    form.noValidate = true;

    form.addEventListener('submit', () => {
        event.preventDefault();
        const allValid = form.checkValidity();
        allValid && handleFormSubmit(form);
    });

    const fields = Array.from(form.elements).filter((element) => !!element.name);
    const connectedFields = Array.from(form.querySelectorAll('input[type=tel], input[type=email]'));

    const createMessage = (field) => {
        const errorElement = document.createElement('div');
        const errorId = field.id + '-error';
        errorElement.classList.add('form-item__error');
        errorElement.setAttribute('id', errorId);
        field.setAttribute('aria-describedBy', errorId);

        // !!! if label before input !!!
        // if (!field.nextElementSibling) {
        //     field.after(errorElement);
        // } else {
        //     field.nextElementSibling.replaceWith(errorElement);
        // }

        const parentElement = field.parentElement;

        if (!parentElement.lastElementChild.classList.contains('form-item__error')) {
            parentElement.append(errorElement);
        } else {
            parentElement.lastElementChild.replaceWith(errorElement);
        }
    }

    const showMessage = (field) => {
        field.setAttribute('aria-invalid', true);

        createMessage(field);

        const isFieldConnected = connectedFields.includes(field);
        const message = getMessage(field, isFieldConnected);

        // !!! if label before input !!!
        // field.nextElementSibling.textContent = message || field.validationMessage;

        const parentElement = field.parentElement;

        parentElement.lastElementChild.textContent = message || field.validationMessage;
    }

    const hideMessage = (field) => {
        field.setAttribute('aria-invalid', false);
        field.removeAttribute('aria-describedBy');

        // !!! if label before input !!!
        // if (field.nextElementSibling) {
        //     field.nextElementSibling.remove();
        // }

        const parentElement = field.parentElement;

        if (parentElement.lastElementChild.classList.contains('form-item__error')) {
            parentElement.lastElementChild.remove();
        }
    }

    const checkHideMessage = (boolean, field) => {
        if (boolean) {
            hideMessage(field);
        }
    }

    function setValidityToConnectedField(field, reverseField) {
        const isValid = field.checkValidity();
        reverseField.required = !isValid;
        checkHideMessage(isValid, field);
        checkHideMessage(isValid, reverseField);

        if (field.value === '') {
            reverseField.required = true;
        }
    }

    const handleConnected = (field) => {
        connectedFields
            .filter(reverseField => field !== reverseField)
            .forEach(reverseField => setValidityToConnectedField(field, reverseField));
    }

    const handleIndependent = (field) => {
        const isValid = field.checkValidity();
        checkHideMessage(isValid, field);
    }

    fields.forEach(field => {
        field.addEventListener('invalid', () => {
            showMessage(event.target);
        });

        const handleInput = (event) => {
            const currentField = event.target;
            const isFieldConnected = connectedFields.includes(currentField);
            isFieldConnected ? handleConnected(currentField) : handleIndependent(currentField);
        }

        field.addEventListener('input', handleInput);
    });
}

function getMessage(field, isFieldConnected) {
    const validity = field.validity;

    if (isFieldConnected) {
        if (validity.valueMissing) return 'Input Phone or E-mail';
    } else if (field.type === 'text') {
        if (validity.valueMissing) return 'What is your Name ?';
    } else if (field.type === 'textarea') {
        if (validity.valueMissing) return 'Tell us about your project';
    }
}

for (let form of document.forms) {
    initValidation(form);
}
