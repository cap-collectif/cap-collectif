<?php
namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Group;
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
            return $this->typeResolver->resolve('Project');
        }
        if ($node instanceof Questionnaire) {
            if ($currentSchemaName === 'public') {
                return $this->typeResolver->resolve('PublicQuestionnaire');
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
            return $this->typeResolver->resolve('Proposal');
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
            if ($currentSchemaName === 'public') {
                return $this->typeResolver->resolve('PublicUser');
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
            return $this->typeResolver->resolve('CollectStep');
        }
        if ($node instanceof PresentationStep) {
            return $this->typeResolver->resolve('PresentationStep');
        }
        if ($node instanceof QuestionnaireStep) {
            return $this->typeResolver->resolve('QuestionnaireStep');
        }
        if ($node instanceof ConsultationStep) {
            if ($currentSchemaName === 'public') {
                return $this->typeResolver->resolve('PublicConsultation');
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
            if ($currentSchemaName === 'preview') {
                return $this->typeResolver->resolve('PreviewEvent');
            }
            return $this->typeResolver->resolve('InternalEvent');
        }
        if ($node instanceof Reply) {
            return $this->typeResolver->resolve('Reply');
        }
        if ($node instanceof Follower) {
            return $this->typeResolver->resolve('Follower');
        }
        if ($node instanceof Post) {
            return $this->typeResolver->resolve('Post');
        }
        if ($node instanceof Requirement) {
            return $this->requirementTypeResolver->__invoke($node);
        }

        throw new UserError('Could not resolve type of Node.');
    }
}
