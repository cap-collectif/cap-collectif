<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ConsultationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve()
    {
        $all = $this->container
        ->get('capco.consultation_step.repository')->findAll();
        return $all;
    }

    public function resolveContributions($consultation)
    {
        return $this->container
        ->get('capco.opinion.repository')->findBy([
          'step' => $consultation->getId(),
        ]);
    }
}
