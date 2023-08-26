// Définition de l'URL de l'API
const apiUrl = "http://localhost:5678/api/";

// Tableau pour stocker les travaux
let works = [];

// Récupération du token depuis le localStorage
let token = localStorage.getItem("token");

// Afficher le token dans la console 
console.log(token);

// à récuperer pour vider le form d'ajout
const form = document.querySelector('.formulaire-ajout');

// Fonction pour charger les travaux depuis l'API
function loadWorks() {
  // Utilisation de l'API pour récupérer les travaux
  fetch(apiUrl + "works")
    .then(response => response.json()) // Convertir la réponse en JSON
    .then(data => {
      works = data; // Stockage des travaux dans la variable 'works'
      generateGallery(works); // Générer la galerie avec les travaux récupérés
      loadWorksInModal(works); // Charger les miniatures des travaux dans la modale
    })
    .catch(error => {
      console.error("Une erreur s'est produite lors de la récupération des travaux :", error);
    });
}

// Fonction pour charger les catégories depuis l'API
function loadCategories() {
  fetch(apiUrl + "categories")
    .then(response => response.json()) // Convertir la réponse en JSON
    .then(data => {
      generateFilterButtons(data); // Générer les boutons de filtre avec les catégories
      addFilterButtonListeners(); // Ajouter des écouteurs d'événements aux boutons de filtre
    })
    .catch(error => {
      console.error("Une erreur s'est produite lors de la récupération des catégories :", error);
    });
}

// Fonction pour générer la galerie de travaux
function generateGallery(works) {
  const galleryContainer = document.querySelector(".gallery");
  galleryContainer.innerHTML = ""; // Réinitialisation du contenu

  works.forEach(work => {
    // Création d'éléments HTML pour chaque travail
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    // Attribution des valeurs aux éléments
    img.src = work.imageUrl;
    img.alt = work.title;
    figcaption.textContent = work.title;

    // Ajout des éléments à la galerie
    figure.appendChild(img);
    figure.appendChild(figcaption);
    galleryContainer.appendChild(figure);
  });
}

// Fonction pour créer un bouton de filtre
function createFilterButton(name, id, isActive = false) {
  const button = document.createElement("button");
  button.classList.add("btn");
  button.textContent = name;
  button.dataset.categoryId = id;

  // Ajouter la classe 'active' au bouton si nécessaire
  if (isActive) {
    button.classList.add("active");
  }

  return button;
}

// Fonction pour générer les boutons de filtre
function generateFilterButtons(categories) {
  const filterButtonsContainer = document.querySelector(".filter-buttons");
  filterButtonsContainer.innerHTML = ""; // Réinitialisation des boutons existants

  // Création du bouton 'Tous' en tant que bouton actif par défaut
  const allButton = createFilterButton("Tous", "all", true);
  filterButtonsContainer.appendChild(allButton);

  // Générer un bouton pour chaque catégorie
  categories.forEach(category => {
    const { id, name } = category;
    const button = createFilterButton(name, id);
    filterButtonsContainer.appendChild(button);
  });
}

// Fonction pour ajouter des écouteurs d'événements aux boutons de filtre
function addFilterButtonListeners() {
  const filterButtons = document.querySelectorAll(".btn");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const categoryId = button.dataset.categoryId;

      // Filtrer les travaux en fonction de la catégorie sélectionnée
      filterWorks(categoryId);

      // Gérer les classes actives pour les boutons de filtre
      filterButtons.forEach(btn => {
        btn.classList.remove("active");
      });
      button.classList.add("active");
    });
  });
}

// Fonction pour filtrer les travaux en fonction de la catégorie sélectionnée
function filterWorks(categoryId) {
  // Filtrer les travaux selon la catégorie sélectionnée ou afficher tous les travaux
  const filteredWorks = categoryId === "all" ? works : works.filter(work => work.category.id === parseInt(categoryId));
  generateGallery(filteredWorks); // Générer la galerie avec les travaux filtrés
}

// Charger initialement les travaux et les catégories
loadWorks();
loadCategories();


