<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ToggleSSOConfigurationStatusMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private EntityManagerInterface $em, private AbstractSSOConfigurationRepository $repository)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
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
