export interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: Date;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}