// Vérification de la connexion et mise à jour de l'affichage
function checkLoggedInUser() {
  // Sélection des éléments HTML nécessaires
  const loginBtn = document.getElementById("loginBtn");
  const editModeBanner = document.getElementById("editModeBanner");
  const editIcon = document.getElementById("editIcon");
  const filterButtonsContainer = document.querySelector(".filter-buttons");
  const introductionEditLink = document.querySelector('#introduction p');
  const projectsEditIcon = document.querySelector('.h2 i');

  if (token) {
    // Si un token est présent (l'utilisateur est connecté)
    loginBtn.textContent = "logout"; // Mettre le texte du bouton à "logout"
    loginBtn.addEventListener("click", function () {
      // Ajout d'un écouteur d'événement au bouton de déconnexion
      localStorage.removeItem("token"); // Supprimer le token du localStorage
      window.location.reload(); // Recharger la page pour effectuer la déconnexion
    });

    // Affichage de la bannière en mode édition
    editModeBanner.classList.remove("hidden");

    // Ajout d'un écouteur d'événement pour l'icône d'édition
    const editIcons = document.querySelectorAll('.far.fa-pen-to-square.open');
    editIcons.forEach(icon => {
      icon.addEventListener('click', ouvrirModale1);
    });

    // Masquage des filtres (car l'utilisateur est en mode édition)
    filterButtonsContainer.classList.add("hidden");

    // Afficher le lien de modification dans la section "introduction"
    introductionEditLink.style.display = 'block';

    // Afficher l'icône d'édition dans la ligne "Mes Projets"
    projectsEditIcon.style.display = 'inline';
  } else {
    // Si aucun token n'est présent (l'utilisateur n'est pas connecté)
    editModeBanner.classList.add("hidden"); // Masquer la bannière en mode édition
    editIcon.classList.add("hidden"); // Masquer l'icône d'édition
    filterButtonsContainer.classList.remove("hidden"); // Afficher les filtres

    // Cacher le lien de modification dans la section "introduction"
    introductionEditLink.style.display = 'none';

    // Cacher l'icône d'édition dans la ligne "Mes Projets"
    projectsEditIcon.style.display = 'none';
  }
}

// Appel de la fonction de vérification de la connexion pour mettre à jour l'affichage
checkLoggedInUser();

/////    MODALES   /////

//styles divers

// Sélection de l'élément de superposition des modales
const overlay = document.querySelector(".modales");

// Fonction pour supprimer un travail
function supprimerTravail(workId) {
  const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce travail ?");

  if (confirmDelete) {
    fetch(apiUrl + "works/" + workId, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        // Vérification de la réponse de l'API pour voir si la suppression a réussi (HTTP 2xx)
        // Sinon, lève une erreur avec le message "Non autorisé : vérifiez votre jeton d'authentification."
        if (!response.ok) {
          throw new Error("Non autorisé : vérifiez votre jeton d'authentification.");
        }
      })
      .then(() => {
        console.log("Travail supprimé avec succès");

        // Mettre à jour la liste des travaux après la suppression
        loadWorks();
        removeWorkInModal(workId); // Retirer le travail de la modale
      })
      .catch((error) => {
        const errorDiv = document.querySelector(".error-message");
        errorDiv.innerText = error.message; // Afficher le message d'erreur en cas d'échec
      });
  }
}

// Fonction pour supprimer visuellement un travail de la modale
function removeWorkInModal(workId) {
  const workToRemove = document.getElementById("work-miniature-" + workId);
  workToRemove.remove(); // Suppression de l'élément visuel du travail
}

// Fonction pour charger les miniatures des travaux dans la modale
function loadWorksInModal(works) {
  const miniaturesPerRow = 5; // Nombre de miniatures par ligne
  let rowDiv = null;
  let rowIndex = 0;
  const modaleContent = document.querySelector("#contenue-modale1 .affichage-miniature");
  modaleContent.innerHTML = "";

  // Parcours de chaque travail pour créer les miniatures correspondantes
  works.forEach((work, index) => {
    if (index % miniaturesPerRow === 0) {
      // Création d'une nouvelle ligne pour le tableau de miniatures
      rowDiv = document.createElement("div");
      rowDiv.classList.add("miniature-row");
      rowDiv.style.marginBottom = "20px"; // Espace de 20px entre les lignes
      modaleContent.appendChild(rowDiv);
      rowIndex = 0; // Réinitialisation de l'index de la rangée
    }

    const figure = document.createElement("figure");
    figure.setAttribute("id", "work-miniature-" + work.id);
    const imgContainer = document.createElement("div"); // Conteneur pour l'image et l'icône
    imgContainer.classList.add("miniature-container");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    img.classList.add("miniature");
    img.style.width = "70px"; // Largeur de l'image
    img.style.height = "90px"; // Hauteur de l'image
    img.style.marginRight = "5px"; // Espace entre les colonnes

    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-trash-can", "delete-icon");

    // Ajout d'un écouteur d'événement au bouton de suppression
    deleteIcon.addEventListener("click", () => {
      supprimerTravail(work.id); // Appel de la fonction pour supprimer le travail
    });

    // Ajout de l'image et de l'icône au conteneur
    imgContainer.appendChild(img);
    imgContainer.appendChild(deleteIcon);
    figure.appendChild(imgContainer);
    rowDiv.appendChild(figure);

    rowIndex++;
  });
}

