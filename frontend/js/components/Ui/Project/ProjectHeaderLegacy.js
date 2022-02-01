// @flow
import * as React from 'react';
import { type AppBoxProps } from '~ui/Primitives/AppBox.type';

import {
  Content,
  Cover,
  Authors,
  Block,
  Blocks,
  CoverImage,
  CoverVideo,
  Social,
  Socials,
  Title,
  Info,
} from './ProjectHeaderLegacy.Cover';
import { Frise, Step, Steps } from './ProjectHeaderLegacy.Frise';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  ...AppBoxProps,
  children?: React.Node,
|};

const ProjectHeaderLegacy = ({ children, ...rest }: Props) => {
  return (
    <Flex direction="column" className="projectHeader" maxWidth="100%" paddingY={[0, 9]} {...rest}>
      {children}
    </Flex>
  );
};
ProjectHeaderLegacy.Cover = Cover;
ProjectHeaderLegacy.Frise = Frise;
ProjectHeaderLegacy.Title = Title;
ProjectHeaderLegacy.Content = Content;
ProjectHeaderLegacy.CoverImage = CoverImage;
ProjectHeaderLegacy.CoverVideo = CoverVideo;
ProjectHeaderLegacy.Authors = Authors;
ProjectHeaderLegacy.Blocks = Blocks;
ProjectHeaderLegacy.Block = Block;
ProjectHeaderLegacy.Info = Info;
ProjectHeaderLegacy.Socials = Socials;
ProjectHeaderLegacy.Social = Social;
ProjectHeaderLegacy.Steps = Steps;
ProjectHeaderLegacy.Step = Step;

export default ProjectHeaderLegacy;
