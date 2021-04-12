// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import { type AppBoxProps } from '~ui/Primitives/AppBox.type';

import {
  Content,
  Cover,
  Authors,
  Block,
  Blocks,
  CoverImage,
  Social,
  Socials,
  Title,
  Info,
} from './ProjectHeader.Cover';
import { Frise, Step, Steps } from './ProjectHeader.Frise';

type Props = {|
  ...AppBoxProps,
  coverURL: string,
  children?: React.Node,
|};

const ProjectHeader = ({ children, coverURL, ...rest }: Props) => {
  return (
    <AppBox display="flex" flexDirection="column" maxWidth="100%" {...rest}>
      {children}
    </AppBox>
  );
};
ProjectHeader.Cover = Cover;
ProjectHeader.Frise = Frise;
ProjectHeader.Title = Title;
ProjectHeader.Content = Content;
ProjectHeader.CoverImage = CoverImage;
ProjectHeader.Authors = Authors;
ProjectHeader.Blocks = Blocks;
ProjectHeader.Block = Block;
ProjectHeader.Info = Info;
ProjectHeader.Socials = Socials;
ProjectHeader.Social = Social;
ProjectHeader.Steps = Steps;
ProjectHeader.Step = Step;

export default ProjectHeader;
