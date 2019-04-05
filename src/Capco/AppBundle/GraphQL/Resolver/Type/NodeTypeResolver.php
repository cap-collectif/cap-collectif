<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\GraphQL\Resolver\Requirement\RequirementTypeResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;

class NodeTypeResolver implements ResolverInterface
{
    private $typeResolver;
    private $requirementTypeResolver;

    public function __construct(
        TypeResolver $typeResolver,
        RequirementTypeResolver $requirementTypeResolver
    ) {
        $this->typeResolver = $typeResolver;
        $this->requirementTypeResolver = $requirementTypeResolver;
    }

    public function __invoke($node): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($node instanceof Project) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProject');
            }

            return $this->typeResolver->resolve('InternalProject');
        }
        if ($node instanceof Questionnaire) {
            if ('public' === $currentSchemaName) {
                return $this->typeResolver->resolve('PublicQuestionnaire');
            }

            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewQuestionnaire');
            }

            return $this->typeResolver->resolve('InternalQuestionnaire');
        }
        if ($node instanceof Opinion) {
            return $this->typeResolver->resolve('Opinion');
        }
        if ($node instanceof OpinionType) {
            return $this->typeResolver->resolve('Section');
        }
        if ($node instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposal');
            }

            return $this->typeResolver->resolve('InternalProposal');
        }
        if ($node instanceof OpinionVersion) {
            return $this->typeResolver->resolve('Version');
        }
        if ($node instanceof Argument) {
            return $this->typeResolver->resolve('Argument');
        }
        if ($node instanceof Source) {
            return $this->typeResolver->resolve('Source');
        }
        if ($node instanceof Reporting) {
            return $this->typeResolver->resolve('Reporting');
        }
        if ($node instanceof User) {
            if ('public' === $currentSchemaName) {
                return $this->typeResolver->resolve('PublicUser');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewUser');
            }

            return $this->typeResolver->resolve('InternalUser');
        }

        if ($node instanceof Comment) {
            return $this->typeResolver->resolve('Comment');
        }

        if ($node instanceof ProposalForm) {
            return $this->typeResolver->resolve('ProposalForm');
        }

        if ($node instanceof Group) {
            return $this->typeResolver->resolve('Group');
        }

        if ($node instanceof SelectionStep) {
            return $this->typeResolver->resolve('SelectionStep');
        }
        if ($node instanceof CollectStep) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewCollectStep');
            }

            return $this->typeResolver->resolve('InternalCollectStep');
        }
        if ($node instanceof PresentationStep) {
            return $this->typeResolver->resolve('PresentationStep');
        }
        if ($node instanceof QuestionnaireStep) {
            return $this->typeResolver->resolve('QuestionnaireStep');
        }
        if ($node instanceof ConsultationStep) {
            if ('public' === $currentSchemaName) {
                return $this->typeResolver->resolve('PublicConsultation');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewConsultation');
            }

            return $this->typeResolver->resolve('InternalConsultation');
        }
        if ($node instanceof OtherStep) {
            return $this->typeResolver->resolve('OtherStep');
        }
        if ($node instanceof SynthesisStep) {
            return $this->typeResolver->resolve('SynthesisStep');
        }
        if ($node instanceof RankingStep) {
            return $this->typeResolver->resolve('RankingStep');
        }
        if ($node instanceof Event) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewEvent');
            }

            return $this->typeResolver->resolve('InternalEvent');
        }
        if ($node instanceof Reply) {
            return $this->typeResolver->resolve('InternalReply');
        }
        if ($node instanceof Follower) {
            return $this->typeResolver->resolve('Follower');
        }
        if ($node instanceof Post) {
            return $this->typeResolver->resolve('Post');
        }
        if ($node instanceof SimpleQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSimpleQuestion');
            }

            return $this->typeResolver->resolve('InternalSimpleQuestion');
        }
        if ($node instanceof MediaQuestion) {
            return $this->typeResolver->resolve('MediaQuestion');
        }
        if ($node instanceof MultipleChoiceQuestion) {
            return $this->typeResolver->resolve('MultipleChoiceQuestion');
        }
        if ($node instanceof SectionQuestion) {
            return $this->typeResolver->resolve('SectionQuestion');
        }
        if ($node instanceof Requirement) {
            return $this->requirementTypeResolver->__invoke($node);
        }
        if ($node instanceof MapToken) {
            return $this->typeResolver->resolve('MapToken');
        }

        throw new UserError('Could not resolve type of Node.');
    }
}
