<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalFormResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveAll(): array
    {
        return $this->container->get('capco.proposal_form.repository')->findAll();
    }
}
