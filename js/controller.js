import {getInstance as Model} from "./model.js";
import {getInstance as View} from "./view.js";

let controller;

class Controller {
    constructor() {
        let model = Model();
        let view = View();

        model.subscribe("addNote", view, view.addNote);
        model.subscribe("updateNote", view, view.updateNoteInList);
        model.subscribe("updateNote", view, view.displayNoteDetails);
        model.subscribe("updateArchivedNote", view, view.updateNoteInList);
        model.subscribe("updateArchivedNote", view, view.displayNoteDetails);
        model.subscribe("archiveNote", view, view.archiveNoteInList);
        model.subscribe("rearchiveNote", view, view.rearchiveNoteInList);
        model.subscribe("addTag", view, view.addTag);
        model.subscribe("deleteNote", view, view.deleteNoteFromList);
        model.subscribe("deleteTag", view, view.deleteTagFromList);
        model.subscribe("updateTag", view, view.updateTagInList);
        model.subscribe("removeTagFromNote", view, view.deleteSelectedTag);

        this.#init(); // Hier wird die Initialisierungsmethode aufgerufen
    }

    #init() {

        document.querySelector('#add').addEventListener('click', () => {
            View().clearModalInputs('#noteModal')
            View().openModal('#noteModal')
            View().displayExistingTags('#add-existingTags', 'noteModal');
        });

        document.querySelector('#saveModal').addEventListener('click', () => {
            let title = document.querySelector('#noteTitle').value;
            let text = document.querySelector('#noteText').value;
            let priority = document.querySelector('#notePriority').value;

            let tags = this.#saveTags('#newTag');

            if (title && text && tags.length > 0) {
                Model().addNote(title, text, tags, priority);
                View().closeModal('#noteModal');
            } else {
                alert('Bitte füllen Sie Titel, Text und weise einen Tag zu.');
            }

        });

        document.querySelector('#closeModal').addEventListener('click', () => {
            View().closeModal('#noteModal');
        });


        document.querySelector('#filter').addEventListener('click', () => {
            // Rufe die Methode zum Filtern der Notizen auf
            const filteredNotes = Model().filterNotesByPriority(Model().getNoteList());
            View().updateNoteList(filteredNotes);
        });


        document.querySelector('#filterArchiv').addEventListener('click', () => {
            // Ruft die Methode zum Filtern der Notizen auf
            const filteredNotes = Model().filterNotesByPriority(Model().getNoteList(true));
            View().updateNoteList(filteredNotes);
        });

