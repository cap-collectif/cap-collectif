<?php

namespace Capco\AppBundle\GraphQL\Mutation\FooterSocialNetwork;

use Capco\AppBundle\Entity\FooterSocialNetwork;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateFooterSocialNetworkMutation implements MutationInterface
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

        $position = $input->offsetGet('position');

        $footerSocialNetwork = (new FooterSocialNetwork())
            ->setTitle((string) $input->offsetGet('title'))
            ->setLink((string) $input->offsetGet('link'))
            ->setStyle((string) $input->offsetGet('style'))
            ->setPosition($position ?? $this->footerSocialNetworkRepository->getNextPosition())
        ;

        $isEnabled = $input->offsetGet('isEnabled');
        if (null !== $isEnabled) {
            $footerSocialNetwork->setIsEnabled($isEnabled);
        }

        $this->entityManager->persist($footerSocialNetwork);
        $this->entityManager->flush();

        return ['footerSocialNetwork' => $footerSocialNetwork, 'errorCode' => null];
    }
}
