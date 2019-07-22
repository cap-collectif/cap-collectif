<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class DeleteSSOConfigurationMutation implements MutationInterface
{
    private $em;
    private $logger;
    private $repository;

    public function __construct(
        EntityManagerInterface $em,
        AbstractSSOConfigurationRepository $repository,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->repository = $repository;
        $this->logger = $logger;
    }

    public function __invoke(Arg $input): array
    {
        $ssoConfigurationId = GlobalId::fromGlobalId($input->offsetGet('id'))['id'];

        $ssoConfiguration = $this->repository->find($ssoConfigurationId);

        if (!$ssoConfiguration) {
            $this->logger->error("Unknown SSO Configuration with id: ${ssoConfigurationId}");

            return [
                'userErrors' => [
                    [
                        'message' => 'SSO Configuration not found.'
                    ]
                ]
            ];
        }

        $this->em->remove($ssoConfiguration);
        $this->em->flush();

        return ['deletedSsoConfigurationId' => $input->offsetGet('id'), 'userErrors' => []];
    }
}
