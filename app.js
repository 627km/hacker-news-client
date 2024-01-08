const container = document.getElementById("root");
const ajax = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

ajax.open("GET", NEWS_URL, false);
ajax.send();

const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement("ul");

window.addEventListener("hashchange", function () {
    console.log(location.hash);
    const id = location.hash.substring(1); // 1번째 위치부터 마지마까지의 문자열을 반환해준다.

    ajax.open("GET", CONTENT_URL.replace("@id", id), false); // replace('바꿀 문자', '새로운 문자');
    ajax.send();

    const newsContent = JSON.parse(ajax.response);
    const title = document.createElement("h1");

    title.innerHTML = newsContent.title;
    content.appendChild(title);

    console.log(newsContent);
});

for (let i = 0; i < 10; i++) {
    const div = document.createElement("div");
    const li = document.createElement("li");
    const a = document.createElement("a");

    div.innerHTML = `
    <li>
        <a href="#${newsFeed[i].id}">
        ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
    </li>
    `;

    // ul.appendChild(div.children[0]);
    ul.appendChild(div.firstElementChild);
}

container.appendChild(ul);
container.appendChild(content);
