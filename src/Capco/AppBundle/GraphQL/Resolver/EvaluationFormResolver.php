<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Questionnaire;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class EvaluationFormResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveQuestions(Questionnaire $evaluationForm): Collection
    {
        return $evaluationForm->getRealQuestions();
    }
}
