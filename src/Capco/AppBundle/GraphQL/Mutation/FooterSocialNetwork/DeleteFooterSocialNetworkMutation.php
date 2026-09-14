<?php

namespace Capco\AppBundle\GraphQL\Mutation\FooterSocialNetwork;

use Capco\AppBundle\Entity\FooterSocialNetwork;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteFooterSocialNetworkMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly FooterSocialNetworkRepository $footerSocialNetworkRepository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * @return array<string, string>
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $globalId = (string) $input->offsetGet('id');
        $id = GlobalId::fromGlobalId($globalId)['id'] ?? $globalId;
        $footerSocialNetwork = $this->footerSocialNetworkRepository->find($id);
        if (!$footerSocialNetwork instanceof FooterSocialNetwork) {
            throw new UserError(sprintf('FooterSocialNetwork with id: %s not found.', $id));
        }

        $this->entityManager->remove($footerSocialNetwork);
        $this->entityManager->flush();

        return ['deletedFooterSocialNetworkId' => $globalId];
    }
}
