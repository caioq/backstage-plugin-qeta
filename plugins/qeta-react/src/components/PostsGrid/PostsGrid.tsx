import React from 'react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import {
  AskQuestionButton,
  EntityFollowButton,
  TagFollowButton,
  WriteArticleButton,
} from '../Buttons';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FilterList from '@mui/icons-material/FilterList';
import { FilterPanel, PostFilters } from '../FilterPanel/FilterPanel';
import { PostsGridContent } from './PostsGridContent';
import { capitalize } from 'lodash';
import {
  PaginatedPostsProps,
  usePaginatedPosts,
} from '../../hooks/usePaginatedPosts';
import { useTranslation } from '../../hooks';

export type PostGridProps = PaginatedPostsProps & { allowRanking?: boolean };

export const PostsGrid = (props: PostGridProps) => {
  const {
    type,
    tags,
    author,
    entity,
    showFilters,
    showTitle,
    title,
    favorite,
    showAskButton,
    showWriteButton,
    showNoQuestionsBtn,
    allowRanking,
  } = props;
  const { t } = useTranslation();
  const {
    onSearchQueryChange,
    filters,
    response,
    loading,
    error,
    setShowFilterPanel,
    showFilterPanel,
    onFilterChange,
    onPageSizeChange,
    postsPerPage,
    page,
    pageCount,
    onPageChange,
    retry,
  } = usePaginatedPosts(props);

  const itemType = capitalize(t(`common.${type ?? 'post'}`, {}));
  let shownTitle = title;
  let link = undefined;
  let btn = undefined;
  if (author) {
    shownTitle = t(`postsContainer.title.by`, { itemType });
    link = <EntityRefLink entityRef={author} hideIcon defaultKind="user" />;
  } else if (entity) {
    shownTitle = t(`postsContainer.title.about`, { itemType });
    link = <EntityRefLink entityRef={entity} />;
    btn = <EntityFollowButton entityRef={entity} />;
  } else if (tags) {
    shownTitle = `#${tags.join(', #')}`;
    if (tags.length === 1) {
      btn = <TagFollowButton tag={tags[0]} />;
    }
  } else if (favorite) {
    shownTitle = t('postsContainer.title.favorite', { itemType });
  }

  return (
    <Box className="qetaPostsGrid">
      {showTitle && (
        <Typography
          variant="h5"
          className="qetaPostsGridTitle"
          style={{ marginBottom: '1.5rem' }}
        >
          {shownTitle} {link} {btn}
        </Typography>
      )}
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <TextField
            id="search-bar"
            fullWidth
            onChange={onSearchQueryChange}
            label={t('postsContainer.search.label', { itemType })}
            className="qetaPostsGridSearchInput"
            variant="outlined"
            placeholder={t('postsContainer.search.placeholder')}
            size="small"
            style={{ marginBottom: '5px' }}
          />
        </Grid>
        {showAskButton && (
          <Grid item>
            <AskQuestionButton
              entity={entity ?? filters.entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          </Grid>
        )}
        {showWriteButton && (
          <Grid item>
            <WriteArticleButton
              entity={entity ?? filters.entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          </Grid>
        )}
      </Grid>
      <Grid container justifyContent="space-between">
        {response && (
          <Grid item>
            <Typography
              variant="h6"
              className="qetaPostsContainerQuestionCount"
            >
              {t('common.posts', { count: response?.total ?? 0, itemType })}
            </Typography>
          </Grid>
        )}
        {response && (showFilters ?? true) && (
          <Grid item>
            <Button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="qetaPostsContainerFilterPanelBtn"
              startIcon={<FilterList />}
            >
              {t('filterPanel.filterButton')}
            </Button>
          </Grid>
        )}
      </Grid>
      {(showFilters ?? true) && (
        <Collapse in={showFilterPanel}>
          <FilterPanel<PostFilters>
            onChange={onFilterChange}
            filters={filters}
            type={type}
          />
        </Collapse>
      )}
      <PostsGridContent
        loading={loading}
        error={error}
        response={response}
        entity={entity}
        showNoQuestionsBtn={showNoQuestionsBtn}
        onPageSizeChange={onPageSizeChange}
        pageSize={postsPerPage}
        entityPage={entity !== undefined}
        tags={tags}
        type={type}
        page={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
        onRankUpdate={() => retry()}
        collectionId={props.collectionId}
        allowRanking={allowRanking}
      />
    </Box>
  );
};
