// @flow
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import * as S from './HomePageProjectsSectionConfigurationPage.style';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import type { Project } from '~/components/Admin/Section/HomePageProjectsSectionConfigurationPageDisplayCustom';
import Icon from '~ds/Icon/Icon';
import Image from '~ui/Primitives/Image';

type Props = {|
  +project: Project,
  +index: number,
  +removeProject: (id: string) => void,
|};

const imagePlaceholder = (
  <svg width="112" height="69" viewBox="0 0 112 69" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="112" height="69" rx="4" fill="#F7F7F8" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M44 27.3808C44 26.434 44.7675 25.6665 45.7143 25.6665H66.2857C67.2325 25.6665 68 26.434 68 27.3808V44.5236C68 45.4704 67.2325 46.2379 66.2857 46.2379H45.7143C44.7675 46.2379 44 45.4704 44 44.5236V27.3808ZM47.4286 29.0951V42.8094H64.5714V29.0951H47.4286ZM50.8571 34.2379C51.8039 34.2379 52.5714 33.4704 52.5714 32.5236C52.5714 31.5769 51.8039 30.8093 50.8571 30.8093C49.9104 30.8093 49.1428 31.5769 49.1428 32.5236C49.1428 33.4704 49.9104 34.2379 50.8571 34.2379ZM49.1428 39.3808V41.0951H62.8571V35.9522L59.4286 32.5237L54.2857 37.6665L52.5714 35.9522L49.1428 39.3808Z"
      fill="#85919D"
    />
  </svg>
);

const DraggableProjectCard = ({ project, index, removeProject }: Props) => {
  return (
    <Draggable key={project.id} draggableId={project.id} index={index}>
      {provided => (
        <S.ProjectCardCustom
          justifyContent="space-between"
          alignItems="center"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <Flex alignItems="center">
            <Icon name="DRAG" size="lg" />
            <div>
              {project.cover === null ? (
                imagePlaceholder
              ) : (
                <Image src={project?.cover?.url} alt={project.value} />
              )}
            </div>
            <Text maxWidth={16} mx={4} color="gray.900">
              {project.value}
            </Text>
          </Flex>
          <S.ProjectCardCustomDeleteIcon
            onClick={() => removeProject(project.id)}
            className="delete-icon">
            <Icon name="TRASH" size="md" />
          </S.ProjectCardCustomDeleteIcon>
        </S.ProjectCardCustom>
      )}
    </Draggable>
  );
};

export default DraggableProjectCard;
