<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SSO\FacebookSSOConfiguration;
use Capco\AppBundle\Repository\FacebookSSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateFacebookSSOConfigurationMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private FacebookSSOConfigurationRepository $repository;

    public function __construct(
        EntityManagerInterface $em,
        FacebookSSOConfigurationRepository $repository
    ) {
        $this->em = $em;
        $this->repository = $repository;
    }

    public function __invoke(Argument $input): array
    {
        $facebookSSOConfiguration = $this->getConfiguration();

        $facebookSSOConfiguration->setClientId($input->offsetGet('clientId'));
        $facebookSSOConfiguration->setSecret($input->offsetGet('secret'));
        $facebookSSOConfiguration->setEnabled($input->offsetGet('enabled'));

        $this->em->flush();

        return compact('facebookSSOConfiguration');
    }

    private function getConfiguration(): FacebookSSOConfiguration
    {
        $configuration = $this->repository->get();
        if (null === $configuration) {
            $configuration = new FacebookSSOConfiguration();
            $this->em->persist($configuration);
        }

        return $configuration;
    }
}
