<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use GraphQL\Executor\Promise\Promise;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerProposalVotesResolver implements ResolverInterface
{
    private $viewerProposalVotesDataLoader;

    public function __construct(ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader)
    {
        $this->viewerProposalVotesDataLoader = $viewerProposalVotesDataLoader;
    }

    public function __invoke(User $user, Argument $args): Promise
    {
        return $this->viewerProposalVotesDataLoader->load(compact('user', 'args'));
    }
}
