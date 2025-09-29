<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ParticipantProposalVotesResolver implements QueryInterface
{
    public function __construct(
        private readonly ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader
    ) {
    }

    public function __invoke(Participant $participant, Argument $args): Promise
    {
        $participantToken = base64_encode($participant->getToken());
        $args->offsetSet('token', $participantToken);

        return $this->viewerProposalVotesDataLoader->load(['user' => null, 'args' => $args]);
    }
}
