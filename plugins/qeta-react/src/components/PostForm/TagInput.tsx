import { Autocomplete } from '@material-ui/lab';
import { TextField, Tooltip, Typography } from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import { qetaApiRef } from '../../api';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { filterTags, isValidTag } from '@drodil/backstage-plugin-qeta-common';
import { useTranslation } from '../../hooks';
import { FieldError } from 'react-hook-form';
import { AutocompleteListboxComponent } from './AutocompleteListComponent';

export const TagInput = (props: {
  value?: string[];
  onChange: (value: string[]) => void;
  error?: FieldError;
  allowCreate?: boolean;
  hideHelpText?: boolean;
  style?: React.CSSProperties;
}) => {
  const {
    value,
    onChange,
    error,
    allowCreate,
    hideHelpText = false,
    style,
  } = props;
  const qetaApi = useApi(qetaApiRef);
  const config = useApi(configApiRef);
  const { t } = useTranslation();
  const allowCreation = useMemo(
    () =>
      allowCreate ??
      config.getOptionalBoolean('qeta.tags.allowCreation') ??
      true,
    [config, allowCreate],
  );
  const allowedTags = useMemo(
    () => config.getOptionalStringArray('qeta.tags.allowedTags') ?? [],
    [config],
  );
  const maximumTags = useMemo(
    () => config.getOptionalNumber('qeta.tags.max') ?? 5,
    [config],
  );
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [tagDescriptions, setTagDescriptions] = React.useState<
    Record<string, string>
  >({});
  useEffect(() => {
    qetaApi
      .getTags()
      .catch(_ => setAvailableTags([]))
      .then(data => {
        if (!data) {
          return;
        }

        const uniqueTags = [
          ...new Set([...allowedTags, ...data.tags.map(tag => tag.tag)]),
        ];
        setAvailableTags(uniqueTags);
        setTagDescriptions(
          data.tags.reduce((acc, tag) => {
            if (!tag.description) {
              return acc;
            }
            acc[tag.tag] = tag.description;
            return acc;
          }, {} as Record<string, string>),
        );
      });
  }, [qetaApi, allowCreation, allowedTags]);

  if (!allowCreation && availableTags.length === 0) {
    return null;
  }

  const val = [...new Set(value ?? [])]
    .filter(isValidTag)
    .slice(0, maximumTags);

  return (
    <Autocomplete
      multiple
      id="tags-select"
      className="qetaTagInput"
      value={val}
      options={availableTags ?? []}
      freeSolo={allowCreation}
      ListboxComponent={
        AutocompleteListboxComponent as React.ComponentType<
          React.HTMLAttributes<HTMLElement>
        >
      }
      disableListWrap
      style={style}
      renderOption={option => {
        if (tagDescriptions[option]) {
          return (
            <>
              <Tooltip
                arrow
                placement="right"
                title={<Typography>{tagDescriptions[option]}</Typography>}
              >
                <span>{option}</span>
              </Tooltip>
            </>
          );
        }
        return option;
      }}
      onChange={(_e, newValue) => {
        const tags = filterTags(newValue);
        if (
          tags &&
          tags.length <= maximumTags &&
          tags.length === newValue.length
        ) {
          onChange(newValue);
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          margin="normal"
          label={t('tagsInput.label')}
          placeholder={t('tagsInput.placeholder')}
          helperText={
            hideHelpText
              ? ''
              : t('tagsInput.helperText', {
                  max: maximumTags.toString(10),
                })
          }
          error={error !== undefined}
        />
      )}
    />
  );
};
