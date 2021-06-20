import urlcat, {
  ParamMap,
} from "https://deno.land/x/urlcat@v2.0.4/src/index.ts";
import {
  ApiOptions,
  BodyParams,
  Config,
  ContentType,
  GetParams,
} from "./types.ts";
import * as Ch from "./clubhouse_types.ts";

export class Clubhouse {
  #token: string;
  #baseUrl: string;
  #defaultOptions: ApiOptions;

  constructor(config?: Config) {
    this.#token = config?.token || this.getTokenFromEnv();
    if (!this.#token) {
      throw new Error(
        "A clubhouse token is required. Pass the token to the Clubhouse constructor or in CLUBHOUSE_API_TOKEN env var.",
      );
    }
    this.#baseUrl = config?.baseUrl || "https://api.clubhouse.io/api/v3";

    this.#defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": ContentType.JSON,
        "Clubhouse-Token": this.#token,
      },
    };
  }

  private getTokenFromEnv(): string {
    return Deno.env.get("CLUBHOUSE_API_TOKEN") as string;
  }

  private async get<T>(path: string, params?: GetParams) {
    return await this.api<T>(path, { method: "GET", params });
  }

  private async post<T>(path: string, body?: BodyParams) {
    return await this.api<T>(path, { body, method: "POST" });
  }

  private async delete<T>(path: string, body?: BodyParams) {
    return await this.api<T>(path, { body, method: "DELETE" });
  }

  private async put<T>(path: string, body?: BodyParams) {
    return await this.api<T>(path, { body, method: "PUT" });
  }

  private async api<T>(
    path: string,
    options?: ApiOptions,
  ): Promise<T> {
    const url = urlcat(`${this.#baseUrl}${path}`, options?.params as ParamMap);
    const init = {
      ...this.#defaultOptions,
      ...options,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    };
    return await fetch(
      url,
      init,
    ).then((response) => {
      if (!response.ok) {
        response.body?.cancel();
        if (response.status === 404) {
          throw new NotFoundException(url, 404);
        }
        throw new FetchException(response.statusText, response.status);
      }

      return response.body ? response.json() : undefined;
    });
  }

  getBaseUrl = () => this.#baseUrl;

  getToken = () => this.#token;

  // Categories
  getCategories = () => this.get<Ch.Category[]>(`/categories`);

  getCategory = (categoryId: string) =>
    this.get<Ch.Category>(
      `/categories/${categoryId}`,
    );

  createCategory = (params: Ch.CreateCategory) =>
    this.post<Ch.Category>(
      `/categories`,
      params,
    );

  updateCategory = (categoryId: string, params?: Ch.UpdateCategory) =>
    this.put<Ch.Category>(
      `/categories/${categoryId}`,
      params,
    );

  deleteCategory = (categoryId: string) =>
    this.delete<Ch.Category>(
      `/categories/${categoryId}`,
    );

  getCategoryMilestones = (categoryId: string) =>
    this.get<Ch.Milestone[]>(
      `/categories/${categoryId}/milestones`,
    );

  // Entity-templates
  getEntityTemplates = () => this.get<Ch.EntityTemplate[]>(`/entity-templates`);

  createEntityTemplate = (params: Ch.CreateEntityTemplate) =>
    this.post<Ch.EntityTemplate>(`/entity-templates`, params);

  disableEntityTemplates = () => this.put(`/entity-templates/disable`);

  enableEntityTemplates = () => this.put(`/entity-templates/enable`);

  getEntityTemplate = (entityTemplateId: string) =>
    this.get<Ch.EntityTemplate>(`/entity-templates/${entityTemplateId}`);

  updateEntityTemplate = (
    entityTemplateId: string,
    params?: Ch.UpdateEntityTemplate,
  ) =>
    this.put<Ch.EntityTemplate>(
      `/entity-templates/${entityTemplateId}`,
      params,
    );

  deleteEntityTemplate = (
    entityTemplateId: string,
  ) => this.delete<Ch.EntityTemplate>(`/entity-templates/${entityTemplateId}`);

  // Epic Workflow
  getEpicWorkflow = () => this.get<Ch.EpicWorkflow>(`/epic-workflow`);

  // Epics
  getEpics = (params?: Ch.ListEpics) =>
    this.get<Ch.EpicSlim[]>(`/epics`, params);

  createEpic = (params: Ch.CreateEpic) => this.post<Ch.Epic>(`/epics`, params);

  getEpic = (epicId: number) => this.get<Ch.Epic>(`/epics/${epicId}`);

  updateEpic = (epicId: number, params: Ch.UpdateEpic) =>
    this.put<Ch.Epic>(`/epics/${epicId}`, params);

  deleteEpic = (epicId: number) => this.delete(`/epics/${epicId}`);

  getEpicComments = (epicId: number) =>
    this.get<Ch.ThreadedComment[]>(`/epics/${epicId}/comments`);

  createEpicComment = (epicId: number, params: Ch.CreateEpicComment) =>
    this.post<Ch.ThreadedComment>(`/epics/${epicId}/comments`, params);

  getEpicComment = (epicId: number, commentId: number) =>
    this.get<Ch.ThreadedComment>(`/epics/${epicId}/comments/${commentId}`);

  createEpicCommentComment = (
    epicId: number,
    commentId: number,
    params: Ch.CreateEpicComment,
  ) =>
    this.post<Ch.ThreadedComment>(
      `/epics/${epicId}/comments/${commentId}`,
      params,
    );

  updateEpicComment = (
    epicId: number,
    commentId: number,
    params: Ch.UpdateComment,
  ) =>
    this.put<Ch.ThreadedComment>(
      `/epics/${epicId}/comments/${commentId}`,
      params,
    );

  deleteEpicComment = (
    epicId: number,
    commentId: number,
  ) =>
    this.delete<Ch.ThreadedComment>(`/epics/${epicId}/comments/${commentId}`);

  getEpicStories = (epicId: number, params?: Ch.ListEpics) =>
    this.get<Ch.StorySlim[]>(`/epics/${epicId}/stories`, params);

  unlinkProductboardFromEpic = (epicId: number) =>
    this.post(`/epics/${epicId}/unlink-productboard`);

  // External Link
  getExternalLinkStories = (params: Ch.GetExternalLinkStoriesParams) =>
    this.get<Ch.StorySlim[]>(`/external-link/stories`, params);

  // Files
  getFiles = () => this.get<File[]>(`/files`);

  getFile = (fileId: number) => this.get<File>(`/files/${fileId}`);

  updateFile = (fileId: number, params?: Ch.UpdateFile) =>
    this.put<File>(`/files/${fileId}`, params);

  deleteFile = (fileId: number) => this.delete(`/files/${fileId}`);

  // TODO : https://clubhouse.io/api/rest/v3/#Upload-Files

  getGroups = () => this.get<Ch.Group[]>(`/groups`);

  createGroup = (params: Ch.CreateGroup) =>
    this.post<Ch.Group[]>(`/groups`, params);

  disableGroups = () => this.put(`/groups/disable`);

  enableGroups = () => this.put(`/groups/enable`);

  getGroup = (groupId: string) => this.get<Ch.Group>(`/groups/${groupId}`);

  updateGroup = (groupId: string, params: Ch.UpdateGroup) =>
    this.put<Ch.Group>(`/groups/${groupId}`, params);

  getGroupStories = (groupId: string, params?: Ch.ListGroupStories) =>
    this.get<Ch.StorySlim[]>(`/groups/${groupId}`, params);

  // Iterations
  getIterations = () => this.get<Ch.IterationSlim[]>(`/iterations`);

  createIteration = (params: Ch.CreateIteration) =>
    this.post<Ch.Iteration>(`/iterations`, params);

  disableIterations = () => this.put(`/iterations/disable`);

  enableIterations = () => this.put(`/iterations/enable`);

  getIteration = (iterationId: number) =>
    this.get<Ch.Iteration>(`/iterations/${iterationId}`);

  updateIteration = (iterationId: number, params?: Ch.UpdateIteration) =>
    this.put<Ch.Iteration>(`/iterations/${iterationId}`, params);

  deleteIteration = (iterationId: number) =>
    this.delete(`/iterations/${iterationId}`);

  getIterationStories = (
    iterationId: number,
    params?: Ch.GetIterationStories,
  ) => this.get<Ch.StorySlim[]>(`/iterations/${iterationId}/stories`, params);

  // Labels
  getLabels = () => this.get<Ch.Label[]>(`/labels`);

  createLabel = (params: Ch.CreateLabelParams) =>
    this.post<Ch.Label>(`/labels`, params);

  getLabel = (labelId: number) => this.get<Ch.Label>(`/labels/${labelId}`);

  updateLabel = (labelId: number, params?: Ch.UpdateLabel) =>
    this.put<Ch.Label>(`/labels/${labelId}`, params);

  deleteLabel = (labelId: number) => this.delete(`/labels/${labelId}`);

  getLabelEpics = (labelId: number) =>
    this.get<Ch.EpicSlim[]>(`/labels/${labelId}/epics`);

  getLabelStories = (labelId: number, params?: Ch.GetLabelStories) =>
    this.get<Ch.StorySlim[]>(`/labels/${labelId}/stories`, { body: params });

  // Linked-Files
  getLinkedFiles = () => this.get<Ch.LinkedFile[]>(`/linked-files`);

  createLinkedFile = (params: Ch.CreateLinkedFile) =>
    this.post<Ch.LinkedFile>(`/linked-files`, params);

  getLinkedFile = (linkedFileId: number) =>
    this.get<Ch.LinkedFile>(`/linked-files/${linkedFileId}`);

  updateLinkedFile = (linkedFileId: number, params?: Ch.UpdateLinkedFile) =>
    this.put<Ch.LinkedFile>(`/linked-files/${linkedFileId}`, params);

  deleteLinkedFile = (linkedFileId: number) =>
    this.delete(`/linked-files/${linkedFileId}`);

  // Members
  getCurrentMemberInfo = () => this.get<Ch.MemberInfo>(`/member`);

  getMembers = (params?: Ch.ListMembers) =>
    this.get<Ch.Member[]>(
      `/members`,
      params,
    );

  getMember = (
    memberId: string,
    params?: Ch.GetMember,
  ) =>
    this.get<Ch.Member>(
      `/members/${memberId}`,
      params,
    );

  // Milestones
  getMilestones = () => this.get<Ch.Milestone[]>(`/milestones`);

  createMilestone = (params: Ch.CreateMilestone) =>
    this.post<Ch.Milestone[]>(`/milestones`, params);

  getMilestone = (milestoneId: number) =>
    this.get<Ch.Milestone>(`/milestones/${milestoneId}`);

  updateMilestone = (milestoneId: number, params?: Ch.UpdateMilestone) =>
    this.put<Ch.Milestone>(`/milestones/${milestoneId}`, params);

  deleteMilestone = (milestoneId: number) =>
    this.delete<Ch.Milestone>(`/milestones/${milestoneId}`);

  getMilestoneEpics = (milestoneId: number) =>
    this.get<Ch.Milestone>(`/milestones/${milestoneId}/epics`);

  //  Projects
  getProjects = () => this.get<Ch.Project[]>(`/projects`);

  createProject = (params: Ch.CreateProject) =>
    this.post<Ch.Project>(`/projects`, params);

  getProject = (projectId: number) =>
    this.get<Ch.Project>(`/projects/${projectId}`);

  updateProject = (projectId: number, params?: Ch.UpdateProject) =>
    this.put<Ch.Project>(`/projects/${projectId}`, params);

  deleteProject = (projectId: number) => this.delete(`/projects/${projectId}`);

  getProjectStories = (projectId: number) =>
    this.get<Ch.StorySlim[]>(`/projects/${projectId}/stories`);

  // Repositories
  getRepositories = () => this.get<Ch.Repository[]>(`/repositories`);

  getRepository = (repositoryId: number) =>
    this.get<Ch.Repository>(`/repositories/${repositoryId}`);

  // Search

  search = (query: string, pageSize = 25) =>
    this.get<Ch.SearchResults>(`/search`, {
      query,
      page_size: pageSize,
    });

  searchEpics = (query: string, pageSize = 25) =>
    this.get<Ch.EpicSearchResults>(`/search/epics`, {
      query,
      page_size: pageSize,
    });

  searchStories = (query: string, pageSize?: number) =>
    this.get<Ch.StorySearchResults>(`/search/stories`, {
      query,
      page_size: pageSize,
    });

  // Stories

  createStory = (params: Ch.CreateStoryParams) =>
    this.post<Ch.Story>(`/stories`, params);

  createMultipleStories = (params: Ch.CreateStories) =>
    this.post<Ch.StorySlim[]>(`/stories/bulk`, params);

  updateMultipleStories = (params: Ch.UpdateStories) =>
    this.put<Ch.StorySlim[]>(`/stories/bulk`, params);

  deleteMultipleStories = (params: Ch.DeleteStories) =>
    this.delete<Ch.StorySlim[]>(`/stories/bulk`, params);

  getStory = (storyId: number) => this.get<Ch.Story>(`/stories/${storyId}`);

  updateStory = (storyId: number, params: Ch.UpdateStory) =>
    this.put<Ch.Story>(`/stories/${storyId}`, params);

  deleteStory = (storyId: number) => this.delete(`/stories/${storyId}`);

  createComment = (storyId: number, params: Ch.CreateStoryCommentParams) =>
    this.post<Ch.Comment>(`/stories/${storyId}`, params);

  getComment = (storyId: number, commentId: number) =>
    this.get<Ch.Comment>(`/stories/${storyId}/comments/${commentId}`);

  updateComment = (
    storyId: number,
    commentId: number,
    params: Ch.UpdateComment,
  ) =>
    this.put<Ch.Comment>(`/stories/${storyId}/comments/${commentId}`, params);

  deleteComment = (storyId: number, commentId: string) =>
    this.delete(`/stories/${storyId}/comments/${commentId}`);

  createReaction = (
    storyId: number,
    commentId: number,
    params: Ch.CreateOrDeleteReaction,
  ) =>
    this.post<Ch.Reaction>(
      `/stories/${storyId}/comments/${commentId}/reactions`,
      params,
    );

  deleteReaction = (
    storyId: number,
    commentId: number,
    params: Ch.CreateOrDeleteReaction,
  ) =>
    this.delete<Ch.Reaction>(
      `/stories/${storyId}/comments/${commentId}/reactions`,
      params,
    );

  getStoryHistory = (storyId: number) =>
    this.get<Ch.History[]>(`/stories/${storyId}/history`);

  createTask = (storyId: number, params: Ch.CreateTaskParams) =>
    this.post<Ch.Task>(`/stories/${storyId}/tasks`, params);

  getTask = (storyId: number, taskId: number) =>
    this.get<Ch.Task>(`/stories/${storyId}/tasks/${taskId}`);

  updateTask = (storyId: number, taskId: number, params: Ch.UpdateTask) =>
    this.put<Ch.Task>(`/stories/${storyId}/tasks/${taskId}`, params);

  deleteTask = (storyId: number, taskId: number) =>
    this.delete<Ch.Task>(`/stories/${storyId}/tasks/${taskId}`);

  // Story-Links

  createStoryLink = (params: Ch.CreateStoryLink) =>
    this.post<Ch.StoryLink>(`/story-links`, params);

  getStoryLink = (storyLinkId: number) =>
    this.get<Ch.StoryLink>(`/story-links/${storyLinkId}`);

  updateStoryLink = (storyLinkId: number, params: Ch.UpdateStoryLink) =>
    this.put<Ch.StoryLink>(`/story-links/${storyLinkId}`, params);

  deleteStoryLink = (storyLinkId: number) =>
    this.delete<Ch.StoryLink>(`/story-links/${storyLinkId}`);

  // Workflows
  getWorkflows = () => this.get<Ch.Workflow[]>(`/workflows`);

  getWorkflow = (workflowId: number) =>
    this.get<Ch.Workflow>(`/workflows/${workflowId}`);
}

export class FetchException extends Error {
  readonly message: string;
  constructor(
    readonly response: string,
    readonly status: number,
  ) {
    super();
    this.message = response;
  }
}

export class NoContentException extends Error {
  readonly message: string;
  constructor(
    readonly url: string,
    readonly status: number,
  ) {
    super();
    this.message = url;
  }
}

export class NotFoundException extends Error {
  readonly message: string;
  constructor(
    readonly url: string,
    readonly status: number,
  ) {
    super();
    this.message = url;
  }
}
