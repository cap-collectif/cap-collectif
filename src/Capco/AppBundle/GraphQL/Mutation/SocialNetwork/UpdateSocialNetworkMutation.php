<?php

namespace Capco\AppBundle\GraphQL\Mutation\SocialNetwork;

use Capco\AppBundle\Entity\SocialNetwork;
use Capco\AppBundle\Enum\SocialNetworkErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\SocialNetworkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class UpdateSocialNetworkMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly SocialNetworkRepository $socialNetworkRepository,
        private readonly MediaRepository $mediaRepository
    ) {
    }

    /**
     * @return array{socialNetwork?: SocialNetwork|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $id = (string) $input->offsetGet('id');
        $decodedId = GlobalId::fromGlobalId($id)['id'] ?? $id;

        $socialNetwork = $this->socialNetworkRepository->find($decodedId);
        if (!$socialNetwork instanceof SocialNetwork) {
            return ['socialNetwork' => null, 'errorCode' => SocialNetworkErrorCode::NOT_FOUND];
        }

        $mediaId = $input->offsetGet('media');

        $socialNetwork
            ->setTitle((string) $input->offsetGet('title'))
            ->setLink((string) $input->offsetGet('link'))
            ->setPosition((int) $input->offsetGet('position'))
            ->setIsEnabled((bool) $input->offsetGet('isEnabled'))
        ;

        $socialNetwork->setMedia($mediaId ? $this->mediaRepository->find($mediaId) : null);

        $this->entityManager->flush();

        return ['socialNetwork' => $socialNetwork, 'errorCode' => null];
    }
}
