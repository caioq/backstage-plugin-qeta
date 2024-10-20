import { Content, Page } from '@backstage/core-components';
import { Container } from '@material-ui/core';
import { QuestionsContainer } from '@drodil/backstage-plugin-qeta-react';
import React from 'react';

export const ComponentPage = () => {
  return (
    <Page themeId="home">
      <Content>
        <Container>
          <QuestionsContainer
            entity="component:default/test-component"
            showTitle
            showAskButton
          />
        </Container>
      </Content>
    </Page>
  );
};
