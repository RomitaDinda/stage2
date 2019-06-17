if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(registration => {
      console.log("Service worker registered :D " + registration.scope);
    })
    .catch(error => {
      console.log("Registration failed: " + error);
    });
}