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
import * as SC from "./shortcut_types.ts";

export class Shortcut {
  #token: string;
  #baseUrl: string;
  #defaultOptions: ApiOptions;

  constructor(config?: Config) {
    this.#token = config?.token || this.getTokenFromEnv();
    if (!this.#token) {
      throw new Error(
        "A Shortcut token is required. Pass the token to the Shortcut constructor or in SHORTCUT_API_TOKEN env var."
      );
    }
    this.#baseUrl = config?.baseUrl || "https://api.app.shortcut.com/api/v3";

    this.#defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": ContentType.JSON,
        "Shortcut-Token": this.#token,
      },
    };
  }

  private getTokenFromEnv(): string {
    return Deno.env.get("SHORTCUT_API_TOKEN") as string;
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

  private async api<T>(path: string, options?: ApiOptions): Promise<T> {
    const url = urlcat(`${this.#baseUrl}${path}`, options?.params as ParamMap);
    const init = {
      ...this.#defaultOptions,
      ...options,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    };
    return await fetch(url, init).then((response) => {
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
  getCategories = () => this.get<SC.Category[]>(`/categories`);

  getCategory = (categoryId: string) =>
    this.get<SC.Category>(`/categories/${categoryId}`);

  createCategory = (params: SC.CreateCategory) =>
    this.post<SC.Category>(`/categories`, params);

  updateCategory = (categoryId: string, params?: SC.UpdateCategory) =>
    this.put<SC.Category>(`/categories/${categoryId}`, params);

  deleteCategory = (categoryId: string) =>
    this.delete<SC.Category>(`/categories/${categoryId}`);

  getCategoryMilestones = (categoryId: string) =>
    this.get<SC.Milestone[]>(`/categories/${categoryId}/milestones`);

  // Entity-templates
  getEntityTemplates = () => this.get<SC.EntityTemplate[]>(`/entity-templates`);

  createEntityTemplate = (params: SC.CreateEntityTemplate) =>
    this.post<SC.EntityTemplate>(`/entity-templates`, params);

  disableEntityTemplates = () => this.put(`/entity-templates/disable`);

  enableEntityTemplates = () => this.put(`/entity-templates/enable`);

  getEntityTemplate = (entityTemplateId: string) =>
    this.get<SC.EntityTemplate>(`/entity-templates/${entityTemplateId}`);

  updateEntityTemplate = (
    entityTemplateId: string,
    params?: SC.UpdateEntityTemplate
  ) =>
    this.put<SC.EntityTemplate>(
      `/entity-templates/${entityTemplateId}`,
      params
    );

  deleteEntityTemplate = (entityTemplateId: string) =>
    this.delete<SC.EntityTemplate>(`/entity-templates/${entityTemplateId}`);

  // Epic Workflow
  getEpicWorkflow = () => this.get<SC.EpicWorkflow>(`/epic-workflow`);

  // Epics
  getEpics = (params?: SC.ListEpics) =>
    this.get<SC.EpicSlim[]>(`/epics`, params);

  createEpic = (params: SC.CreateEpic) => this.post<SC.Epic>(`/epics`, params);

  getEpic = (epicId: number) => this.get<SC.Epic>(`/epics/${epicId}`);

  updateEpic = (epicId: number, params: SC.UpdateEpic) =>
    this.put<SC.Epic>(`/epics/${epicId}`, params);

  deleteEpic = (epicId: number) => this.delete(`/epics/${epicId}`);

  getEpicComments = (epicId: number) =>
    this.get<SC.ThreadedComment[]>(`/epics/${epicId}/comments`);

  createEpicComment = (epicId: number, params: SC.CreateEpicComment) =>
    this.post<SC.ThreadedComment>(`/epics/${epicId}/comments`, params);

  getEpicComment = (epicId: number, commentId: number) =>
    this.get<SC.ThreadedComment>(`/epics/${epicId}/comments/${commentId}`);

  createEpicCommentComment = (
    epicId: number,
    commentId: number,
    params: SC.CreateEpicComment
  ) =>
    this.post<SC.ThreadedComment>(
      `/epics/${epicId}/comments/${commentId}`,
      params
    );

  updateEpicComment = (
    epicId: number,
    commentId: number,
    params: SC.UpdateComment
  ) =>
    this.put<SC.ThreadedComment>(
      `/epics/${epicId}/comments/${commentId}`,
      params
    );

  deleteEpicComment = (epicId: number, commentId: number) =>
    this.delete<SC.ThreadedComment>(`/epics/${epicId}/comments/${commentId}`);

  getEpicStories = (epicId: number, params?: SC.ListEpics) =>
    this.get<SC.StorySlim[]>(`/epics/${epicId}/stories`, params);

  unlinkProductboardFromEpic = (epicId: number) =>
    this.post(`/epics/${epicId}/unlink-productboard`);

  // External Link
  getExternalLinkStories = (params: SC.GetExternalLinkStoriesParams) =>
    this.get<SC.StorySlim[]>(`/external-link/stories`, params);

  // Files
  getFiles = () => this.get<File[]>(`/files`);

  getFile = (fileId: number) => this.get<File>(`/files/${fileId}`);

  updateFile = (fileId: number, params?: SC.UpdateFile) =>
    this.put<File>(`/files/${fileId}`, params);

  deleteFile = (fileId: number) => this.delete(`/files/${fileId}`);

  // TODO : https://Shortcut.io/api/rest/v3/#Upload-Files

  getGroups = () => this.get<SC.Group[]>(`/groups`);

  createGroup = (params: SC.CreateGroup) =>
    this.post<SC.Group[]>(`/groups`, params);

  disableGroups = () => this.put(`/groups/disable`);

  enableGroups = () => this.put(`/groups/enable`);

  getGroup = (groupId: string) => this.get<SC.Group>(`/groups/${groupId}`);

  updateGroup = (groupId: string, params: SC.UpdateGroup) =>
    this.put<SC.Group>(`/groups/${groupId}`, params);

  getGroupStories = (groupId: string, params?: SC.ListGroupStories) =>
    this.get<SC.StorySlim[]>(`/groups/${groupId}`, params);

  // Iterations
  getIterations = () => this.get<SC.IterationSlim[]>(`/iterations`);

  createIteration = (params: SC.CreateIteration) =>
    this.post<SC.Iteration>(`/iterations`, params);

  disableIterations = () => this.put(`/iterations/disable`);

  enableIterations = () => this.put(`/iterations/enable`);

  getIteration = (iterationId: number) =>
    this.get<SC.Iteration>(`/iterations/${iterationId}`);

  updateIteration = (iterationId: number, params?: SC.UpdateIteration) =>
    this.put<SC.Iteration>(`/iterations/${iterationId}`, params);

  deleteIteration = (iterationId: number) =>
    this.delete(`/iterations/${iterationId}`);

  getIterationStories = (
    iterationId: number,
    params?: SC.GetIterationStories
  ) => this.get<SC.StorySlim[]>(`/iterations/${iterationId}/stories`, params);

  // Labels
  getLabels = () => this.get<SC.Label[]>(`/labels`);

  createLabel = (params: SC.CreateLabelParams) =>
    this.post<SC.Label>(`/labels`, params);

  getLabel = (labelId: number) => this.get<SC.Label>(`/labels/${labelId}`);

  updateLabel = (labelId: number, params?: SC.UpdateLabel) =>
    this.put<SC.Label>(`/labels/${labelId}`, params);

  deleteLabel = (labelId: number) => this.delete(`/labels/${labelId}`);

  getLabelEpics = (labelId: number) =>
    this.get<SC.EpicSlim[]>(`/labels/${labelId}/epics`);

  getLabelStories = (labelId: number, params?: SC.GetLabelStories) =>
    this.get<SC.StorySlim[]>(`/labels/${labelId}/stories`, { body: params });

  // Linked-Files
  getLinkedFiles = () => this.get<SC.LinkedFile[]>(`/linked-files`);

  createLinkedFile = (params: SC.CreateLinkedFile) =>
    this.post<SC.LinkedFile>(`/linked-files`, params);

  getLinkedFile = (linkedFileId: number) =>
    this.get<SC.LinkedFile>(`/linked-files/${linkedFileId}`);

  updateLinkedFile = (linkedFileId: number, params?: SC.UpdateLinkedFile) =>
    this.put<SC.LinkedFile>(`/linked-files/${linkedFileId}`, params);

  deleteLinkedFile = (linkedFileId: number) =>
    this.delete(`/linked-files/${linkedFileId}`);

  // Members
  getCurrentMemberInfo = () => this.get<SC.MemberInfo>(`/member`);

  getMembers = (params?: SC.ListMembers) =>
    this.get<SC.Member[]>(`/members`, params);

  getMember = (memberId: string, params?: SC.GetMember) =>
    this.get<SC.Member>(`/members/${memberId}`, params);

  // Milestones
  getMilestones = () => this.get<SC.Milestone[]>(`/milestones`);

  createMilestone = (params: SC.CreateMilestone) =>
    this.post<SC.Milestone[]>(`/milestones`, params);

  getMilestone = (milestoneId: number) =>
    this.get<SC.Milestone>(`/milestones/${milestoneId}`);

  updateMilestone = (milestoneId: number, params?: SC.UpdateMilestone) =>
    this.put<SC.Milestone>(`/milestones/${milestoneId}`, params);

  deleteMilestone = (milestoneId: number) =>
    this.delete<SC.Milestone>(`/milestones/${milestoneId}`);

  getMilestoneEpics = (milestoneId: number) =>
    this.get<SC.Milestone>(`/milestones/${milestoneId}/epics`);

  //  Projects
  getProjects = () => this.get<SC.Project[]>(`/projects`);

  createProject = (params: SC.CreateProject) =>
    this.post<SC.Project>(`/projects`, params);

  getProject = (projectId: number) =>
    this.get<SC.Project>(`/projects/${projectId}`);

  updateProject = (projectId: number, params?: SC.UpdateProject) =>
    this.put<SC.Project>(`/projects/${projectId}`, params);

  deleteProject = (projectId: number) => this.delete(`/projects/${projectId}`);

  getProjectStories = (projectId: number) =>
    this.get<SC.StorySlim[]>(`/projects/${projectId}/stories`);

  // Repositories
  getRepositories = () => this.get<SC.Repository[]>(`/repositories`);

  getRepository = (repositoryId: number) =>
    this.get<SC.Repository>(`/repositories/${repositoryId}`);

  // Search

  search = (query: string, pageSize = 25) =>
    this.get<SC.SearchResults>(`/search`, {
      query,
      page_size: pageSize,
    });

  searchEpics = (query: string, pageSize = 25) =>
    this.get<SC.EpicSearchResults>(`/search/epics`, {
      query,
      page_size: pageSize,
    });

  searchStories = (query: string, pageSize?: number) =>
    this.get<SC.StorySearchResults>(`/search/stories`, {
      query,
      page_size: pageSize,
    });

  // Stories

  createStory = (params: SC.CreateStoryParams) =>
    this.post<SC.Story>(`/stories`, params);

  createMultipleStories = (params: SC.CreateStories) =>
    this.post<SC.StorySlim[]>(`/stories/bulk`, params);

  updateMultipleStories = (params: SC.UpdateStories) =>
    this.put<SC.StorySlim[]>(`/stories/bulk`, params);

  deleteMultipleStories = (params: SC.DeleteStories) =>
    this.delete<SC.StorySlim[]>(`/stories/bulk`, params);

  getStory = (storyId: number) => this.get<SC.Story>(`/stories/${storyId}`);

  updateStory = (storyId: number, params: SC.UpdateStory) =>
    this.put<SC.Story>(`/stories/${storyId}`, params);

  deleteStory = (storyId: number) => this.delete(`/stories/${storyId}`);

  createComment = (storyId: number, params: SC.CreateStoryCommentParams) =>
    this.post<SC.Comment>(`/stories/${storyId}`, params);

  getComment = (storyId: number, commentId: number) =>
    this.get<SC.Comment>(`/stories/${storyId}/comments/${commentId}`);

  updateComment = (
    storyId: number,
    commentId: number,
    params: SC.UpdateComment
  ) =>
    this.put<SC.Comment>(`/stories/${storyId}/comments/${commentId}`, params);

  deleteComment = (storyId: number, commentId: string) =>
    this.delete(`/stories/${storyId}/comments/${commentId}`);

  createReaction = (
    storyId: number,
    commentId: number,
    params: SC.CreateOrDeleteReaction
  ) =>
    this.post<SC.Reaction>(
      `/stories/${storyId}/comments/${commentId}/reactions`,
      params
    );

  deleteReaction = (
    storyId: number,
    commentId: number,
    params: SC.CreateOrDeleteReaction
  ) =>
    this.delete<SC.Reaction>(
      `/stories/${storyId}/comments/${commentId}/reactions`,
      params
    );

  getStoryHistory = (storyId: number) =>
    this.get<SC.History[]>(`/stories/${storyId}/history`);

  createTask = (storyId: number, params: SC.CreateTaskParams) =>
    this.post<SC.Task>(`/stories/${storyId}/tasks`, params);

  getTask = (storyId: number, taskId: number) =>
    this.get<SC.Task>(`/stories/${storyId}/tasks/${taskId}`);

  updateTask = (storyId: number, taskId: number, params: SC.UpdateTask) =>
    this.put<SC.Task>(`/stories/${storyId}/tasks/${taskId}`, params);

  deleteTask = (storyId: number, taskId: number) =>
    this.delete<SC.Task>(`/stories/${storyId}/tasks/${taskId}`);

  // Story-Links

  createStoryLink = (params: SC.CreateStoryLink) =>
    this.post<SC.StoryLink>(`/story-links`, params);

  getStoryLink = (storyLinkId: number) =>
    this.get<SC.StoryLink>(`/story-links/${storyLinkId}`);

  updateStoryLink = (storyLinkId: number, params: SC.UpdateStoryLink) =>
    this.put<SC.StoryLink>(`/story-links/${storyLinkId}`, params);

  deleteStoryLink = (storyLinkId: number) =>
    this.delete<SC.StoryLink>(`/story-links/${storyLinkId}`);

  // Workflows
  getWorkflows = () => this.get<SC.Workflow[]>(`/workflows`);

  getWorkflow = (workflowId: number) =>
    this.get<SC.Workflow>(`/workflows/${workflowId}`);
}

export class FetchException extends Error {
  readonly message: string;
  constructor(readonly response: string, readonly status: number) {
    super();
    this.message = response;
  }
}

export class NoContentException extends Error {
  readonly message: string;
  constructor(readonly url: string, readonly status: number) {
    super();
    this.message = url;
  }
}

export class NotFoundException extends Error {
  readonly message: string;
  constructor(readonly url: string, readonly status: number) {
    super();
    this.message = url;
  }
}
