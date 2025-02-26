class ShoppingView {
    #dom

    constructor() {
        this.#dom = {
            //Liste erstellen
            listTitle: document.querySelector("#listTitle"),
            addListBtn: document.querySelector('#addListBtn'),
            myLists: document.querySelector('#myLists'),
            listTags: document.querySelector('#listTags'),
            editList: document.querySelector("#editList"),
            listCompleted: document.querySelector("#listCompleted"),
            completedLists: document.querySelector("#completedLists"),
            associatedUser: document.querySelector("#associatedUsers"),

            //ARTIKEL ZUR LISTE HINZUFÜGEN
            listArticles: document.querySelector('#listArticles'),
            listArticleAmount: document.querySelector('#listArticleAmount'),
            addArticleToList: document.querySelector('#addArticleToList'),
            list: document.querySelector("#list"),
            contentPreview: document.querySelector("#contentPreview"),

            //Tag erstellen
            tagTitle: document.querySelector("#tagTitle"),
            createTag: document.querySelector('#createTag'),
            tagList: document.querySelector('#tagList'),

            //Artikel erstellen
            articleTags: document.querySelector("#articleTags"),
            articleName: document.querySelector("#articleName"),
            measurement: document.querySelector("#measurement"),
            createArticle: document.querySelector("#createArticle"),
            articleList: document.querySelector("#articleList"),

            //Einkaufsliste befüllen
            shoppingListTitle: document.querySelector("#shoppingListTitle"),
            shoppingListItems: document.querySelector("#shoppingListItems"),

            //modals
            tagModal: document.querySelector("#tagModal"),
            tagTitleModal: document.querySelector("#tagTitleModal"),

            articleModal: document.querySelector("#articleModal"),
            articleTagsModal: document.querySelector("#articleTagsModal"),
            articleTitleModal: document.querySelector("#articleTitleModal"),
            articleMeasurementModal: document.querySelector("#articleMeasurementModal"),

            tagsAndArticles: document.querySelector("#tagsAndArticles"),

            //Animation
            introOverlay: document.querySelector("#intro-overlay"),

            //Seiten laden
            views: document.querySelectorAll('.view')
        }
    }

    loadData(data){
        //LISTEN
        data.lists.forEach((list) => {
            this.addList(list);
        });

        //Tags
        data.tags.forEach((tag) => {
            this.createTag(tag);
            });

        for (let i = 0; i < data.lists.length; i++) {
            const list = data.lists[i];
            // Alle Listenelemente (Artikel) durchlaufen
            for (let j = 0; j < list.listElements.length; j++) {
                this.createArticle(list.listElements[j].article);
            }
        }

    }

    get dom() {
        return this.#dom;
    }


    //LISTE ERSTELLEN
    addList(list) {
        let myListHtml = this.#getHTML(list);
        let listDropdownHtml = this.#listDropdownHtml(list);
        this.#dom.myLists.insertAdjacentHTML("beforeend", myListHtml);
        this.#dom.list.insertAdjacentHTML("beforeend", listDropdownHtml);

    }

    //LISTE LÖSCHEN
    deleteList(list) {
        let elementToDelete = this.#dom.myLists.querySelector(`[data-taskid="${list.id}"]`);
        if (elementToDelete) {
            elementToDelete.remove();
        }
    }

    #getHTML(list) {
        return `
        <div class="newListElement" data-taskid="${list.id}" style="padding: 10px; border: 1px solid #CCC; margin-bottom: 5px;">
            <h5>${list.listTitle}</h5>
            <button type="button" class="btn btn-primary mt-1 " id="openList">Liste öffnen</button>
            <button type="button" class="btn btn-danger mt-1 ">Löschen</button>
        </div>
    `;
    }

    #listDropdownHtml(list) {
        return `
             <option id=${list.id}>${list.listTitle}</option>
        `;
    }

    //VORSCHAU
    addListElement(listElement) {
        let listElementHtml = this.#getHTMLListElement(listElement);
        this.#dom.contentPreview.insertAdjacentHTML("beforeend", listElementHtml)
    }

    #getHTMLListElement(listElement){
        return`
       <li class="d-flex justify-content-between" id="${listElement.id}">
           ${listElement.article.articleName}: ${listElement.amount} ${listElement.article.measurement}
           <button class="btn btn-danger btn-sm ml-auto mb-1">löschen</button>
        </li>
        `;
    }

    //VORSCHAU ANGEPASST AN LISTE
    updateListContent(list){
        this.#dom.contentPreview.innerHTML = "";
        list.listElements.forEach((listElement) => {
            let listElementHtml = this.#getHTMLListElement(listElement);
            this.#dom.contentPreview.insertAdjacentHTML("beforeend", listElementHtml)
        });
    }

    //LISTE ÖFFNEN
    openList(list) {
        this.#dom.shoppingListTitle.innerHTML = list.listTitle + `  <i class="bi bi-pencil"></i>`;
        list.listElements.forEach((listElement) => {
            let listItemHtml = this.#getHTMLListItem(listElement);
            this.#dom.shoppingListItems.insertAdjacentHTML("beforeend", listItemHtml);
        });
        this.#dom.associatedUser.innerHTML = "";
        list.users.forEach((user) => {
            this.#dom.associatedUser.insertAdjacentHTML("beforeend", this.#getHTMLUser(user));
        });

    }

    #getHTMLUser(user){
        return `
        <p id="${user.id}">${user.firstname} ${user.lastname}</p>
        `;
    }
    //LISTE ÖFFNEN INHALT
    #getHTMLListItem(listElement){
        if (listElement.status) {
            return `
        <p><input id="${listElement.id}" type="checkbox" checked> ${listElement.article.articleName}: ${listElement.amount}  ${listElement.article.measurement}</p>
        `;
        }else{
            return `
        <p><input id="${listElement.id}" type="checkbox"> ${listElement.article.articleName}: ${listElement.amount}  ${listElement.article.measurement}</p>
        `;
        }
    }

    //ABHÄNGIGKEIT ARTICLES ZU TAGS
    updateListArticles(referencedArticles) {
        referencedArticles.forEach((article) => {
            let articleHtml = this.#getHTMLArticleDropdown(article);
            this.#dom.listArticles.insertAdjacentHTML("beforeend", articleHtml);
        });
    }

    //TAG ERSTELLEN
    createTag(tag) {
        let tagHtml = this.#getHTMLTag(tag);
        let tagDropdown = this.#getHTMLTagDropdown(tag);
        this.#dom.tagList.insertAdjacentHTML("beforeend", tagHtml);
        this.#dom.articleTags.insertAdjacentHTML("beforeend", tagDropdown);
        this.#dom.listTags.insertAdjacentHTML("beforeend", tagDropdown);
        this.#dom.articleTagsModal.insertAdjacentHTML("beforeend", tagDropdown);
    }

    //TAG HTML GENERIEREN
    #getHTMLTag(tag) {
        return `
    <li class="list-group-item" id="${tag.id}">
        ${tag.tagTitle}
        <button class="btn btn-danger btn-sm float-end">Löschen</button>
        <button class="btn btn-warning btn-sm float-end me-3">Bearbeiten</button>
    </li>
    `;
    }

    //TAG DROPDOWN HTML GENERIEREN
    #getHTMLTagDropdown(tag) {
        return `
         <option id=${tag.id}>${tag.tagTitle}</option>
        `;
    }

    //TAG LÖSCHEN
    deleteTag(tag) {
        //Tags liste
        let elementToDelete = this.#dom.tagList.querySelector(`[id="${tag.id}"]`);
        if (elementToDelete) {
            elementToDelete.remove();
        }
        //Tag Dropdown
        let elementToDelete1 = this.#dom.listTags.querySelector(`[id="${tag.id}"]`);
        if (elementToDelete1) {
            elementToDelete1.remove();
        }
        //Tag Modal
        let elementToDelete2 = this.#dom.articleTagsModal.querySelector(`[id="${tag.id}"]`);
        if (elementToDelete2) {
            elementToDelete2.remove();
        }
    }

    //ARTIKEL ERSTELLEN
    createArticle(article) {
        let articleHtml = this.#getHTMLArticle(article);
        this.#dom.articleList.insertAdjacentHTML("beforeend", articleHtml);
    }

    //ARTIKEL HTML GENERIEREN
    #getHTMLArticle(article) {
        return `
        <li class="list-group-item" id="${article.id}">${article.articleName}
        <button class="btn btn-danger btn-sm float-end">Löschen</button>
        <button class="btn btn-warning btn-sm float-end me-3">Bearbeiten</button></li>                 
        `;
    }

    //ARTIKEL DROPDOWN HTML GENERIEREN
    #getHTMLArticleDropdown(article) {
        return `
        <option id=${article.id}>${article.articleName}</option>
        `;
    }

    //ARTIKEL LÖSCHEN
    deleteArticle(article) {
        let elementToDelete = this.#dom.articleList.querySelector(`[id="${article.id}"]`);
        if (elementToDelete) {
            elementToDelete.remove();
        }
    }

    //GEÖFFNETE LISTE
    editList(currentOpenList){
        this.#dom.list.selectedIndex = currentOpenList.id;
        this.updateListContent(currentOpenList);
    }

    //LISTE ABGESCHLOSSEN
    listCompleted(completedList){
        let completedListHtml = this.#getHTMLCompletedList(completedList);
        this.#dom.completedLists.insertAdjacentHTML("beforeend", completedListHtml);
        this.deleteList(completedList);
        for (let i = 1; i < this.#dom.list.options.length; i++) {
            if (this.#dom.list.options[i].id == completedList.id) {
                this.#dom.list.remove(i);
            }
        }
    }

    #getHTMLCompletedList(completedList){
        return`
        <li id="${completedList.id}" class="list-group-item" >${completedList.listTitle}</li>
        `;
    }

    updateListTitle(updatedList){
        //MY LISTS
        let elementToUpdate = this.#dom.myLists.querySelector(`[data-taskid="${updatedList.id}"] h5`);
        if(elementToUpdate){
            elementToUpdate.innerHTML = updatedList.listTitle;
        }
        //DROPDOWN
        let elementToUpdate1 = this.#dom.list.querySelector(`[id="${updatedList.id}"]`);
        if (elementToUpdate1){
            elementToUpdate1.innerHTML = updatedList.listTitle;
        }
    }

    updateTag(updatedTag){
        this.deleteTag(updatedTag);
        this.createTag(updatedTag);
        this.#dom.tagTitleModal.value = "";
    }
    updateArticle(updatedArticle){
        this.deleteArticle(updatedArticle);
        this.createArticle(updatedArticle);
        //frage ist ob das dropdown aktualisert werden muss
        this.#dom.articleTitleModal.value = "";
        this.#dom.articleMeasurementModal.value = "";
        this.#dom.articleTagsModal.selectedIndex = 0;
    }

}

export const viewInstance = new ShoppingView();

