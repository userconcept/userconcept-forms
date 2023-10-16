'use strict';

const config = {
    connectedTypes: ['email', 'tel'],
    errorMessages: {
        name: 'What is your Name ?',
        tel: 'Input Phone or E-mail',
        email: 'Input Phone or E-mail',
        message: 'Tell us about your project'
    }
}

const getConnectedFields = (form) => {
    const selector = config.connectedTypes
        .map(type => `input[type=${type}]`)
        .join();

    return Array.from(form.querySelectorAll(selector));
};

function serializeForm(form) {
    return new FormData(form);
}

function onSuccess(form) {
    console.log('form:', form);
}

async function sendData(form) {
    const data = serializeForm(form);
    const formAction = form.action;
    const response = await fetch(formAction, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: data
    });

    const { status } = response;

    if (status === 200) {
        onSuccess(form);
    }

    if (status === 404) {
        onSuccess(form);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (form.checkValidity()) {
        sendData(form);
    };
}

function initForm(form) {
    form.noValidate = true;

    const connectedFields = getConnectedFields(form);

    const handleInput = (event) => {
        const currentField = event.target;
        const isFieldConnected = config.connectedTypes.includes(currentField.type);
        isFieldConnected ? handleConnected(currentField, connectedFields) : handleIndependent(currentField);
    }

    const handleInvalid = (event) => {
        showMessage(event.target, connectedFields);
    }

    form.addEventListener('input', handleInput);

    form.addEventListener('invalid', handleInvalid, true);

    form.addEventListener('submit', handleFormSubmit);
}

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

function getMessage(field) {
    const validity = field.validity;

    if (validity.valueMissing) {
        return config.errorMessages[field.name.replace(`${field.form.name}-`, '')];
    }
}

const showMessage = (field, connectedFields) => {
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

    if (field.value === '') { // field.value.length
        reverseField.required = true;
    }
}

const handleConnected = (field, connectedFields) => {
    connectedFields
        .filter(reverseField => field !== reverseField)
        .forEach(reverseField => setValidityToConnectedField(field, reverseField));
}

const handleIndependent = (field) => {
    const isValid = field.checkValidity();
    checkHideMessage(isValid, field);
}

for (let form of document.forms) {
    initForm(form);
}