//Ouvertures, fermetures et navigation entre les modales

// Fonction pour ouvrir la première modale (pour gérer les travaux)
function ouvrirModale1() {
  const modale1 = document.getElementById("modal1");
  modale1.style.display = "block";
  modale1.removeAttribute("aria-hidden");
  modale1.setAttribute("aria-modal", true);

  // Ajout de la classe "modal-open" au <body> pour mettre en avant la modale
  document.body.classList.add("modal-open");

  // Récupération du conteneur des miniatures de la galerie
  const galleryContainer = document.querySelector(".gallery");

  // Récupération du conteneur de la modale pour afficher les miniatures
  const modaleContent = document.querySelector("#contenue-modale1 .affichage-miniature");

  // Suppression des miniatures existantes dans la modale (s'il y en a)
  modaleContent.innerHTML = "";
  loadWorksInModal(works); // Chargement des miniatures des travaux dans la modale

  // Ajout d'un écouteur d'événement au bouton de fermeture de la modale 1
  const fermerModaleBtn = document.querySelector("#fermer-modale1");
  fermerModaleBtn.addEventListener("click", fermerModale1);
}

// Fonction pour fermer la modale 1
function fermerModale1() {
  const modale1 = document.getElementById("modal1");
  modale1.style.display = "none";
  modale1.removeAttribute("aria-hidden");
  modale1.setAttribute("aria-modal", true);

  // Suppression de la classe "modal-open" du <body> pour rétablir le style d'origine
  document.body.classList.remove("modal-open");
}

// Fonction pour ouvrir la modale 2
function ouvrirModale2() {
  document.getElementById("modale2").style.display = "flex";
  document.body.classList.add("modal-open"); // Ajout de la classe pour empêcher le défilement de la page
}

// Ecouteur d'évènement ouverture modale 2 ajout photo
document.getElementById("validation").addEventListener("click", ouvrirModale2);

// Écouteur d'événement au bouton "retour"
document.getElementById("retour").addEventListener("click", ramenerModale1AuPremierPlan);

// Fonction pour ramener la modale 1 au premier plan
function ramenerModale1AuPremierPlan() {
  const modale1 = document.getElementById("modal1");
  const modale2 = document.getElementById("modale2");
  modale1.style.display = "block";
  modale2.style.display = "none";
  modale1.removeAttribute("aria-hidden");
  modale1.setAttribute("aria-modal", true);
  modale2.removeAttribute("aria-hidden");
  modale2.setAttribute("aria-modal", false);

  // Écouteur d'événement au bouton "fermer-modale2"
  document.getElementById("fermer-modale2").addEventListener("click", fermerModale2);
}

// Écouteur d'événement au bouton de fermeture de la modale 2
var iconeFermerModale2 = document.getElementById('fermer-modale2');
if (iconeFermerModale2) {
  iconeFermerModale2.addEventListener('click', function () {
    fermerModale2();
  });
}
// Fonction pour fermer la modale 2
function fermerModale2() {
  const modale2 = document.getElementById('modale2');
  if (modale2) {
    // Masquer la modale 2
    modale2.style.display = "none";
    // Rétablir les attributs ARIA pour la modale 2
    modale2.removeAttribute("aria-modal");
    modale2.setAttribute("aria-hidden", true);
    // Supprimer la classe "modal-open" du <body> pour rétablir le défilement de la page
    document.body.classList.remove("modal-open");

    // Fermer également la modale 1 (si ouverte)
    fermerModale1();

    const errorMessage = document.getElementById("modal2ErrorMessage");
    if (errorMessage) {
      errorMessage.textContent = "";
    }
  }
}

// Associer la fonction de fermeture à l'icône "fermer" de la modale 2
var iconeFermerModale2 = document.getElementsByClassName('fermer-modale2')[0];

