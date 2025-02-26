import Subject from "./subject.js";


class List {
    listElements = new Map();
    users = new Map();
    constructor(listTitle, completed) {
        this.listTitle = listTitle;
        this.id = ++ShoppingModel.listId;
        this.completed = completed;
    }
}

class Tag {
    constructor(tagTitle) {
        this.tagTitle = tagTitle;
        this.id = ++ShoppingModel.tagId;
    }
}

class ListElement{
    constructor(article, amount, status) {
        this.article = article;
        this.amount = amount;
        this.status = status;
        this.id = ++ShoppingModel.listElementId;
    }
}

class Article {
    constructor(articleName, measurement, articleTagId) {
        this.articleName = articleName;
        this.measurement = measurement;
        this.articleTagId = articleTagId;
        this.id = ++ShoppingModel.articleId;
    }
}

class User {
    constructor(firstname, lastname, email) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.id = ++ShoppingModel.userId;
    }
}


class ShoppingModel extends Subject {
    #listen;
    #tags;
    #articles;
    #currentOpenList;

    static listId = 0;
    static tagId = 0;
    static articleId  = 0;
    static listElementId = 0;
    static userId = 0;

    constructor() {
        super();
        this.#listen = new Map();
        this.#tags = new Map();
        this.#articles = new Map();
    }

