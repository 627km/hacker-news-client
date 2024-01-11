// 타입 알리아스 (type alias)
interface Store {
    currentPage: number;
    feeds: NewsFeed[];
}

// 중복 된 타입
interface News {
    readonly id: number;
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; // ?를 붙이면 항상있는 것이 아닌 선택적으로 있는 데이터라는 의미이다.
}

interface NewsDetail extends News {
    readonly comments: NewsComment[];
}

interface NewsComment extends News {
    readonly comments: NewsComment[];
    readonly level: number;
}

const container: HTMLElement | null = document.getElementById("root");
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
let store: Store = {
    currentPage: 1,
    feeds: [],
};

function getData<AjaxResponse>(url: string): AjaxResponse {
    ajax.open("GET", url, false);
    ajax.send();

    return JSON.parse(ajax.response);
}

function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
    for (let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }
    return feeds;
}

function updateView(html: string): void {
    // null을 체크하는 코드: 타입가드(타입을 방어해주다)
    if (container) {
        container.innerHTML = html;
    } else {
        console.log("최상위 컨테이너가 없어 UI를 진행하지 못합니다.");
    }
}

// 글 목록
function newsFeed(): void {
    let newsFeed: NewsFeed[] = store.feeds;
    const newsList = [];

    if (newsFeed.length === 0) {
        newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL));
    }
    let template = `
        <div class="bg-gray-600 min-h-screen">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex justify-start">
                            <h1 class="font-extrabold">Hacker News</h1>
                        </div>
                    <div class="items-center justify-end">
                        <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                            Previous
                        </a>
                        <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                            Next
                        </a>
                    </div>
                </div> 
            </div>
        </div>
        <div class="p-4 text-2xl text-gray-700">
            {{__news_feed__}}        
        </div>
    </div>
    `;

    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
        newsList.push(`
            <div class="p-6 ${newsFeed[i].read ? "bg-red-500" : "bg-white"} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
                <div class="flex">
                    <div class="flex-auto">
                        <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
                    </div>
                    <div class="text-center text-sm">
                        <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
                    </div>
                </div>
                    <div class="flex mt-3">
                    <div class="grid grid-cols-3 text-sm text-gray-500">
                        <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
                        <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
                        <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
                    </div>  
                </div>
            </div> 
    `);
    }

    template = template.replace("{{__news_feed__}}", newsList.join(""));
    template = template.replace("{{__prev_page__}}", String(store.currentPage > 1 ? store.currentPage - 1 : 1));
    template = template.replace("{{__next_page__}}", String(store.currentPage + 1));

    updateView(template);
}

const ul = document.createElement("ul");

// 글 내용
function newsDetail(): void {
    const id = location.hash.substring(7);
    const newsContent = getData<NewsDetail>(CONTENT_URL.replace("@id", id));
    let template = `
        <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
        <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
                <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
                </a>
            </div>
            </div>
        </div>
        </div>

        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
            ${newsContent.content}
        </div>

        {{__comments__}}

        </div>
        </div>
    `;
    for (let i = 0; i < store.feeds.length; i++) {
        if (store.feeds[i].id === Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }

    updateView(template.replace("{{__comments__}}", makeComment(newsContent.comments)));

    // container.innerHTML = template;
}

function makeComment(comments: NewsComment[]): string {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
        const comment: NewsComment = comments[i];

        commentString.push(`
            <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
                <div class="text-gray-400">
                   <i class="fa fa-sort-up mr-2"></i>
                    <strong>${comment.user}</strong> ${comment.time_ago}
                </div>
                <p class="text-gray-700">${comment.content}</p>
            </div>
        `);

        // 대댓글이 있는 경우
        if (comment.comments.length > 0) {
            commentString.push(makeComment(comment.comments)); // 재귀호출
        }
    }
    return commentString.join("");
}

function router(): void {
    const routePath = location.hash; // location.hash에 '#'만 들어있을 떄는 빈 값을 반환한다.
    // 따라서 이 부분이 참이 된다.
    if (routePath === "") {
        newsFeed();
    } else if (routePath.indexOf("#/page/") >= 0) {
        store.currentPage = Number(routePath.substring(7));
        newsFeed();
    } else {
        newsDetail();
    }
}
window.addEventListener("hashchange", router);

router();