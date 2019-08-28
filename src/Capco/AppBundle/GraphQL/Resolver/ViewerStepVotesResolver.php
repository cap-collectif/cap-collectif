<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use GraphQL\Executor\Promise\Promise;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;

class ViewerStepVotesResolver implements ResolverInterface
{
    use ResolverTrait;

    private $dataLoader;

    public function __construct(ViewerProposalVotesDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
    }

    public function __invoke(AbstractStep $step, ?User $viewer, Argument $args): Promise
    {
        $user = $this->preventNullableViewer($viewer);

        $args->offsetSet('stepId', $step->getId());

        return $this->dataLoader->load(compact('user', 'args'));
    }
}