if (iconeFermerModale2) {
  iconeFermerModale2.addEventListener('click', function () {
    // Réinitialiser le formulaire en vidant les champs
    var formulaireAjoutTravail = document.getElementsByClassName('formulaire-ajout')[0];
    if (formulaireAjoutTravail) {
      formulaireAjoutTravail.reset();
    }

    // Réinitialiser les éléments visuels
    resetVisualElements();

    // Effacer le message d'erreur
    const errorMessage = document.getElementById("modal2ErrorMessage");
    if (errorMessage) {
      errorMessage.textContent = "";
    }

    // Fermer la modale 2
    fermerModale2();
  });
}

// Réinitializer le formulaire quand on ferme la modale

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('fermer-modale2').addEventListener('click', function () {
    // Réinitialisez le formulaire
    document.querySelector('.formulaire-ajout').reset();

    // Supprimez la prévisualisation de l'image, si elle existe
    document.getElementById('image-prev').innerHTML = "";
    document.getElementById('icone-image').style.display = "block";
    resetVisualElements();
  });
});

function resetVisualElements() {
  // Réinitialisation des éléments de prévisualisation d'image
  const sectionPrev = document.getElementById("image-prev");
  sectionPrev.innerHTML = "";
  document.getElementById('icone-image').style.display = "block";
  document.getElementById('bouton-ajouter-photo').style.display = "block";
  document.querySelector(".format-img").style.display = "block";

  // Remettre le bouton "Valider" à sa couleur initiale
  valider.classList.remove("bouton-validation-valide");
}


////     AJOUTER UN TRAVAIL     ////

// Prévisualisation de l'image sélectionnée
const valider = document.getElementById("valider-modale2");
const prevImage = document.createElement("img");
const iconeImage = document.getElementById("icone-image");

// Fonction pour la prévisualisation de l'image sélectionnée
function previewPicture() {
  const sectionPrev = document.getElementById("image-prev");
  const inputImage = document.getElementById("selectioner");

  inputImage.addEventListener("change", (e) => {
    sectionPrev.innerHTML = "";
    iconeImage.style.display = "none"; // Masquer l'icône d'ajout d'image
    document.getElementById("bouton-ajouter-photo").style.display = "none"; // Masquer le bouton d'ajout de photo
    document.querySelector(".format-img").style.display = "none"; // Masquer le paragraphe avec les instructions


    prevImage.classList.add("imagePrevisualise");
    const selectionFichier = e.target.files[0]; // Accéder au premier élément du FileList

    const urlObjet = URL.createObjectURL(selectionFichier);

    // Création d'une nouvelle image pour obtenir les dimensions d'origine
    const tempImage = new Image();
    tempImage.src = urlObjet;
    tempImage.onload = () => {
      // Calcul de la nouvelle taille de l'image en maintenant le ratio d'aspect
      let newWidth, newHeight;
      const targetWidth = 129;
      const targetHeight = 185;

      const widthRatio = tempImage.width / targetWidth;
      const heightRatio = tempImage.height / targetHeight;

      // Calcul des dimensions en maintenant le ratio d'aspect
      if (widthRatio > heightRatio) {
        newWidth = targetWidth;
        newHeight = tempImage.height / widthRatio;
      } else {
        newHeight = targetHeight;
        newWidth = tempImage.width / heightRatio;
      }

      prevImage.src = urlObjet;
      sectionPrev.appendChild(prevImage);
    };
  });
}

previewPicture()
fermerModale2()
  ;


// Fonction pour valider l'image lors de l'ajout dans la modale 2
function validerFichierImage(fichier) {
  // Validation de la sélection de fichier
  if (!fichier) {
    return "Aucun fichier sélectionné.";
  }

  const allowedTypes = ['image/jpeg', 'image/png']; // Types de fichiers image acceptés
  if (!allowedTypes.includes(fichier.type)) {
    return "Le fichier doit être de type JPEG ou PNG.";
  }

  const maxSizeInBytes = 4 * 1024 * 1024; // 4 Mo
  if (fichier.size > maxSizeInBytes) {
    return "Le fichier est trop volumineux (4 Mo max).";
  }

  return true;
}

