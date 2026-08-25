<?php

namespace Capco\AppBundle\GraphQL\Mutation\SocialNetwork;

use Capco\AppBundle\Enum\SocialNetworkErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SocialNetworkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteSocialNetworkMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly SocialNetworkRepository $socialNetworkRepository
    ) {
    }

    /**
     * @return array{deletedSocialNetworkId?: string|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $globalId = (string) $input->offsetGet('id');
        $decodedId = GlobalId::fromGlobalId($globalId)['id'] ?? $globalId;

        $socialNetwork = $this->socialNetworkRepository->find($decodedId);
        if (!$socialNetwork) {
            return ['deletedSocialNetworkId' => null, 'errorCode' => SocialNetworkErrorCode::NOT_FOUND];
        }

        $this->entityManager->remove($socialNetwork);
        $this->entityManager->flush();

        return ['deletedSocialNetworkId' => $globalId, 'errorCode' => null];
    }
}
