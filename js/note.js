export default class Note {
    #id
    #title;
    #description;
    #tags;
    #priority;


    constructor(title, description, tags, priority) {
        this.#id = ++Note.id;
        this.#title = title;
        this.#description = description;
        this.#tags = new Set(tags);
        this.#priority = priority;
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    set title(newTitle) {
        this.#title = newTitle;
    }


    get description() {
        return this.#description;
    }

    set description(newDescription) {
        this.#description = newDescription
    }

    get tags() {
        return this.#tags;
    }

    set tags(newTags) {
        this.#tags = new Set(newTags);
    }

    get priority() {
        return this.#priority;
    }

    set priority(newPriority) {
        this.#priority = newPriority;
    }


}

Note.id = 0;