// Validation et envoi du formulaire
function validationFormulaire() {
  // Récupération des éléments du DOM et des valeurs
  const titre = document.getElementById("titre").value;
  const categorie = document.getElementById("liste-categories").value;
  const selectionFichier = document.getElementById("selectioner").files[0];
  const errorMessage = document.getElementById("modal2ErrorMessage");

  // Validation du fichier
  const imageValidationResult = validerFichierImage(selectionFichier);
  if (imageValidationResult !== true) {
    errorMessage.textContent = imageValidationResult;
    errorMessage.style.color = "red";
    resetVisualElements(); // Réinitialiser les éléments visuels après avoir défini le message d'erreur.

    return;
  }

  // Validation du titre
  if (titre === "") {
    errorMessage.textContent = "Veuillez définir un titre.";
    errorMessage.style.color = "red";
    return;
  }

  // Validation de la catégorie
  if (categorie === "Champs-selection") {
    errorMessage.textContent = "Veuillez sélectionner une catégorie.";
    errorMessage.style.color = "red";
    return;
  }

  // Si tout est correct, efface le message d'erreur
  errorMessage.textContent = "";

  // Création de l'objet "work"
  const work = {
    title: titre,
    category: categorie,
  };

  // Création de l'objet FormData et ajout des champs du formulaire
  const formData = new FormData();
  formData.append("image", selectionFichier);
  formData.append("title", titre);
  formData.append("category", categorie);


  // Envoi du formulaire avec le jeton d'authentification
  fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // token dans l'en-tête d'autorisation
    },
    body: formData, // Utilisation de FormData comme corps de la requête
  })
    .then((response) => {
      // Vérification de la réponse de l'API pour voir si la suppression a réussi (HTTP 2xx)
      // Sinon, lève une erreur avec le message "Non autorisé : vérifiez votre jeton d'authentification."
      if (!response.ok) {
        throw new Error("Non autorisé : vérifiez votre jeton d'authentification.");
      }
      return response.json(); // Renvoie la réponse sous forme de JSON
    })
    .then((data) => {
      // La suppression a réussi
      console.log("Travail ajouté avec succès :", data);
      // Mise à jour des modales après l'ajout réussi du travail

      form.reset(); // Réinitialiser le formulaire
      resetVisualElements();  // Réinitialiser les éléments visuels

      loadWorks();
      fermerModale2(); // Fermez la modale 2
      ouvrirModale1(); // Ouvrez la modale 1 pour montrer les travaux mis à jour
    })

    .catch((error) => {
      // Gestion des erreurs et affichage du message d'erreur dans un élément avec la classe "error-message"
      const errorDiv = document.querySelector(".error-message");
      errorDiv.innerText = error.message;
      console.log(error)
    });
}

// Événement de validation du formulaire
valider.addEventListener("click", (e) => {
  e.preventDefault();
  validationFormulaire();
});


// Stop propagation du click pour charger une image

const contenuModale = document.getElementById('contenu-modale');
if (contenuModale) {
  contenuModale.addEventListener('click', function (event) {
    event.stopPropagation();
  });
}
document.addEventListener('mousedown', function (event) {
  const modal1 = document.getElementById('modal1');
  const modal2 = document.getElementById('modale2');

  // Si la modale 1 est ouverte et qu'un clic est détecté en dehors de modale1 ET modale2
  if (modal1.style.display === 'block' && event.target !== modal1 && !modal1.contains(event.target) && event.target !== modal2 && !modal2.contains(event.target)) {
    fermerModale1();
  }

  // Si la modale 2 est ouverte et qu'un clic est détecté en dehors de modale2
  if (modal2.style.display === 'flex' && event.target !== modal2 && !modal2.contains(event.target)) {
    fermerModale2();
    fermerModale1(); // Maintenant, cela ne sera appelé que si le clic est en dehors de modale2
  }
});


// Bouton validation en vert
// Obtenir les éléments du formulaire
const titre = document.getElementById("titre");
const categorie = document.getElementById("liste-categories");
const selectionFichier = document.getElementById("selectioner");

// Fonction pour vérifier si tous les champs du formulaire sont remplis
function verifierFormulaire() {
  // Vérifiez que le titre n'est pas vide
  if (titre.value.trim() === "") return false;

  // Vérifiez que la catégorie est sélectionnée
  if (categorie.value === "Champs-selection") return false;

  // Vérifiez qu'une image a été sélectionnée
  if (!selectionFichier.files[0]) return false;

  return true; // Tous les champs sont remplis
}

// Fonction pour mettre à jour la couleur du bouton en fonction de la validité du formulaire
function updateBoutonColor() {
  if (verifierFormulaire()) {
    valider.classList.add("bouton-validation-valide");
  } else {
    valider.classList.remove("bouton-validation-valide");
  }
}

//écouteurs d'événements pour vérifier la validité du formulaire chaque fois qu'une valeur change
titre.addEventListener('input', updateBoutonColor);
categorie.addEventListener('change', updateBoutonColor);
selectionFichier.addEventListener('change', updateBoutonColor);

updateBoutonColor();