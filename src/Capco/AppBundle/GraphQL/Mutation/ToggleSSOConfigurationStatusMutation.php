<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ToggleSSOConfigurationStatusMutation implements MutationInterface
{
    private $em;
    private $repository;

    public function __construct(
        EntityManagerInterface $em,
        AbstractSSOConfigurationRepository $repository
    ) {
        $this->em = $em;
        $this->repository = $repository;
    }

    public function __invoke(Argument $input): array
    {
        $ssoConfigurationId = GlobalId::fromGlobalId($input->offsetGet('ssoConfigurationId'))['id'];
        $ssoConfiguration = $this->repository->find($ssoConfigurationId);

        if (!$ssoConfiguration) {
            throw new UserError('SSO configuration is not activated.');
        }

        $ssoConfiguration->setEnabled(!$ssoConfiguration->isEnabled());

        $this->em->flush();

        return compact('ssoConfiguration');
    }
}
