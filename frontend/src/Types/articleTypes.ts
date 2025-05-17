export interface Article {
  _id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  createdBy:
    | string
    | {
        _id: string;
        name?: string;
      };
  likes: number;
  dislikes: number;
  block: boolean;
  createdAt: string;
  updatedAt: string;
  userFeedback?: "like" | "dislike";
}

export interface FeedbackResponse {
  likes: number;
  dislikes: number;
}

export interface ArticleState {
  articles: Article[];
  userArticles: Article[];
  preferredArticles: Article[];
  currentArticle: Article | null;
  loading: boolean;
  error: any;
  success: string | null;
  feedback: FeedbackResponse | null;
  processingFeedback: { [key: string]: boolean };
  feedbackType: string;
}
