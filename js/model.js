import Subject from './subject.js';
import Note from './note.js';

let model;

class Model extends Subject {
    #noteList;
    #archivedNoteList
    #tagList

    constructor() {
        super();
        this.#noteList = new Map();
        this.#archivedNoteList = new Map();
        this.#tagList = new Set(); // Set, um Duplikate zu vermeiden
        this.#loadFromJSON();
    }

    getNoteList(archived = false) {
        return archived ? this.#archivedNoteList : this.#noteList;
    }

    getTagList() {
        return this.#tagList;
    }

    getNoteById(noteId) {
        if (this.#noteList.has(noteId)) {
            return this.#noteList.get(noteId);
        } else if (this.#archivedNoteList.has(noteId)) {
            return this.#archivedNoteList.get(noteId);
        } else {
            console.error(`Note with ID '${noteId}' not found`);
            return null;
        }
    }

    addNote(title, description, tags, priority) {
        const newNote = new Note(title, description, tags, priority);
        this.#noteList.set(newNote.id, newNote);
        console.info("addNote", newNote);
        this.notify('addNote', newNote);
    }

    updateNote(id, title, description, tags, priority) {
        let targetList = this.#noteList;
        if (this.#noteList.has(id)) {
            targetList = this.#noteList;
        } else if (this.#archivedNoteList.has(id)) {
            targetList = this.#archivedNoteList;
        } else {
            console.error('Notiz mit der ID nicht gefunden:', id);
            return;
        }

        const existingNote = targetList.get(id);

        existingNote.title = title;
        existingNote.description = description;
        existingNote.tags = tags; // Aktualisierung der Tags
        existingNote.priority = priority;

        targetList.set(id, existingNote);

        const eventType = targetList === this.#noteList ? 'updateNote' : 'updateArchivedNote';
        console.info(eventType, existingNote);
        this.notify(eventType, existingNote);
    }

    updateTag(oldTag, newTag) {
        // Aktualisiert den Tag im Tag-Set
        if (this.#tagList.has(oldTag)) {
            this.#tagList.delete(oldTag);
            this.#tagList.add(newTag);

            // Aktualisiert alle Notizen, die das alte Tag enthalten
            this.#noteList.forEach(note => {
                if (note.tags.has(oldTag)) {
                    // Entfernt das alte Tag aus der Tag-Liste der Note
                    note.tags.delete(oldTag);
                    // Fügt das neue Tag hinzu
                    note.tags.add(newTag);
                }
            });

            // Überprüft und aktualisiert der archivierten Notizliste
            this.#archivedNoteList.forEach(note => {
                if (note.tags.has(oldTag)) {
                    // Entfernt das alte Tag aus der Tag-Liste der Note
                    note.tags.delete(oldTag);
                    // Fügt das neue Tag hinzu
                    note.tags.add(newTag);
                }
            });

            console.info("updateTag", { oldTag, newTag });
            this.notify('updateTag', { oldTag, newTag });
        } else {
            console.error('Tag nicht gefunden:', oldTag);
        }
    }

    archiveNoteById(id) {
        if (this.#noteList.has(id)) {
            const archivedNote = this.#noteList.get(id);
            this.#archivedNoteList.set(id, archivedNote);
            this.#noteList.delete(id);
            console.info("archiveNote", archivedNote);
            this.notify('archiveNote', archivedNote);
        } else {
            alert('Archivierte Notizen können nicht nochmal archiviert werden');
        }
    }

    rearchiveNoteById(id) {
        if (this.#archivedNoteList.has(id)) {
            const rearchivedNote = this.#archivedNoteList.get(id);
            this.#noteList.set(id, rearchivedNote); // Die Notiz wird wieder in die Hauptliste eingefügt
            this.#archivedNoteList.delete(id); // Die Notiz wird aus dem Archiv entfernt
            console.info("rearchiveNote", rearchivedNote);
            this.notify('rearchiveNote', rearchivedNote);
        } else {
            alert('Normale Notizen können nicht rückarchiviert werden');
        }
    }

    addTag(tag) {
        this.#tagList.add(tag);
        console.info("addTag", tag);
        this.notify('addTag', tag);
    }

    deleteNoteById(noteId) {
        let targetList;
        if (this.#noteList.has(noteId)) {
            targetList = this.#noteList;
        } else if (this.#archivedNoteList.has(noteId)) {
            targetList = this.#archivedNoteList;
        } else {
            console.error('Notiz mit der ID nicht gefunden:', noteId);
            return;
        }

        const deletedNote = targetList.get(noteId);
        targetList.delete(noteId);
        console.info('deleteNote', deletedNote);
        this.notify('deleteNote', noteId);
    }

    deleteTagByName(tagName) {
        if (this.#tagList.has(tagName)) {
            // Überprüft, ob der Tag einer Notiz zugeordnet ist
            const tagInNotes = [...this.#noteList.values(), ...this.#archivedNoteList.values()].some(note => note.tags.has(tagName));
            if (!tagInNotes) {
                this.#tagList.delete(tagName);
                console.info('deleteTag', tagName);
                this.notify('deleteTag', tagName);
            } else {
                alert('Der Tag kann nicht gelöscht werden, da er noch einer Notiz zugeordnet ist.');
            }
        } else {
            console.error('Tag nicht gefunden:', tagName);
        }
    }

    removeTagFromNote(noteId, tagName) {
        // Überprüfen, ob die Notiz in der archivierten oder nicht archivierten Liste ist
        const noteList = this.#archivedNoteList.has(noteId) ? this.#archivedNoteList : this.#noteList;

        if (noteList.has(noteId)) {
            const note = noteList.get(noteId);

            // Überprüft, ob der Tag in der Notiz vorhanden ist
            if (note.tags.has(tagName)) {
                // Überprüft, ob es mehr als einen Tag in der Notiz gibt
                if (note.tags.size === 1) {
                    alert(`Die Notiz mit dem Titel '${note.title}' muss mindestens einen Tag enthalten und kann daher nicht gelöscht werden.`);
                    return;
                }

                note.tags.delete(tagName);
                console.info("removeTagFromNote", { noteId, tagName });
                this.notify("removeTagFromNote", { noteId, tagName });
            } else {
                console.error(`Tag '${tagName}' not found in note with ID '${noteId}'`);
            }
        } else {
            console.error(`Note with ID '${noteId}' not found`);
        }
    }

    filterNotesByPriority(list) {
        const filteredNotes = [];

        // Durchsucht die Hauptnotizliste nach Notizen und fügt sie zu den gefilterten Notizen hinzu
        list.forEach(note => {
            filteredNotes.push(note);
        });

        // Sortiert die Notizen nach Priorität: Hoch, Normal, Niedrig
        filteredNotes.sort((a, b) => {
            const priorityOrder = { 'Hoch': 3, 'Normal': 2, 'Niedrig': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        return filteredNotes;
    }

    #loadFromJSON() {
        fetch('json/notes.json')
            .then(response => response.json())
            .then(data => {
                const notes = data.notes;
                notes.forEach(note => {
                    this.addNote(note.title, note.description, new Set(note.tags), note.priority);
                    note.tags.forEach(tag => {
                        this.addTag(tag);
                    });
                });
            })
            .catch(error => {
                console.error('Fehler beim Laden der Notizen aus der JSON-Datei:', error);
            });
    }

}

export function getInstance() {
    if (!model) {
        model = new Model();
    }
    return model;
}
