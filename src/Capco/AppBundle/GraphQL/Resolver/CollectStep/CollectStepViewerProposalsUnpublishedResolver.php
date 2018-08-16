<?php
namespace Capco\AppBundle\GraphQL\Resolver\CollectStep;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\ProposalForm\ProposalFormViewerProposalsUnpublishedResolver;

class CollectStepViewerProposalsUnpublishedResolver implements ResolverInterface
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
