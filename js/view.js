import { getInstance as Model } from "./model.js";
let view;

class View {
    #DOM;

    constructor() {
        this.#DOM = {
            notelist: document.querySelector('#notelist'),
            notelistArchiv: document.querySelector('#notelistArchiv'),
            headerinput: document.querySelector('#headerinput'),
            noteinput: document.querySelector('#noteinput'),
            tagContainer: document.querySelector('#tagContainer'),
            tagsList: document.querySelector('#tagsList'),
            totalNotesCount: document.querySelector('#totalNotesCount'),
            totalArchivedNotesCount: document.querySelector('#totalArchivedNotesCount'),
            totalTagsCount: document.querySelector('#totalTagsCount'),
        };
    }

    addNote(note) {
        let html = this.#getHTML(note)
        this.#DOM.notelist.insertAdjacentHTML('beforeend', html);
        this.#updateTotalNotesCount();
    }

    archiveNoteInList(archivedNote) {
        let html = this.#getHTML(archivedNote)
        this.#DOM.notelistArchiv.insertAdjacentHTML('beforeend', html);
        this.#updateTotalArchivedNotesCount();

        this.#removeNoteFromList(archivedNote.id);
    }

    #getHTML(note) {
        let tagsHTML = '';
        note.tags.forEach(tag => {
            tagsHTML += `<small data-tag="${tag}">${tag}</small>`;
        });

        let priorityIcon = '';
        switch (note.priority) {
            case 'Hoch':
                priorityIcon = '<i class="bi bi-arrow-up"></i>';
                break;
            case 'Normal':
                priorityIcon = '<i class="bi bi-dash"></i>';
                break;
            case 'Niedrig':
                priorityIcon = '<i class="bi bi-arrow-down"></i>';
                break;
            default:
                priorityIcon = '';
                break;
        }

        // Erstellt aktuelles Datum und Zeit
        let currentDate = new Date();
        // Formatiert Zeit in Stunden und Minuten
        let formattedTime = currentDate.getHours() + ':' + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes();
        // Formatiert Datum in Format "DD.MM.YYYY"
        let formattedDate = currentDate.getDate() + '.' + (currentDate.getMonth() + 1) + '.' + currentDate.getFullYear();

        return `
    <a href="#" class="list-group-item list-group-item-action" data-index="${note.id}">
        <div class="d-flex flex-wrap justify-content-between">
            <div class="list-header d-flex flex-column flex-md-row justify-content-between flex-grow-1">
                <h5 class="noteTitle mb-1">${note.title}</h5>
                <small class="time mb-1 mb-md-0">Zuletzt editiert: ${formattedDate} - ${formattedTime} Uhr</small>
            </div>
            <small class="notePriority ml-2">${priorityIcon}</small>
          </div>
        <p class="noteDescription my-3">${note.description}</p>
        <div class="noteTags mt-2">
            ${tagsHTML}
        </div>
    </a>
    `;
    }

    updateNoteList(filteredNotes) {
        // Leert zuerst die Notizliste in der Ansicht, wenn keine archivierten Notizen gefiltert werden
        if (!filteredNotes.some(note => Model().getNoteList(true).has(note.id))) {
            this.#DOM.notelist.innerHTML = '';
        }

        // Überprüft, ob archivierte Notizen gefiltert wurden
        const isArchiveFiltered = filteredNotes.some(note => Model().getNoteList(true).has(note.id));

        // Leert den Archivbereich nur, wenn archivierte Notizen gefiltert werden
        if (isArchiveFiltered) {
            this.#DOM.notelistArchiv.innerHTML = '';
        }

        // Iteriert über die gefilterten Notizen und fügt sie entsprechend der Archivierung der Notizliste hinzu
        filteredNotes.forEach(note => {
            if (Model().getNoteList().has(note.id)) {
                // Note gehört zur normalen Notizliste
                this.addNote(note);
            } else if (Model().getNoteList(true).has(note.id)) {
                // Note gehört zur archivierten Notizliste
                this.archiveNoteInList(note);
            }
        });
    }


    displayNoteDetails(note) {
        if (note && note.title && note.description && note.tags) {
            this.#DOM.headerinput.textContent = note.title;
            this.#DOM.noteinput.textContent = note.description;

            // Leert zuerst den Inhalt des Tag-Containers
            this.#DOM.tagContainer.innerHTML = '';

            // Fügt jedes Tag als <p> -Element hinzu
            note.tags.forEach(tag => {
                const tagDiv = document.createElement('div');
                tagDiv.classList.add('tag')
                tagDiv.innerHTML =`<p class="col" data-tag="${tag}">${tag}</p>`;
                this.#DOM.tagContainer.appendChild(tagDiv);
            });

            // Selektiert das Dropdown-Menü für die Priorität
            const priorityDropdown = document.querySelector('#priorityDropdown');

            // Iteriert über alle Optionen im Dropdown-Menü, um das selektierte Element zu finden und zu aktualisieren
            priorityDropdown.querySelectorAll('option').forEach(option => {
                if (option.value === note.priority) { // Vergleicht die Priorität mit dem Wert der Option
                    option.selected = true; // Setzt das selektierte Attribut für das passende option-Element
                }
            });
        } else {
            console.error('Ungültige Notiz oder fehlende Eigenschaften:', note);
        }
    }

    updateNoteInList(updatedNote) {
        const noteElement = document.querySelector(`[data-index="${updatedNote.id}"]`);
        // Die gesamte Note wird übergeben, daher kann direkt darauf zugegriffen werden
        noteElement.querySelector('.noteTitle').textContent = updatedNote.title;
        noteElement.querySelector('.noteDescription').textContent = updatedNote.description;

        // Aktualisiert Priorität und fügt entsprechendes Icon ein
        const priorityElement = noteElement.querySelector('.notePriority');
        priorityElement.innerHTML = ''; // Entfernt den Inhalt des Elements, um ihn neu zu setzen

        let priorityIcon = '';
        switch (updatedNote.priority) {
            case 'Hoch':
                priorityIcon = '<i class="bi bi-arrow-up"></i>';
                break;
            case 'Normal':
                priorityIcon = '<i class="bi bi-dash"></i>';
                break;
            case 'Niedrig':
                priorityIcon = '<i class="bi bi-arrow-down"></i>';
                break;
            default:
                priorityIcon = '';
                break;
        }

        priorityElement.innerHTML = priorityIcon;


        // Aktualisiert Tags
        const tagContainer = noteElement.querySelector('.noteTags');
        const smallTags = tagContainer.querySelectorAll('small');
        let i = 0;

        // Aktualisiert jeden vorhandenen small-Tag mit den aktualisierten Werten aus updatedNote.tags
        updatedNote.tags.forEach(tag => {
            if (i < smallTags.length) {
                smallTags[i].textContent = tag;
                i++;
            } else {
                // Wenn es mehr Tags gibt als vorhandene small-Tags, wird ein neuer Tags hinzugefügt
                const newTagElement = document.createElement('small');
                newTagElement.textContent = tag;
                newTagElement.dataset.tag = tag;
                tagContainer.appendChild(newTagElement);
            }
        });
    }

    updateTagInList(tag) {
        // Aktualisiert das Tag-Element in der Tag-Liste
        const tagElements = document.querySelectorAll('#tagsList span');
        console.log(tag.newTag)
        console.log(tag.oldTag)
        tagElements.forEach(tagElement => {
            if (tagElement.textContent.includes(tag.oldTag)) { // Greift auf das Object oldTag zu
                tagElement.textContent = tag.newTag;
                tagElement.dataset.tag = tag.newTag; // Aktualisiert das data-tag-Attribut

                // Aktualisiert auch den Wert (value) der zugehörigen Buttons
                const parentDiv = tagElement.parentElement;
                const deleteButton = parentDiv.querySelector('#deleteTag');
                const editButton = parentDiv.querySelector('#editTag');
                deleteButton.value = tag.newTag;
                editButton.value = tag.newTag;
            }
        });

        // Aktualisiert die list-group-items, die das aktualisierte Tag enthält
        const noteElements = document.querySelectorAll('.list-group-item');
        noteElements.forEach(noteElement => {
            const smallTags = noteElement.querySelectorAll('.noteTags small');
            smallTags.forEach(smallTag => {
                if (smallTag.textContent === tag.oldTag) {
                    smallTag.textContent = tag.newTag;
                    smallTag.dataset.tag = tag.newTag;
                }
            });
        });

        // Aktualisiert das p-Tag in der Detailansicht, falls das Tag bearbeitet wurde
        const tagContainer = document.querySelector('#tagContainer');
        const colTags = tagContainer.querySelectorAll('div p');
        colTags.forEach(colTag => {
            if (colTag.textContent === tag.oldTag) {
                colTag.textContent = tag.newTag;
                colTag.dataset.tag = tag.newTag
            }
        });
    }

    deleteSelectedTag(note) {
        // Lösche das entsprechende Tag-Element im #tagContainer
        const tagElement = document.querySelector('#tagContainer p[data-tag="' + note.tagName + '"]');
        if (tagElement) {
            tagElement.parentElement.remove();
        } else {
            console.error('Das ausgewählte Tag-Element im #tagContainer wurde nicht gefunden.');
        }

        // Lösche das entsprechende small-Tag-Element im aktiven list-group-item
        const activeNoteItem = document.querySelector('.list-group-item[data-index="' + note.noteId + '"]');
        if (activeNoteItem) {
            const noteTags = activeNoteItem.querySelectorAll('.noteTags small[data-tag="' + note.tagName + '"]');
            noteTags.forEach(tag => {
                tag.remove();
            });
        } else {
            console.error('Das aktive list-group-item wurde nicht gefunden.');
        }


    }

    #removeNoteFromList(noteId) {
        const noteElement = this.#DOM.notelist.querySelector(`[data-index="${noteId}"]`);
        if (noteElement) {
            noteElement.remove();
        }
        this.#updateTotalNotesCount();
    }

    rearchiveNoteInList(rearchivedNote) {
        let html = this.#getHTML(rearchivedNote)
        this.#DOM.notelist.insertAdjacentHTML('beforeend', html);

        this.#removeNoteFromArchivedList(rearchivedNote.id); // Entfernt die rückarchivierte Notiz aus der archivierten Liste
        this.#updateTotalNotesCount();
    }

    #removeNoteFromArchivedList(noteId) {
        const noteElement = this.#DOM.notelistArchiv.querySelector(`[data-index="${noteId}"]`);
        if (noteElement) {
            noteElement.remove();
        } else {
            console.error('Notiz nicht im Archiv gefunden:', noteId);
        }
        this.#updateTotalArchivedNotesCount();
    }

    addTag(tag) {
        if (!this.checkDuplicateTag(tag)) {
            this.addTagToTagList(tag);
        }
        this.#updateTotalTagsCount()
    }

    // Methode zum Hinzufügen von Tags zur Liste
    addTagToTagList(tag) {
        const tagList = document.querySelector('#tagsList');
        const tagListItem = document.createElement('div');
        tagListItem.classList.add('tagRow');
        tagListItem.innerHTML = `<span class="d-flex align-items-center" data-tag="${tag}">${tag}</span>
        <div class="btn-container">
            <button type="button" value="${tag}" id="deleteTag" class="btn btn-danger">
               <i class="bi bi-trash"></i>
               <p class="text d-none d-sm-inline">Löschen</p>
            </button>
            <button type="button" value="${tag}" id="editTag" class="btn btn-primary">
               <i class="bi bi-pencil"></i>
               <p class="text d-none d-sm-inline">Bearbeiten</p>
            </button>
        </div>
        `

        tagList.appendChild(tagListItem);
    }

    // Methode zum Überprüfen auf doppelte Tags
    checkDuplicateTag(tag) {
        const tags = document.querySelectorAll('#tagsList span');
        for (let i = 0; i < tags.length; i++) {
            if (tags[i].textContent === tag) {
                return true;
            }
        }
        return false;
    }

    deleteNoteFromList(noteId) {
        const noteElement = document.querySelector(`[data-index="${noteId}"]`);
        if (noteElement) {
            noteElement.remove();
        } else {
            console.error('Notiz nicht gefunden:', noteId);
        }
        this.#updateTotalNotesCount();
        this.#updateTotalArchivedNotesCount();
    }

    #updateTotalNotesCount() {
        this.#DOM.totalNotesCount.textContent = Model().getNoteList().size;
    }

    #updateTotalArchivedNotesCount() {
        this.#DOM.totalArchivedNotesCount.textContent = Model().getNoteList(true).size;
    }

    #updateTotalTagsCount() {
        this.#DOM.totalTagsCount.textContent = Model().getTagList().size;
    }

    deleteTagFromList(tagName) {
        const tagElements = document.querySelectorAll('#tagsList span');

        tagElements.forEach(function (tagElement) {
            if (tagElement.textContent.includes(tagName)) {
                console.log('Tag gelöscht: '+tagName)
                let rowElement = tagElement.parentElement; // Zugriff auf das übergeordnete Element ("row")
                rowElement.parentNode.removeChild(rowElement); // Entferne die gesamte "row"
            }
        });

        this.#updateTotalTagsCount();
    }

    showNoteDetails() {
        const detailView = document.querySelector('.detailView');
        detailView.classList.replace('d-none', 'd-block');

        const listRow = document.querySelector('.listRow')
        const tabContent = document.querySelector('.tab-content');
        listRow.classList.remove('justify-content-center');
        tabContent.classList.replace('col-lg-7', 'col-lg-5');
    }

    // Methode zum Ausblenden der Detailansicht
    hideNoteDetails() {
        const detailView = document.querySelector('.detailView');
        detailView.classList.replace('d-block', 'd-none');

        const listRow = document.querySelector('.listRow')
        const tabContent = document.querySelector('.tab-content');
        listRow.classList.add('justify-content-center');
        tabContent.classList.replace('col-lg-5', 'col-lg-7');
    }

    displayExistingTags(existingTagsId, modalPrefix) {
        const existingTagsContainer = document.querySelector(`${existingTagsId}`);
        existingTagsContainer.innerHTML = ''; // Leert das Container-Element, bevor die Tags hinzugefügt werden

        // Holt sich die vorhandenen Tags aus dem Modell und fügt sie als Checkboxen hinzu
        const existingTags = Model().getTagList();
        existingTags.forEach(tag => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'existingTag';
            checkbox.value = tag;
            checkbox.id = `${modalPrefix}-${tag}`; // Verwendet das Modal-Präfix

            const label = document.createElement('label');
            label.textContent = tag;
            label.setAttribute('for', `${modalPrefix}-${tag}`);

            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);

            existingTagsContainer.appendChild(div);
        });
    }

    openModal(modalId) {
        let modal = document.querySelector(`${modalId}`);
        modal.classList.add('show', 'd-block');
        modal.classList.add('modal-backdrop-shadow')
    }

    closeModal(modalId) {
        let modal = document.querySelector(`${modalId}`);
        modal.classList.remove('show')
        modal.classList.replace('d-block', 'd-none')
        modal.classList.remove('modal-backdrop-shadow')
    }

    clearModalInputs(modalId) {
        const modal = document.querySelector(`${modalId}`);

        const inputFields = modal.querySelectorAll('input, textarea, select');
        inputFields.forEach(field => {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = false;
            } else if (field.tagName === 'SELECT') {
                // Setzt den Index auf den Standardwert (in diesem Fall 1 für 'Normal')
                field.selectedIndex = 1;
            } else {
                field.value = '';
            }
        });
    }
}

export function getInstance() {
    if (!view) {
        view = new View();
    }
    return view;
}
