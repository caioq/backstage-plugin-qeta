import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import React from 'react';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { AuthorLink, UpdatedByLink } from '../Links';
import { useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';

export const AuthorBox = (props: { entity: PostResponse | AnswerResponse }) => {
  const { entity } = props;
  const { t } = useTranslation();
  const { name, initials, user } = useEntityAuthor(entity);

  return (
    <Box
      sx={theme => ({
        padding: 1,
        float: 'right',
        maxWidth: '200px',
        border: `1px solid ${theme.palette.action.selected}`,
        borderRadius: 1,
        '& .avatar': {
          width: '2em',
          height: '2em',
          fontSize: '1em',
        },
      })}
    >
      <Grid
        container
        alignItems="stretch"
        justifyContent="flex-start"
        spacing={0}
      >
        <Grid item xs={12} style={{ paddingBottom: 0 }}>
          <Typography className="qetaAuthorBoxCreated" variant="caption">
            {t('authorBox.postedAtTime')}{' '}
            <RelativeTimeWithTooltip value={entity.created} />
          </Typography>
        </Grid>
        {entity.updated && entity.updatedBy && (
          <Grid item xs={12} style={{ paddingBottom: 0, paddingTop: 0 }}>
            <Typography className="qetaAuthorBoxUpdated" variant="caption">
              {t('authorBox.updatedAtTime')}{' '}
              <RelativeTimeWithTooltip value={entity.updated} />{' '}
              {t('authorBox.updatedBy')} <UpdatedByLink entity={entity} />
            </Typography>
          </Grid>
        )}
        <Grid item xs={2} style={{ paddingTop: 0 }}>
          <Avatar
            src={user?.spec?.profile?.picture}
            className="qetaAuthorBoxAvatar avatar"
            alt={name}
            variant="rounded"
          >
            {initials}
          </Avatar>
        </Grid>
        <Grid
          item
          xs={10}
          style={{
            paddingTop: 0,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <Box style={{ paddingLeft: '5px' }}>
            <AuthorLink entity={entity} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
