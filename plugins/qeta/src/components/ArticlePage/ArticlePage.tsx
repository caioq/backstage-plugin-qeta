import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import Skeleton from '@mui/material/Skeleton';
import { ContentHeader, WarningPanel } from '@backstage/core-components';
import { Article, QetaSignal } from '@drodil/backstage-plugin-qeta-common';
import {
  AddToCollectionButton,
  AIAnswerCard,
  ArticleContent,
  useQetaApi,
  useTranslation,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import Container from '@mui/material/Container';

export const ArticlePage = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const [views, setViews] = useState(0);

  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${id}`);

  const {
    value: post,
    loading,
    error,
  } = useQetaApi(api => api.getPost(id), [id]);

  useEffect(() => {
    if (post) {
      setViews(post.views);
    }
  }, [post]);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  if (loading) {
    return <Skeleton variant="rectangular" height={200} />;
  }

  if (error || post === undefined) {
    return (
      <WarningPanel severity="error" title={t('articlePage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (post.type !== 'article') {
    return (
      <WarningPanel title="Not found" message={t('articlePage.notFound')} />
    );
  }

  return (
    <>
      <ContentHeader>
        <WriteArticleButton />
        <AddToCollectionButton post={post} />
      </ContentHeader>
      <Container maxWidth="md">
        <AIAnswerCard
          article={post as Article}
          style={{ marginBottom: '2rem' }}
        />
        <ArticleContent post={post} views={views} />
      </Container>
    </>
  );
};
