document.addEventListener("DOMContentLoaded", function () {
    const username = "dongreparam";
    const repoContainer = document.getElementById("projects-container");

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => response.json())
        .then(repos => {
            repos.forEach(repo => {
                const repoElement = document.createElement("div");
                repoElement.classList.add("project");
                repoElement.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || "No description available"}</p>
                    <a href="${repo.html_url}" target="_blank">View on GitHub</a>
                `;
                repoContainer.appendChild(repoElement);
            });
        })
        .catch(error => console.error("Error fetching repos:", error));
});
