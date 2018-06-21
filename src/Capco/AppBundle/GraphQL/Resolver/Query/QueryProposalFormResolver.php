<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class QueryProposalFormResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function __invoke(): array
    {
        return $this->container->get('capco.proposal_form.repository')->findAll();
    }
}
