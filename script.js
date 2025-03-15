document.addEventListener("DOMContentLoaded", function () {
    const username = "dongreparam";
    const repoContainer = document.getElementById("projects-container");

    const selectedRepos = ["Learning-Java", "HotWax-Commerce-Training"];

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => response.json())
        .then(repos => {
            repoContainer.innerHTML = "";
            repos
                .filter(repo => selectedRepos.includes(repo.name))
                .forEach(repo => {
                    const repoElement = document.createElement("div");
                    repoElement.classList.add("project");
                    repoElement.innerHTML = `
                        <h3>${repo.name.replace("-", " ")}</h3>
                        <p>${repo.description || "No description available"}</p>
                        <a href="${repo.html_url}" target="_blank">View on GitHub</a>
                    `;
                    repoContainer.appendChild(repoElement);
                });
        })
        .catch(error => console.error("Error fetching repos:", error));

    /* Typing Animation */
    const heroText = "Software Engineer | Data Scientist";
    let i = 0;
    function typeWriter() {
        if (i < heroText.length) {
            document.getElementById("typing-text").innerHTML += heroText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    typeWriter();
});
