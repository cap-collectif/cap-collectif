<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Overblog\GraphQLBundle\Definition\Argument;

class ConsultationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve($args)
    {
        $repo = $this->container
        ->get('capco.consultation_step.repository');
        if (isset($args['id'])) {
          return [$repo->find($args['id'])];
        }
        return $repo->findAll();
    }

    public function resolveConsultationSections(ConsultationStep $consultation)
    {
      return $consultation->getConsultationStepType()->getOpinionTypes();
    }

    public function resolvePropositionArguments(Opinion $proposition, Argument $argument) {
        if ($argument->offsetExists('type')) {
          return $proposition->getArguments()->filter(function ($a) use ($argument) {
              return $a->getType() === $argument->offsetGet('type');
          });
        }
        return $proposition->getArguments();
    }

    public function resolvePropositionSection(Opinion $proposition)
    {
      return $proposition->getOpinionType();
    }

    public function resolveContributions(ConsultationStep $consultation)
    {
        return $this->container
        ->get('capco.opinion.repository')->findBy([
          'step' => $consultation->getId(),
        ]);
    }
}
