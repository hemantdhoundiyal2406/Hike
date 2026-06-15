export type ProjectRecord = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  liveUrl: string;
  techStack: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TestimonialRecord = {
  _id: string;
  clientName: string;
  designation: string;
  review: string;
  rating: number;
  image: string;
  createdAt: string;
  updatedAt: string;
};
