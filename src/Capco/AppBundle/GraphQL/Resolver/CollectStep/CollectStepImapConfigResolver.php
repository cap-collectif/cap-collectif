<?php

namespace Capco\AppBundle\GraphQL\Resolver\CollectStep;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Security\StepVoter;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CollectStepImapConfigResolver implements QueryInterface
{
    public function __construct(
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    /**
     * @return array{
     *     id: string|null,
     *     serverUrl: string|null,
     *     folder: string|null,
     *     email: string|null,
     *     password: string|null
     * }
     */
    public function __invoke(CollectStep $collectStep): array
    {
        $config = $collectStep->getCollectStepImapServerConfig();

        return [
            'id' => $config->getId(),
            'serverUrl' => $config->getServerUrl(),
            'folder' => $config->getFolder(),
            'email' => $config->getEmail(),
            'password' => $config->getPassword(),
        ];
    }

    public function isGranted(CollectStep $collectStep): bool
    {
        return $this->authorizationChecker->isGranted(StepVoter::EDIT, $collectStep);
    }
}
