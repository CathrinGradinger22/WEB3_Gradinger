import {viewInstance} from "./view.js";
import {ModelInstance} from "./model.js";

class ShoppingController {

    init() {

        async function loadData() {
            try {
                const response = await fetch('data.json'); // JSON-Datei laden
                const data = await response.json(); // JSON in ein JavaScript-Objekt umwandeln
                ModelInstance.loadData(data); // Die geladenen Daten an das Model übergeben
            } catch (error) {
                console.error('Fehler beim Laden der Daten:', error);
            }
        }

        // Daten laden und UI aktualisieren
        loadData();

        /*Animation Startbild*/
        document.addEventListener("DOMContentLoaded", function () {
            setTimeout(() => {
                dom.introOverlay.classList.add("fade-out");
                setTimeout(() => {
                    dom.introOverlay.style.display = "none";
                }, 1000); // Nach der Fade-Out-Animation ausblenden
            }, 2500); // Bild bleibt 2.5 Sekunden sichtbar
        });

        ModelInstance.subscribe("loadData", viewInstance, viewInstance.loadData);

            let dom = viewInstance.dom; //get the DOM elements

            //subscribe to the List
            ModelInstance.subscribe("addList", viewInstance, viewInstance.addList);
            ModelInstance.subscribe("deleteList", viewInstance, viewInstance.deleteList);
            ModelInstance.subscribe("updateListArticles", viewInstance, viewInstance.updateListArticles);
            ModelInstance.subscribe("addListElement", viewInstance, viewInstance.addListElement);
            ModelInstance.subscribe("updateListContent", viewInstance,viewInstance.updateListContent);
            ModelInstance.subscribe("openList", viewInstance, viewInstance.openList);
            ModelInstance.subscribe("editList", viewInstance, viewInstance.editList);
            ModelInstance.subscribe("listCompleted", viewInstance, viewInstance.listCompleted);
            ModelInstance.subscribe("updateListTitle", viewInstance, viewInstance.updateListTitle);
            ModelInstance.subscribe("updateTag", viewInstance, viewInstance.updateTag);
            ModelInstance.subscribe("updateArticle", viewInstance,viewInstance.updateArticle);

            //Subscribe to Tag
            ModelInstance.subscribe("createTag", viewInstance, viewInstance.createTag);
            ModelInstance.subscribe("deleteTag", viewInstance, viewInstance.deleteTag);

            //Subscribe to Article
            ModelInstance.subscribe("createArticle", viewInstance, viewInstance.createArticle);
            ModelInstance.subscribe("deleteArticle", viewInstance, viewInstance.deleteArticle);

            //DOM Event handlers

            //LISTE ERSTELLEN
            dom.addListBtn.onclick = (ev) => {
                ev.preventDefault();
                let listTitle = dom.listTitle.value;
                if (listTitle) {
                    ModelInstance.addList(listTitle);
                    dom.listTitle.value = "";
                } else {
                    alert("Bitte gebe der Liste einen Titel");
                }
            }

            //LISTE LÖSCHEN ODER ÖFFNEN
            dom.myLists.onclick = (ev) => {
                ev.preventDefault();

                //LISTE LÖSCHEN
                if (ev.target.classList.contains('btn-danger')) {
                    let id = ev.target.closest('div').dataset.taskid;
                    dom.contentPreview.innerHTML = "";
                    for (let i = 1; i < dom.list.options.length; i++) {
                        if (dom.list.options[i].id == id) {
                            dom.list.remove(i);
                        }
                    }
                    ModelInstance.deleteList(id);
                }

                //LISTE ÖFFNEN
                else if(ev.target.classList.contains('btn-primary')) {
                        let id = ev.target.closest('div').dataset.taskid;
                        dom.shoppingListItems.innerHTML="";
                        dom.contentPreview.innerHTML="";
                        dom.list.options[0].selected = true;
                        ModelInstance.openList(id);
                        loadView('einkaufsliste');
                }
            }

            //LISTE -> ARTIKEL ABHÄNGIG VOM TAG
            dom.listTags.onchange = (ev) => {
                ev.preventDefault();
                let chosenTagId = dom.listTags.options[dom.listTags.selectedIndex].id;
                while (dom.listArticles.options.length > 1) {
                    dom.listArticles.remove(1);
                }
                ModelInstance.updateListArticles(chosenTagId);
            }

            //ARTIKEL ZUR LISTE HINZUFÜGEN
            dom.addArticleToList.onclick = (ev) => {
                ev.preventDefault();
                let listId = dom.list.options[dom.list.selectedIndex].id;
                let articleId = dom.listArticles.options[dom.listArticles.selectedIndex].id;
                let listArticleAmount = dom.listArticleAmount.value;
                if(listId && articleId && listArticleAmount){
                    ModelInstance.addListElement(listId, articleId, listArticleAmount);
                }else {
                    alert("Bitte wähle eine Liste einen Tag einen Artikel und eine Menge aus!");
                }
            }

            //LISTEN INHALT PASSEND ZUR AUSWAHL ANZEIGEN
            dom.list.onchange = (ev) => {
                ev.preventDefault();
                let chosenListId = dom.list.options[dom.list.selectedIndex].id;
                //dom.contentPreview.innerHTML = "";
                ModelInstance.updateListContent(chosenListId);
            }

            //TAG ERSTELLEN
            dom.createTag.onclick = (ev) => {
                ev.preventDefault();
                let tagTitle = dom.tagTitle.value;
                if(tagTitle){
                    ModelInstance.createTag(tagTitle);
                    dom.tagTitle.value= "";
                    //Accordeon aufklappen
                }else{
                    alert("Bitte den Titel des Tags eingeben!");
                }
            }

            //TAG BEARBEITEN & LÖSCHEN
            dom.tagList.onclick = (ev) => {
                //Wenn auf den löschen Button geklickt wird
                ev.preventDefault();
                let tagId = ev.target.closest('li').id;
                if (ev.target.classList.contains('btn-danger')) {
                    ModelInstance.deleteTag(tagId);
                }
                //TAGS BEARBEITEN
                else if(ev.target.classList.contains('btn-warning')) {
                    const modal = new bootstrap.Modal(dom.tagModal);
                    modal.show();

                    const saveButton = dom.tagModal.querySelector('#saveTagModal');

                    // Event-Listener für den "Okay"-Button setzen
                    saveButton.onclick = function () {
                        const newTagTitle = dom.tagTitleModal.value;
                        if(newTagTitle) {
                            ModelInstance.updateTag(tagId, newTagTitle);
                            modal.hide();
                        }
                        else{
                            alert("Bitte gebe einen neuen Titel ein!");
                        }
                    };
                }
            }

            //ARTIKEL ERSTELLEN
            dom.createArticle.onclick = (ev) => {
                ev.preventDefault();
                let articleName = dom.articleName.value;
                let measurement = dom.measurement.value;
                let articleTagId = dom.articleTags.options[dom.articleTags.selectedIndex].id;
                if(articleName && measurement && articleTagId){
                    ModelInstance.createArticle(articleName, measurement, articleTagId);
                    dom.articleName.value = "";
                    dom.measurement.value = "";
                }else{
                    alert("Bitte fülle alle Felder aus um einen Artikel zu erstellen!");
                }
            }

            //ARTIKEL BEARBEITEN & LÖSCHEN
            dom.articleList.onclick = (ev) => {
                ev.preventDefault();
                let articleId = ev.target.closest('li').id;
                //ARTIKEL LÖSCHEN
                if (ev.target.classList.contains('btn-danger')){
                    ModelInstance.deleteArticle(articleId);
                }
                //ARTIKEL BEARBEITEN
                else if(ev.target.classList.contains('btn-warning')) {
                    const modal = new bootstrap.Modal(dom.articleModal);
                    modal.show();

                    const saveButton = dom.articleModal.querySelector('#saveArticleModal');

                    // Event-Listener für den "Okay"-Button setzen
                    saveButton.onclick = function () {
                        const newArticleTagId = dom.articleTagsModal.options[dom.articleTagsModal.selectedIndex].id;
                        const newArticleTitle = dom.articleTitleModal.value;
                        const newArticleMeasurement = dom.articleMeasurementModal.value;
                        if(newArticleTagId && newArticleTitle && newArticleMeasurement){
                            ModelInstance.updateArticle(articleId, newArticleMeasurement, newArticleTitle, newArticleTagId); // Funktion mit neuem Wert aufrufen
                            modal.hide(); // Modal schließen
                        }
                        else{
                            alert("Bitte alle Felder ausfüllen!");
                        }
                    };
                }
            }

            //LISTE BEARBEITEN
            dom.editList.onclick = (ev) =>{
                ev.preventDefault();
                ModelInstance.editList();
                loadView('listen');
            }

            //ARTIKEL STATUS
            dom.shoppingListItems.onclick = (ev) => {
                ev.preventDefault();
                if (ev.target.type == 'checkbox') {
                    let listElementId = ev.target.closest('input').id;
                    dom.shoppingListItems.innerHTML = "";
                    ModelInstance.updateStatus(listElementId);
                }
            }

            //LISTE ABSCHLIEßEN
            dom.listCompleted.onclick = (ev) => {
                ev.preventDefault();
                if(ModelInstance.listCompleted()){
                    loadView('abgeschlossen');
                }
        }

            //ARTIKEL AUS LISTE LÖSCHEN
            dom.contentPreview.onclick = (ev) => {
                ev.preventDefault();
                let listElementId = ev.target.closest('li').id;
                ModelInstance.deleteArticleFromList(listElementId);

            }

            //LiSTEN TITEL BEARBEITEN
            dom.shoppingListTitle.onblur = (ev) => {
                ev.preventDefault();
                ModelInstance.updateListTitle(dom.shoppingListTitle.innerText);
            }

            //Zurücksetzen der Hauptseite beim wechsel ZUR "SEITE" Tags & Artikel
            dom.tagsAndArticles.onclick = (ev) => {
                ev.preventDefault();
                loadView("artikel");
                dom.list.selectedIndex = 0;
                dom.listArticles.selectedIndex = 0;
                dom.listTags.selectedIndex = 0;
                dom.listArticleAmount.value = "";
                dom.contentPreview.innerHTML = "";
            }

    }
}
//singleton pattern
export const controllerInstance = new ShoppingController();
