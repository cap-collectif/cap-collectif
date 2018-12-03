<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\OtherStep;

class StepTypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractStep $step)
    {
        if ($step instanceof SelectionStep) {
            return $this->typeResolver->resolve('SelectionStep');
        }
        if ($step instanceof CollectStep) {
            return $this->typeResolver->resolve('CollectStep');
        }
        if ($step instanceof PresentationStep) {
            return $this->typeResolver->resolve('PresentationStep');
        }
        if ($step instanceof QuestionnaireStep) {
            return $this->typeResolver->resolve('QuestionnaireStep');
        }
        if ($step instanceof ConsultationStep) {
            return $this->typeResolver->resolve('InternalConsultation');
        }
        if ($step instanceof OtherStep) {
            return $this->typeResolver->resolve('OtherStep');
        }
        if ($step instanceof SynthesisStep) {
            return $this->typeResolver->resolve('SynthesisStep');
        }
        if ($step instanceof RankingStep) {
            return $this->typeResolver->resolve('RankingStep');
        }

        throw new UserError('Could not resolve type of Step.');
    }
}