        document.addEventListener('click', function(event) {
            let listItem = event.target.closest('.list-group-item');
            let isActiveListItem = document.querySelector('.list-group-item.active') !== null;

            if (listItem) {
                // Entfernt die Klasse "active" von allen list-group-items
                document.querySelectorAll('.list-group-item').forEach(item => {
                    item.classList.remove('active');
                });

                // Fügt die Klasse "active" zum ausgewählten list-group-item hinzu
                listItem.classList.add('active');
                let index = listItem.getAttribute('data-index');

                // Überprüft, ob die ausgewählte Notiz archiviert ist
                const isArchivedNote = listItem.closest('#notelistArchiv') !== null;

                // Notizliste entsprechend abrufen
                const selectedNote = Model().getNoteById(parseInt(index), isArchivedNote);

                View().displayNoteDetails(selectedNote);
                View().showNoteDetails(); // Detailansicht anzeigen

                // Scrollen zur Detailansicht
                let detailView = document.querySelector('.detailView');
                detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (!isActiveListItem) {
                // Kein list-group-item ausgewählt und kein aktives list-group-item vorhanden, Detailansicht ausblenden
                View().hideNoteDetails();
            }
        });

        document.querySelector('#save').addEventListener('click', () => {
            // Daten aus den Eingabefeldern der Detailansicht extrahieren
            let updatedTitle = document.querySelector('#headerinput').textContent;
            let updatedDescription = document.querySelector('#noteinput').textContent;

            // Die ID der ausgewählten Notiz abrufen
            let noteId = parseInt(document.querySelector('.list-group-item.active').getAttribute('data-index'));

            // Überprüfen, ob die ausgewählte Notiz in der archivierten Liste ist
            const isArchivedNote = document.querySelector('.list-group-item.active').closest('#notelistArchiv') !== null;

            // Tags aus den Eingabefeldern extrahieren
            const tags = new Set();
            document.querySelectorAll('#tagContainer p').forEach(input => {
                tags.add(input.textContent);
            });

            // Priorität aus dem Dropdown-Menü extrahieren
            const selectedPriority = document.querySelector('#priorityDropdown').value;

            Model().updateNote(noteId, updatedTitle, updatedDescription, tags, selectedPriority);
        });


        document.querySelector('#archive').addEventListener('click', () => {
            // Die ID der ausgewählten Notiz abrufen
            let noteId = parseInt(document.querySelector('.list-group-item.active').getAttribute('data-index'));
            // Notiz archivieren
            Model().archiveNoteById(noteId);
        });


        document.querySelector('#rearchive').addEventListener('click',() => {
            // Die ID der ausgewählten Notiz abrufen
            let noteId = parseInt(document.querySelector('.list-group-item.active').getAttribute('data-index'));
            // Notiz rearchivieren (aus dem Archiv entfernen)
            Model().rearchiveNoteById(noteId);
        });



        // Überwachung von Tab-Wechseln und Steuerung der Detailansicht
        const tabLinks = document.querySelectorAll('.nav-link');

        tabLinks.forEach(tabLink => {
            tabLink.addEventListener('click', () => {
                // Detailansicht ausblenden, unabhängig vom aktiven Tab
                View().hideNoteDetails();
            });
        });



        document.querySelector('#delete').addEventListener('click', () => {
            View().openModal('#deleteNoteModal')
        });


        document.querySelector('#confirmNoteDelete').addEventListener('click', () => {
            let activeNoteId = document.querySelector('.list-group-item.active').getAttribute('data-index');
            Model().deleteNoteById(parseInt(activeNoteId));
            View().closeModal('#deleteNoteModal')
        });


        document.querySelector('#cancelNoteDelete').addEventListener('click', () => {
            View().closeModal('#deleteNoteModal')
        });


        document.querySelector('#addTag').addEventListener('click', () => {
            View().clearModalInputs('#tagModal')
            View().openModal('#tagModal')
            View().displayExistingTags('#tag-existingTags', 'tagModal');
        });


        // Event-Listener für das Speichern von Tags im Tag-Modal
        document.querySelector('#saveTagModal').addEventListener('click', () => {


            // Speichere die ausgewählten Tags nur für das aktuelle Modal
            let selectedTags = this.#saveTags('#newTag2');

            // Holt sich die aktive Notiz und aktualisiert die Tags
            const activeNoteId = parseInt(document.querySelector('.list-group-item.active').getAttribute('data-index'));
            const isArchivedNote = document.querySelector('.list-group-item.active').closest('#notelistArchiv') !== null;

            const activeNote = isArchivedNote ? Model().getNoteList(true).get(activeNoteId) : Model().getNoteList().get(activeNoteId);
            const updatedTags = new Set([...activeNote.tags, ...selectedTags]);

            // Aktualisiert die Tags der aktiven Notiz im Modell
            Model().updateNote(activeNoteId, activeNote.title, activeNote.description, updatedTags, activeNote.priority)

            View().closeModal('#tagModal');
        });


        document.querySelector('#closeTagModal').addEventListener('click', () => {
            View().closeModal('#tagModal');
        });


        document.querySelector('#tagsList').addEventListener('click', (event) => {
            if (event.target.parentElement && event.target.parentElement.id === 'editTag') {
                let tagText = event.target.parentElement.value;
                View().openModal('#tagEditModal');

                // Setzt den Wert des Eingabefelds auf den Tag-Text
                document.querySelector('#editedTag').value = tagText;
                document.querySelector('#editedTag').dataset.oldValue = tagText;
            } else if (event.target.parentElement && event.target.parentElement.id === 'deleteTag') {
                // Öffnet das Löschmodal für den Tag
                View().openModal('#deleteTagModal');

                // Speichert den zu löschenden Tag im Modal
                document.querySelector('#confirmTagDelete').dataset.tagName = event.target.parentElement.value;
            }
        });

        document.querySelector('#confirmTagDelete').addEventListener('click', (event) => {
            // Holt den zu löschenden Tag aus dem Dataset
            const tagName = event.target.dataset.tagName;

            // Löscht den Tag aus dem Modell
            Model().deleteTagByName(tagName);

            View().closeModal('#deleteTagModal');
        });


        document.querySelector('#cancelTagDelete').addEventListener('click', () => {
            View().closeModal('#deleteTagModal');
        });


        document.querySelector('#saveEditTagModal').addEventListener('click', () => {
            const oldTag = document.querySelector('#editedTag').getAttribute('data-old-value')
            const editedTag = document.querySelector('#editedTag').value;


            // Aufruf der updateTag-Methode im Model, um den bearbeiteten Tag zu speichern
            Model().updateTag(oldTag, editedTag);

            View().closeModal('#tagEditModal');

        });

        document.querySelector('#closeEditTagModal').addEventListener('click', () => {
            View().closeModal('#tagEditModal');
        });

        const lightDarkToggle = document.querySelector("#lightDarkToggle")
        lightDarkToggle.addEventListener("change", () => {
            document.body.classList.toggle("dark")
        })

        let selectedTagName; // Variable zum Speichern des ausgewählten Tag-Namens

        // Event-Listener für den Button #deleteTagFromNote außerhalb des Klick-Ereignisses für das Tag-Container-Element definieren
        document.querySelector('#deleteTagFromNote').addEventListener('click', () => {
            if (!selectedTagName) {
                console.error('Es wurde kein Tag ausgewählt.');
                return;
            }

            const activeNoteId = parseInt(document.querySelector('.list-group-item.active').getAttribute('data-index'));

            // Aufruf der Methode im Model, um den Tag aus der Notiz zu entfernen
            Model().removeTagFromNote(activeNoteId, selectedTagName);

            // Setzt die ausgewählte Tag-Variable zurück
            selectedTagName = null;
        });

        // Event-Listener für das Tag-Container-Element hinzufügen
        document.querySelector('#tagContainer').addEventListener('click', (event) => {
            if (event.target.tagName === 'P') {
                // Markiert den angeklickten Tag
                event.target.classList.add('activeTag')

                // Speichert den ausgewählten Tag-Namen
                selectedTagName = event.target.textContent;
            }
        });

        // Event-Listener für Klicks auf das Dokument hinzufügen
        document.addEventListener('click', (event) => {
            // Überprüft, ob das geklickte Element nicht im Tag-Container liegt
            if (!event.target.closest('#tagContainer')) {
                // Entferne die Klasse 'activeTag' von allen Tags im Container
                document.querySelectorAll('#tagContainer p').forEach(tag => {
                    tag.classList.remove('activeTag');
                });
                // Setzt die ausgewählte Tag-Variable zurück
                selectedTagName = null;
            }
        });
    }

    #saveTags(inputId) {
        let selectedTags = [];

        // Fügt ausgewählte Tags aus den Checkboxes hinzu
        const tagCheckboxes = document.querySelectorAll('input[name="existingTag"]');

        tagCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTags.push(checkbox.value);
                checkbox.checked = false;
            }
        });

        // Fügt den neuen Tag aus dem Input-Feld hinzu
        let tagInput = document.querySelector(`${inputId}`).value;
        let tags = tagInput.split(',').map(tag => tag.trim()); // Tags aufteilen und trimmen

        // Fügt die aufgeteilten Tags zu den ausgewählten Tags hinzu (ohne leere Tags)
        tags.forEach(tag => {
            if (tag !== '') {
                selectedTags.push(tag);
                Model().addTag(tag);
            }
        });

        return selectedTags;
    }
}

export function getInstance() {
    if(!controller) {
        controller = new Controller();
    }
    return controller;
}