    //LOAD DATA FROM JSON
    loadData(data){

        //LISTEN (LIST ELEMENTS UND USERS)
        this.#listen = new Map(data.lists.map(list => [
            list.id,
            {
                ...list,
                listElements: new Map(list.listElements.map(element => [element.id, element])),
                users: new Map(list.users.map(user => [user.id, user])) // Hinzufügen der Nutzer
            }
        ]));
        ShoppingModel.listId = this.#listen.size;

        this.#listen.forEach((list) => {
            list.listElements.forEach((listElement) => {
                ShoppingModel.listElementId ++;
            });
            list.users.forEach((user) => {
                ShoppingModel.userId++; // Falls es notwendig ist, auch die userId zu aktualisieren
            });
        });

        //TAGS
       this.#tags = new Map(data.tags.map(tag => [tag.id, tag]));
       ShoppingModel.tagId = this.#tags.size;

       //ARTIKEL
        for (let i = 0; i < data.lists.length; i++) {
            const list = data.lists[i];
            // Alle Listenelemente (Artikel) durchlaufen
            for (let j = 0; j < list.listElements.length; j++) {
                this.#articles.set(list.listElements[j].article.id,list.listElements[j].article);
                ShoppingModel.articleId ++;
            }
        }
       super.notify("loadData", data);
    }

    get listen() {
        return this.#listen;
    }

    //LISTE ERSTELLEN
    addList(listTitle){
        if(listTitle){
            let list = new List(listTitle, false);
            this.#listen.set(list.id, list);
            this.notify("addList", list);
        }
    }

    //LISTE LÖSCHEN
    deleteList(id){
        let list = this.#listen.get(Number(id));
        if(list){
            if(confirm(`Möchtest du die Liste ${list.listTitle} wirklich löschen?`)){
                this.#listen.delete(Number(id));
                super.notify("deleteList", list);
            }
        }

    }

    //LISTEN INHALT AKTUALSIEREN
    updateListContent(chosenListId){
        this.listen.forEach((list) => {
            if (list.id == chosenListId){
                super.notify("updateListContent",list)
            }
        });
    }

    //ARTIKEL ABHÄNGIG VOM TAG
    updateListArticles(chosenTagId){
        //eigene map wo die zugehörigen article drinnen sind
        let referencedArticles = new Map();

        this.#articles.forEach((article) => {
            if (article.articleTagId == chosenTagId) {
                // Füge den Artikel zur Map hinzu, wobei der Schlüssel zum Beispiel der Name des Artikels ist
                referencedArticles.set(article.id, article);
            }
        });
        super.notify("updateListArticles", referencedArticles);

    }

    get tags() {
        return this.#tags;
    }

    //TAG ERSTELLEN
    createTag(tagTitle){
        if(tagTitle){
            let tag = new Tag(tagTitle);
            this.#tags.set(tag.id, tag);
            console.info("createTag", tag);
            this.notify("createTag", tag);
        }
    }

    //TAG LÖSCHEN
    deleteTag(id){
        let tag = this.tags.get(Number(id));

        if(tag && !Array.from(this.#articles.values()).some(article => article.articleTagId == id)){
           if(confirm(`Möchtest du den Tag ${tag.tagTitle} wirklich löschen?`)){
               this.tags.delete(Number(id));
               super.notify("deleteTag", tag);
           }
        }
        else{
            alert(`Tag "${tag.tagTitle}" kann nicht gelöscht werden, da es noch in einem Artikel verwendet wird.`);
        }

    }

    get articles(){
        return this.#articles;
    }

    //ARTIKEL ERSTELLEN
    createArticle(articleName, measurement, articleTagId){
        if(articleName, measurement, articleTagId){
            let article = new Article(articleName, measurement, articleTagId);
            this.#articles.set(article.id, article);
            super.notify("createArticle", article);
        }
    }

    //ARTIKEL LÖSCHEN
    deleteArticle(id) {
        let article = this.#articles.get(Number(id));
        let articleFound = false;
        if(article) {
        this.#listen.forEach((list) =>{
            list.listElements.forEach((listElement)=>{
                if(listElement.article.id == id && list.completed == false){
                    articleFound = true;
                }
            });
        });
            if(articleFound == false){
                if(confirm(`Möchtest du den Artikel ${article.articleName} wirklich löschen?`)){
                    this.#articles.delete(Number(id));
                    super.notify("deleteArticle", article);
                }
            }
            else{
                alert("Artikel kann nicht gelöscht werden, weil er einer Liste zugewiesen ist!");
            }
        }
    }

    //LISTELEMENT ERSTELLEN UND HINZUFÜGEN
    addListElement(listId, articleId, listArticleAmount){
        if(listId, articleId, listArticleAmount){
            this.#articles.forEach((article) => {
                if (article.id == articleId){
                    let listElement = new ListElement(article, listArticleAmount, false);
                    this.#listen.forEach((list) => {
                        if(list.id == listId){
                            list.listElements.set(listElement.id, listElement);
                            super.notify("addListElement", listElement);
                        }
                    })
                }
            });
        }
    }

    //LISTE ÖFFNEN
    openList(id){
        if(id){
            this.#listen.forEach((list) =>{
                if(list.id == id){
                    this.#currentOpenList = list;
                    super.notify("openList", list);
                }
            })
        }
    }

    //LISTE BEARBEITEN
    editList(){
        super.notify("editList", this.#currentOpenList);
    }

    //STATUS AKTUALISIEREN
    updateStatus(listElementId){
        if(listElementId){
            this.#listen.forEach((list) =>{
                list.listElements.forEach((listElement) =>{
                    if(listElementId == listElement.id){
                        listElement.status = !listElement.status;
                        super.notify("openList", list);
                    }
                })
            });
        }
    }

    //LISTE ABSCHLIEßEN
    listCompleted(){
        let canBeCompleted = true;
        let completedList;
        this.#listen.forEach((list) => {
            if(list.id == this.#currentOpenList.id){
                list.listElements.forEach((listElement) =>{
                    if(listElement.status == false){
                        canBeCompleted = false;
                    }
                });
                if(canBeCompleted == true){
                    list.completed = true;
                    completedList = list;
                }
            }

        });

        if(canBeCompleted == true){
            super.notify("listCompleted", completedList);
            return true;
        }

    }

    //ARTIKEL AUS LISTE LÖSCHEN
    deleteArticleFromList(listElementId){
        if(listElementId){
            this.#listen.forEach((list) =>{
                list.listElements.forEach((listElement) =>{
                    if(listElementId == listElement.id){
                        if(confirm(`Möchtest du den Artikel ${listElement.article.articleName} aus der Liste wirklich löschen?`)){
                            list.listElements.delete(listElement.id);
                            super.notify("updateListContent", list);
                        }
                    }
                });
            });
        }
    }

    //LISTEN TITEL UPDATEN
    updateListTitle(newTitle){
       this.#currentOpenList.listTitle = newTitle;
       this.#listen.forEach((list) =>{
           if(list.id == this.#currentOpenList.id){
               list.listTitle = newTitle;
               super.notify("updateListTitle", this.#currentOpenList);
           }
       });
    }

    //TAG UPDATEN
    updateTag(tagId, newTagTitle){
        this.#tags.forEach((tag)=>{
            if(tagId == tag.id){
                tag.tagTitle = newTagTitle;
                super.notify("updateTag", tag);
            }
        })
    }

    //ARTIKEL UPDATEN
    updateArticle(articleId, newArticleMeasurement, newArticleTitle, newArticleTagId){
        let foundArticle = false;
        this.#listen.forEach((list) => {
            list.listElements.forEach((listElement) => {
                if(listElement.article.id == articleId){
                    alert("Dieser Artikel kann nicht geändert werden, da er einer Liste zugeordnet ist!");
                    foundArticle = true;
                }

            });

        })
    if(foundArticle == false){
            this.#articles.forEach((article) =>{
                if(article.id == articleId){
                    article.articleName = newArticleTitle;
                    article.measurement = newArticleMeasurement;
                    article.tagId = newArticleTagId;
                    super.notify("updateArticle", article);
                }
            });
        }
    }

}

export const ModelInstance = new ShoppingModel();
