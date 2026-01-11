import { ContentDivisionResponse } from './gemini';

export interface TopicStats {
    topic: string;
    subtopic: string;
    green: number;
    red: number;
    total: number;
    understandingPercentage: number;
}

export interface SavedLecture {
    id: string;
    title: string;
    date: number; // timestamp
    content: ContentDivisionResponse;
    stats: TopicStats[];
}
