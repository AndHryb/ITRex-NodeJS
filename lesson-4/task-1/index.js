"use strict";

import PatientQueue from './src/js/PatientQueue.js';
import Patient from './src/js/Patient.js';
import Resolution from './src/js/Resolution.js';
import ResolutionList from './src/js/ResolutionList.js';

const queue = new PatientQueue();
const resolutionList = new ResolutionList();
let currentPatient = null;

//находим все кнопки
const nextPatientButton = document.getElementById('nextButton');
const addNewPatientButton = document.getElementById('addNewPatientButton');
const addNewResolutionButton = document.getElementById('addNewResolutionButton');
const showResolutionToDoctorButton = document.getElementById('showResolutionButton__doctorInterface');
const deleteResolutionButton = document.getElementById('deleteResolutionButton');

//находим все инпуты
const newPatinetNameInput = document.getElementById('newPatientName');
const newResolutionInput = document.getElementById('newResolutionInput');
const searchResolutionDoctorInput = document.getElementById('searchResolution__doctorInterface');
const searchResolutionPatientInput = document.getElementById('searchResolution__patientInterface');

//находим все дивы
const queueListDoctorInterface = document.getElementById('currentPatientName_doctorInterface');
const queueListUserInterface = document.getElementById('currentPatientName_userInterface');
const doctorFieldWithFoundedResolution = document.getElementById('foundResolutionField__doctorInterface');
const patientFieldWithFoundedResolution = document.getElementById('foundResolutionField__patientInterface');


//добавляем обработчики на кнопки
addNewPatientButton.addEventListener('click', addNewPatient);
nextPatientButton.addEventListener('click', callNextPatient);
addNewResolutionButton.addEventListener('click', addNewResolutionForCurrentPatient);
showResolutionToDoctorButton.addEventListener('click', findResolutionForDoctor);
deleteResolutionButton.addEventListener('click', deleteResolution);

//добавляем обработчики на инпуты
newPatinetNameInput.addEventListener('input', addButtonStatusChange(addNewPatientButton));
newResolutionInput.addEventListener('input', addButtonStatusChange(addNewResolutionButton));
searchResolutionDoctorInput.addEventListener('input', addButtonStatusChange(showResolutionToDoctorButton));

document.addEventListener('keydown', findResolutionForPatient);


//интерфейс пациента
function addNewPatient() {
    const patientName = newPatinetNameInput.value;

    queue.addPatient(new Patient(patientName));
    nextPatientButton.disabled = false;
    dischargeInput(newPatinetNameInput, addNewPatientButton);
}

function findResolutionForPatient(event) {

    if (searchResolutionPatientInput.value && event.keyCode === 13) {
        const patientName = searchResolutionPatientInput.value;
        const foundResolution = resolutionList.findResolution(patientName, false);
        patientFieldWithFoundedResolution.innerHTML = foundResolution;
    }
}



//интерфейс доктора
function callNextPatient() {
    currentPatient = queue.takePatient();

    queueListDoctorInterface.innerHTML = currentPatient.name;
    queueListUserInterface.innerHTML = currentPatient.name;

    if (queue.isEmpty()) {
        nextPatientButton.disabled = true;
    }

}

function addNewResolutionForCurrentPatient() {
    let newResolution = new Resolution(newResolutionInput.value, currentPatient);

    currentPatient.addResolution(newResolution);
    resolutionList.addNewResolution(newResolution);

    dischargeInput(newResolutionInput, addNewResolutionButton);
}

function findResolutionForDoctor() {
    const patientName = searchResolutionDoctorInput.value;
    const foundResolution = resolutionList.findResolution(patientName, true);

    doctorFieldWithFoundedResolution.innerHTML = foundResolution;
    deleteResolutionButton.disabled = false;
}

function deleteResolution() {
    if (confirm('are you sure?')) {
        resolutionList.deleteResolution();
    } else {
        return;
    }

    dischargeInput(doctorFieldWithFoundedResolution, deleteResolutionButton);
    dischargeInput(searchResolutionDoctorInput, showResolutionToDoctorButton)
}



//вспомогательные функции
function dischargeInput(element, button) {
    element.tagName === 'INPUT' ? element.value = '' : element.innerHTML = '';
    button.disabled = true;
}

function addButtonStatusChange(button) {
    return (event) => event.target.value ? button.disabled = false : button.disabled = true;
}

