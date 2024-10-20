/* eslint-disable no-console */
import { GetAnswersOptions, GetQuestionsOptions, QetaApi } from './QetaApi';
import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { CustomErrorBase } from '@backstage/errors';
import {
  Answer,
  AnswerRequest,
  AnswerResponseBody,
  AnswersResponse,
  AnswersResponseBody,
  AttachmentResponseBody,
  EntityResponse,
  ImpactResponse,
  Post,
  PostRequest,
  PostResponseBody,
  PostsResponse,
  PostsResponseBody,
  StatisticResponse,
  StatisticsRequestParameters,
  StatisticsResponse,
  TagResponse,
  UserEntitiesResponse,
  UserTagsResponse,
} from '@drodil/backstage-plugin-qeta-common';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

export const qetaApiRef = createApiRef<QetaApi>({
  id: 'plugin.qeta.service',
});

export class QetaError extends CustomErrorBase {
  public errors: null | undefined | any[];

  constructor(message: string, errors: null | undefined | any[]) {
    super(message);

    this.errors = errors;
  }
}

export class QetaClient implements QetaApi {
  private readonly fetchApi: FetchApi;
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { fetchApi: FetchApi; discoveryApi: DiscoveryApi }) {
    this.fetchApi = options.fetchApi;
    this.discoveryApi = options.discoveryApi;
  }

  async getBaseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('qeta');
  }

  async getPosts(options: GetQuestionsOptions): Promise<PostsResponse> {
    const query = this.getQueryParameters(options).toString();

    let url = `${await this.getBaseUrl()}/posts`;
    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);
    if (response.status === 403) {
      return { posts: [], total: 0 };
    }
    const data = (await response.json()) as PostsResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getPostsList(
    type: string,
    options?: GetQuestionsOptions,
  ): Promise<PostsResponse> {
    const query = this.getQueryParameters(options).toString();

    let url = `${await this.getBaseUrl()}/posts/list/${type}`;
    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);
    if (response.status === 403) {
      return { posts: [], total: 0 };
    }

    const data = (await response.json()) as PostsResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async createPost(question: PostRequest): Promise<Post> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts`,
      {
        method: 'POST',
        body: JSON.stringify(question),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async commentPost(id: number, content: string): Promise<Post> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${id}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async deletePostComment(questionId: number, id: number): Promise<Post> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/comments/${id}`,
      {
        method: 'DELETE',
      },
    );
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getPost(id?: string): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${id}`,
    );

    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getTags(): Promise<TagResponse[]> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/tags`,
    );
    return (await response.json()) as TagResponse[];
  }

  async getEntities(): Promise<EntityResponse[]> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/entities`,
    );
    return (await response.json()) as EntityResponse[];
  }

  async votePostUp(id: number): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${id}/upvote`,
    );
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async votePostDown(id: number): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${id}/downvote`,
    );
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async favoritePost(id: number): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${id}/favorite`,
    );
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async unfavoritePost(id: number): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${id}/unfavorite`,
    );
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async postAnswer(answer: AnswerRequest): Promise<AnswerResponseBody> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${answer.postId}/answers`,
      {
        method: 'POST',
        body: JSON.stringify({
          answer: answer.answer,
          images: answer.images,
          anonymous: answer.anonymous,
        }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async commentAnswer(
    questionId: number,
    id: number,
    content: string,
  ): Promise<Answer> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/answers/${id}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async deleteAnswerComment(
    questionId: number,
    answerId: number,
    id: number,
  ): Promise<Answer> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/answers/${answerId}/comments/${id}`,
      {
        method: 'DELETE',
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async voteAnswerUp(questionId: number, id: number): Promise<Answer> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/answers/${id}/upvote`,
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async voteAnswerDown(questionId: number, id: number): Promise<Answer> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/answers/${id}/downvote`,
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async markAnswerCorrect(questionId: number, id: number): Promise<boolean> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/answers/${id}/correct`,
    );
    const data = await response;
    return data.ok;
  }

  async markAnswerIncorrect(questionId: number, id: number): Promise<boolean> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/answers/${id}/incorrect`,
    );
    const data = await response;
    return data.ok;
  }

  async deletePost(questionId: number): Promise<boolean> {
    if (!questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}`,
      {
        method: 'DELETE',
      },
    );
    const data = await response;
    return data.ok;
  }

  async deleteAnswer(questionId: number, id: number): Promise<boolean> {
    if (!questionId || !id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/answers/${id}`,
      {
        method: 'DELETE',
      },
    );
    const data = await response;
    return data.ok;
  }

  async updatePost(id: string, question: PostRequest): Promise<Post> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${id}`,
      {
        method: 'POST',
        body: JSON.stringify(question),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to update', data.errors);
    }

    return data;
  }

  async updateAnswer(
    id: number,
    answer: AnswerRequest,
  ): Promise<AnswerResponseBody> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${answer.postId}/answers/${id}`,
      {
        method: 'POST',
        body: JSON.stringify({ answer: answer.answer, images: answer.images }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getAnswers(options: GetAnswersOptions): Promise<AnswersResponse> {
    const query = this.getQueryParameters(options).toString();

    let url = `${await this.getBaseUrl()}/answers`;
    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);
    if (response.status === 403) {
      return { answers: [], total: 0 };
    }
    const data = (await response.json()) as AnswersResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getAnswer(
    questionId: string | number | undefined,
    id: string | number | undefined,
  ): Promise<AnswerResponseBody> {
    if (!questionId || !id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/posts/${questionId}/answers/${id}`,
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getFollowedTags(): Promise<UserTagsResponse> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/tags/followed`,
    );
    return (await response.json()) as UserTagsResponse;
  }

  async followTag(tag: string): Promise<boolean> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/tags/follow/${tag}`,
      {
        method: 'PUT',
      },
    );
    return response.ok;
  }

  async unfollowTag(tag: string): Promise<boolean> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/tags/follow/${tag}`,
      {
        method: 'DELETE',
      },
    );
    return response.ok;
  }

  async getFollowedEntities(): Promise<UserEntitiesResponse> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/entities/followed`,
    );
    return (await response.json()) as UserEntitiesResponse;
  }

  async followEntity(entityRef: string): Promise<boolean> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/entities/follow/${entityRef}`,
      {
        method: 'PUT',
      },
    );
    return response.ok;
  }

  async unfollowEntity(entityRef: string): Promise<boolean> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/entities/follow/${entityRef}`,
      {
        method: 'DELETE',
      },
    );
    return response.ok;
  }

  async postAttachment(file: Blob): Promise<AttachmentResponseBody> {
    const qetaUrl = `${await this.getBaseUrl()}/attachments`;
    const formData = new FormData();

    formData.append('image', file);

    const requestOptions = {
      method: 'POST',
      body: formData,
    };

    const response = await this.fetchApi.fetch(qetaUrl, requestOptions);
    return (await response.json()) as AttachmentResponseBody;
  }

  async getMostUpvotedAnswers(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const query = this.getQueryParameters(options.options).toString();

    let url = `${await this.getBaseUrl()}/statistics/answers/top-upvoted-users`;
    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as StatisticResponse;

    return data;
  }

  async getMostUpvotedCorrectAnswers(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const query = this.getQueryParameters(options.options).toString();
    let url = `${await this.getBaseUrl()}/statistics/answers/top-correct-upvoted-users`;

    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as StatisticResponse;

    return data;
  }

  async getMostUpvotedPosts(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const query = this.getQueryParameters(options.options).toString();
    let url = `${await this.getBaseUrl()}/statistics/posts/top-upvoted-users`;

    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as StatisticResponse;

    return data;
  }

  async getMostPosts(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const query = this.getQueryParameters(options.options).toString();
    let url = `${await this.getBaseUrl()}/statistics/posts/most-questions`;

    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as StatisticResponse;

    return data;
  }

  async getMostAnswers(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const query = this.getQueryParameters(options.options).toString();
    let url = `${await this.getBaseUrl()}/statistics/answers/most-answers`;

    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as StatisticResponse;

    return data;
  }

  async getTopStatisticsHomepage(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse[]> {
    const response = await Promise.all([
      this.getMostPosts(options),
      this.getMostAnswers(options),
      this.getMostUpvotedPosts(options),
      this.getMostUpvotedAnswers(options),
      this.getMostUpvotedCorrectAnswers(options),
    ]);

    return response;
  }

  async getUserImpact(): Promise<ImpactResponse> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/statistics/user/impact`,
    );

    return (await response.json()) as ImpactResponse;
  }

  async getGlobalStats(): Promise<StatisticsResponse> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/statistics/global`,
    );
    return (await response.json()) as StatisticsResponse;
  }

  async getUserStats(userRef: string): Promise<StatisticsResponse> {
    const response = await this.fetchApi.fetch(
      `${await this.getBaseUrl()}/statistics/user/${userRef}`,
    );
    return (await response.json()) as StatisticsResponse;
  }

  private getQueryParameters(params?: any): URLSearchParams {
    if (!params) {
      return new URLSearchParams();
    }
    const asStrings = Object.fromEntries(
      Object.entries(params).map(([k, v]) => {
        if (!v) {
          return [k, ''];
        }
        if (Array.isArray(v)) {
          return [k, v.join(',')];
        }
        return [k, `${v}`];
      }),
    );
    return new URLSearchParams(omitBy(asStrings, isEmpty));
  }
}
