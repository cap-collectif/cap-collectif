<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Capco\AppBundle\Entiy\Opinion;

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

    public function resolvePropositionSection(Opinion $proposition)
    {
      return $proposition->getOpinionType();
    }

    public function resolveContributions($consultation)
    {
        return $this->container
        ->get('capco.opinion.repository')->findBy([
          'step' => $consultation->getId(),
        ]);
    }
}
