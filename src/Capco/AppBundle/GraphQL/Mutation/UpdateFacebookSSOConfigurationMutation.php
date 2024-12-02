<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SSO\FacebookSSOConfiguration;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\FacebookSSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateFacebookSSOConfigurationMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly FacebookSSOConfigurationRepository $repository)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $facebookSSOConfiguration = $this->getConfiguration();

        $facebookSSOConfiguration->setClientId($input->offsetGet('clientId'));
        $facebookSSOConfiguration->setSecret($input->offsetGet('secret'));
        $facebookSSOConfiguration->setEnabled($input->offsetGet('enabled'));
        $facebookSSOConfiguration->setName('Facebook');

        $this->em->flush();

        return compact('facebookSSOConfiguration');
    }

    private function getConfiguration(): FacebookSSOConfiguration
    {
        $configuration = $this->repository->findOneBy([]);
        if (null === $configuration) {
            $configuration = new FacebookSSOConfiguration();
            $this->em->persist($configuration);
        }

        return $configuration;
    }
}
