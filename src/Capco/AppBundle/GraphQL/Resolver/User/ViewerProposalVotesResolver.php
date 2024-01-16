<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\UserBundle\Entity\User;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ViewerProposalVotesResolver implements QueryInterface
{
    private ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader;

    public function __construct(ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader)
    {
        $this->viewerProposalVotesDataLoader = $viewerProposalVotesDataLoader;
    }

    public function __invoke(User $user, Argument $args): Promise
    {
        return $this->viewerProposalVotesDataLoader->load(compact('user', 'args'));
    }
}
