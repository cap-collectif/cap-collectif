<?php

namespace Capco\AppBundle\GraphQL\Resolver\CollectStep;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\ProposalForm\ProposalFormViewerProposalsUnpublishedResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CollectStepViewerProposalsUnpublishedResolver implements QueryInterface
{
    private $resolver;

    public function __construct(ProposalFormViewerProposalsUnpublishedResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(CollectStep $collectStep, Argument $args, User $user)
    {
        return $this->resolver->__invoke($collectStep->getProposalForm(), $args, $user);
    }
}
