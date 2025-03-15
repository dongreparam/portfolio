document.addEventListener("DOMContentLoaded", function () {
    // Loading Animation
    window.addEventListener("load", () => {
        document.getElementById("loading").style.display = "none";
    });

    // Dark/Light Mode Toggle
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle.addEventListener("click", () => {
        document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
    });

    // GitHub Repos Fetching
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

    // Fetch Latest Medium Article
    const blogPostsContainer = document.getElementById("blog-posts");
    fetch("https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@param.dongre")
        .then(response => response.json())
        .then(data => {
            blogPostsContainer.innerHTML = "";
            const latestPost = data.items[0]; // Get the first (latest) post
            const postElement = document.createElement("div");
            postElement.classList.add("blog-post");

            // Truncate the article description to 200 characters
            const truncatedDescription = latestPost.description.substring(0, 200) + "...";

            postElement.innerHTML = `
                <h3><a href="${latestPost.link}" target="_blank">${latestPost.title}</a></h3>
                <p>${truncatedDescription}</p>
                <a href="${latestPost.link}" target="_blank" class="read-more">Read More →</a>
            `;
            blogPostsContainer.appendChild(postElement);
        })
        .catch(error => console.error("Error fetching blog posts:", error));

    // Typing Animation
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

    // Initialize AOS
    AOS.init();
});