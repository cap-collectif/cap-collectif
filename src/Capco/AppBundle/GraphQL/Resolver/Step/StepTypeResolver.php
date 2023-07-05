<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;

class StepTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractStep $step): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($step instanceof SelectionStep) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewSelectionStep');
            }

            return $this->typeResolver->resolve('InternalSelectionStep');
        }
        if ($step instanceof CollectStep) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewCollectStep');
            }

            return $this->typeResolver->resolve('InternalCollectStep');
        }
        if ($step instanceof PresentationStep) {
            return $this->typeResolver->resolve('PresentationStep');
        }
        if ($step instanceof QuestionnaireStep) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewQuestionnaireStep');
            }

            return $this->typeResolver->resolve('InternalQuestionnaireStep');
        }
        if ($step instanceof ConsultationStep) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewConsultationStep');
            }

            return $this->typeResolver->resolve('InternalConsultationStep');
        }
        if ($step instanceof OtherStep) {
            return $this->typeResolver->resolve('OtherStep');
        }
        if ($step instanceof RankingStep) {
            return $this->typeResolver->resolve('RankingStep');
        }

        if ($step instanceof DebateStep) {
            return $this->typeResolver->resolve('InternalDebateStep');
        }

        throw new UserError('Could not resolve type of Step.');
    }
}
