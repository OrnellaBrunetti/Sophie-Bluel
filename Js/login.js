// Ajout d'un écouteur d'événement pour le formulaire avec la classe "form" lorsqu'il est soumis
document.querySelector(".form").addEventListener("submit", function (event) {
  // Empêche le comportement par défaut du formulaire (rechargement de la page)
  event.preventDefault();

  // Récupération des valeurs saisies dans les champs email et password
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Création d'un objet "user" contenant les données du formulaire (email et mot de passe)
  const user = {
    email: email,
    password: password,
  };

  // Appel à l'API pour envoyer les données du formulaire de connexion (méthode POST)
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Définit le type de contenu de la requête comme JSON
    },
    body: JSON.stringify(user), // Convertit l'objet "user" en JSON pour l'envoyer au serveur
  })
    .then((response) => {
      // Vérification de la réponse de l'API pour voir si elle a réussi (HTTP 2xx)
      // Sinon, lève une erreur avec le message "Erreur dans l'identifiant ou le mot de passe."
      if (!response.ok) {
        throw new Error("Erreur dans l'identifiant ou le mot de passe.");
      }
      return response.json(); // Renvoie la réponse sous forme de JSON
    })
    .then((data) => {
      // Récupération du token d'authentification de la réponse de l'API et stockage dans le localStorage
      const token = data.token;
      localStorage.setItem("token", token);

      // Redirection vers la page index.html (page d'accueil après la connexion réussie)
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Gestion des erreurs et affichage du message d'erreur dans un élément avec la classe "error-message"
      const errorDiv = document.querySelector(".error-message");
      errorDiv.innerText = error.message;
    });
});