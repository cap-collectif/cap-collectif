<?php

namespace Capco\AppBundle\GraphQL\Mutation\SocialNetwork;

use Capco\AppBundle\Entity\SocialNetwork;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateSocialNetworkMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly MediaRepository $mediaRepository
    ) {
    }

    /**
     * @return array{socialNetwork?: SocialNetwork|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $mediaId = $input->offsetGet('media');

        $socialNetwork = (new SocialNetwork())
            ->setTitle((string) $input->offsetGet('title'))
            ->setLink((string) $input->offsetGet('link'))
            ->setPosition((int) $input->offsetGet('position'))
            ->setIsEnabled((bool) ($input->offsetGet('isEnabled') ?? false))
        ;

        if ($mediaId) {
            $socialNetwork->setMedia($this->mediaRepository->find($mediaId));
        }

        $this->entityManager->persist($socialNetwork);
        $this->entityManager->flush();

        return ['socialNetwork' => $socialNetwork, 'errorCode' => null];
    }
}
