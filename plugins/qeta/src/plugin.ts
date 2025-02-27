import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { createCardExtension } from '@backstage/plugin-home-react';
import { qetaApiRef, qetaRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';

export const qetaPlugin = createPlugin({
  id: 'qeta',
  routes: {
    root: qetaRouteRef,
  },
  apis: [
    createApiFactory({
      api: qetaApiRef,
      deps: { fetchApi: fetchApiRef, discoveryApi: discoveryApiRef },
      factory: ({ fetchApi, discoveryApi }) =>
        new QetaClient({ fetchApi, discoveryApi }),
    }),
  ],
});

export const QetaPage = qetaPlugin.provide(
  createRoutableExtension({
    name: 'QetaPage',
    component: () => import('./components/QetaPage').then(m => m.QetaPage),
    mountPoint: qetaRouteRef,
  }),
);

export const QuestionTableCard = qetaPlugin.provide(
  createCardExtension<{ rowsPerPage?: number; quickFilter?: string }>({
    name: 'QuestionsTableCard',
    title: 'Q&A',
    description: 'Shows Q&A questions',
    components: () => import('./components/QuestionTableCard'),
    layout: {
      height: { minRows: 6 },
      width: { minColumns: 6 },
    },
    settings: {
      schema: {
        title: 'Q&A',
        type: 'object',
        properties: {
          rowsPerPage: {
            title: 'Rows per page',
            type: 'number',
            enum: [5, 10, 20, 30, 40, 50],
            default: 10,
          },
          quickFilter: {
            title: 'Default filter',
            type: 'string',
            enum: ['latest', 'favorites', 'most_viewed'],
            default: 'latest',
          },
        },
      },
    },
  }),
);
