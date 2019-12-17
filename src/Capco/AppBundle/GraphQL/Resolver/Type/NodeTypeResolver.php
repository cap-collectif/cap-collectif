<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Consultation;
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
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
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
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
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
            if ('public' === $currentSchemaName) {
                return $this->typeResolver->resolve('PublicProject');
            }

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
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewOpinion');
            }

            return $this->typeResolver->resolve('InternalOpinion');
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
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewVersion');
            }

            return $this->typeResolver->resolve('InternalVersion');
        }
        if ($node instanceof Argument) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewArgument');
            }

            return $this->typeResolver->resolve('InternalArgument');
        }
        if ($node instanceof Source) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSource');
            }

            return $this->typeResolver->resolve('InternalSource');
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
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewQuestionnaireStep');
            }

            return $this->typeResolver->resolve('InternalQuestionnaireStep');
        }
        if ($node instanceof Consultation) {
            if ('public' === $currentSchemaName) {
                return $this->typeResolver->resolve('PublicConsultation');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewConsultation');
            }

            return $this->typeResolver->resolve('InternalConsultation');
        }

        if ($node instanceof ConsultationStep) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewConsultationStep');
            }

            return $this->typeResolver->resolve('InternalConsultationStep');
        }
        if ($node instanceof OtherStep) {
            return $this->typeResolver->resolve('OtherStep');
        }
        if ($node instanceof SynthesisStep) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSynthesisStep');
            }

            return $this->typeResolver->resolve('InternalSynthesisStep');
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
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewReply');
            }

            return $this->typeResolver->resolve('InternalReply');
        }

        if ($node instanceof Follower) {
            return $this->typeResolver->resolve('Follower');
        }
        if ($node instanceof Post) {
            return $this->typeResolver->resolve('InternalPost');
        }
        if ($node instanceof SimpleQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSimpleQuestion');
            }

            return $this->typeResolver->resolve('InternalSimpleQuestion');
        }
        if ($node instanceof MediaQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewMediaQuestion');
            }

            return $this->typeResolver->resolve('InternalMediaQuestion');
        }

        if ($node instanceof MultipleChoiceQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewMultipleChoiceQuestion');
            }

            return $this->typeResolver->resolve('InternalMultipleChoiceQuestion');
        }

        if ($node instanceof SectionQuestion) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewSectionQuestion');
            }

            return $this->typeResolver->resolve('InternalSectionQuestion');
        }

        if ($node instanceof Requirement) {
            return $this->requirementTypeResolver->__invoke($node);
        }
        if ($node instanceof MapToken) {
            return $this->typeResolver->resolve('MapToken');
        }
        if ($node instanceof Oauth2SSOConfiguration) {
            return $this->typeResolver->resolve('InternalOauth2SSOConfiguration');
        }

        if ($node instanceof QuestionChoice) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewQuestionChoice');
            }

            return $this->typeResolver->resolve('InternalQuestionChoice');
        }

        throw new UserError('Could not resolve type of Node.');
    }
}
