export const TAGS_REGEX = new RegExp('^[a-z0-9+#]+((\\-|_)[a-z0-9+#_]+)*$');

export const isValidTag = (tag: string) => {
  const trimmed = tag.trim();
  return trimmed.length > 0 && trimmed.length < 255 && TAGS_REGEX.test(trimmed);
};

export const filterTags = (input?: null | string | string[]) => {
  if (!input) {
    return [];
  }
  return (Array.isArray(input) ? input : input.split(',')).filter(v =>
    isValidTag(v),
  );
};
