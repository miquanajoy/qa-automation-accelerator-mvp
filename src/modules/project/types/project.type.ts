export type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectDetail = Project & {
  pageCount: number;
};

export type CreateProjectInput = {
  name: string;
  description?: string | null;
};

export type UpdateProjectInput = {
  id: string;
  name: string;
  description?: string | null;
};
