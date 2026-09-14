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

class UpdateFooterSocialNetworkMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly FooterSocialNetworkRepository $footerSocialNetworkRepository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * @return array{footerSocialNetwork: FooterSocialNetwork|null, errorCode: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        if ($errorCode = FooterSocialNetworkInputValidator::getErrorCode($input)) {
            return ['footerSocialNetwork' => null, 'errorCode' => $errorCode];
        }

        $globalId = (string) $input->offsetGet('id');
        $id = GlobalId::fromGlobalId($globalId)['id'] ?? $globalId;
        $footerSocialNetwork = $this->footerSocialNetworkRepository->find($id);
        if (!$footerSocialNetwork instanceof FooterSocialNetwork) {
            throw new UserError(sprintf('FooterSocialNetwork with id: %s not found.', $id));
        }

        $title = $input->offsetGet('title');
        if (null !== $title) {
            $footerSocialNetwork->setTitle($title);
        }

        $link = $input->offsetGet('link');
        if (null !== $link) {
            $footerSocialNetwork->setLink($link);
        }

        $style = $input->offsetGet('style');
        if (null !== $style) {
            $footerSocialNetwork->setStyle($style);
        }

        $isEnabled = $input->offsetGet('isEnabled');
        if (null !== $isEnabled) {
            $footerSocialNetwork->setIsEnabled($isEnabled);
        }

        $position = $input->offsetGet('position');
        if (null !== $position) {
            $footerSocialNetwork->setPosition($position);
        }

        $this->entityManager->flush();

        return ['footerSocialNetwork' => $footerSocialNetwork, 'errorCode' => null];
    }
}
