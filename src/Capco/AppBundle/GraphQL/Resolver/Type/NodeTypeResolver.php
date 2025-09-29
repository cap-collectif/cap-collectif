<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Section\SectionCarrouselElement;
use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\GraphQL\Resolver\ContributorTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\District\DistrictTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Question\QuestionTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Reply\ReplyTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\RequirementTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Response\ResponseResolver;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class NodeTypeResolver implements QueryInterface
{
    public function __construct(
        private readonly TypeResolver $typeResolver,
        private readonly RequirementTypeResolver $requirementTypeResolver,
        private readonly QuestionTypeResolver $questionTypeResolver,
        private readonly ResponseResolver $responseTypeResolver,
        private readonly ReplyTypeResolver $replyTypeResolver,
        private readonly DistrictTypeResolver $districtTypeResolver,
        private readonly ContributorTypeResolver $contributorTypeResolver
    ) {
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
        if ($node instanceof Organization) {
            return $this->typeResolver->resolve('InternalOrganization');
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
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewProposalForm');
            }

            return $this->typeResolver->resolve('InternalProposalForm');
        }

        if ($node instanceof Group) {
            return $this->typeResolver->resolve('Group');
        }

        if ($node instanceof SelectionStep) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewSelectionStep');
            }

            return $this->typeResolver->resolve('InternalSelectionStep');
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
            return $this->replyTypeResolver->__invoke($node);
        }

        if ($node instanceof Follower) {
            return $this->typeResolver->resolve('Follower');
        }
        if ($node instanceof Post) {
            return $this->typeResolver->resolve('InternalPost');
        }
        if ($node instanceof AbstractQuestion) {
            return $this->questionTypeResolver->__invoke($node);
        }
        if ($node instanceof AbstractResponse) {
            return $this->responseTypeResolver->__invoke($node);
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

        if ($node instanceof UserInvite) {
            return $this->typeResolver->resolve('UserInvite');
        }

        if ($node instanceof MailingList) {
            return $this->typeResolver->resolve('MailingList');
        }

        if ($node instanceof EmailingCampaign) {
            return $this->typeResolver->resolve('EmailingCampaign');
        }

        if ($node instanceof Debate) {
            return $this->typeResolver->resolve('InternalDebate');
        }

        if ($node instanceof DebateStep) {
            return $this->typeResolver->resolve('InternalDebateStep');
        }

        if ($node instanceof DebateOpinion) {
            return $this->typeResolver->resolve('InternalDebateOpinion');
        }

        if ($node instanceof DebateArgument) {
            return $this->typeResolver->resolve('InternalDebateArgument');
        }

        if ($node instanceof DebateAnonymousArgument) {
            return $this->typeResolver->resolve('InternalDebateAnonymousArgument');
        }

        if ($node instanceof DebateArticle) {
            return $this->typeResolver->resolve('InternalDebateArticle');
        }

        if ($node instanceof SmsOrder) {
            return $this->typeResolver->resolve('InternalSmsOrder');
        }

        if ($node instanceof SmsCredit) {
            return $this->typeResolver->resolve('InternalSmsCredit');
        }

        if ($node instanceof ProposalDistrict) {
            return $this->typeResolver->resolve('ProposalDistrict');
        }

        if ($node instanceof GlobalDistrict) {
            return $this->districtTypeResolver->__invoke($node);
        }

        if ($node instanceof Participant) {
            return $this->typeResolver->resolve('InternalParticipant');
        }

        if ($node instanceof Mediator) {
            return $this->typeResolver->resolve('InternalMediator');
        }

        if ($node instanceof ContributorInterface) {
            return $this->contributorTypeResolver->__invoke($node);
        }

        if ($node instanceof MenuItem) {
            return $this->typeResolver->resolve('InternalMenuItem');
        }

        if ($node instanceof UserType) {
            return $this->typeResolver->resolve('UserType');
        }

        if ($node instanceof ProposalSelectionVote || $node instanceof ProposalCollectVote) {
            return $this->typeResolver->resolve('InternalProposalVote');
        }

        if ($node instanceof SectionCarrouselElement) {
            return $this->typeResolver->resolve('SectionCarrouselElement');
        }

        throw new UserError('Could not resolve type of Node.');
    }
}
