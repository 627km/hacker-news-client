import View from "../core/view";

// 타입 알리아스 (type alias)
export interface Store {
    currentPage: number;
    feeds: NewsFeed[];
}

// 중복 된 타입
export interface News {
    readonly id: number;
    readonly time_ago: string;
    readonly title: string;
    readonly url: string;
    readonly user: string;
    readonly content: string;
}

export interface NewsFeed extends News {
    readonly comments_count: number;
    readonly points: number;
    read?: boolean; // ?를 붙이면 항상있는 것이 아닌 선택적으로 있는 데이터라는 의미이다.
}

export interface NewsDetail extends News {
    readonly comments: NewsComment[];
}

export interface NewsComment extends News {
    readonly comments: NewsComment[];
    readonly level: number;
}

export interface RouteInfo {
    path: string;
    page: View;
}
