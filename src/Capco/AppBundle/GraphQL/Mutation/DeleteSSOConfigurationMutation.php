<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class DeleteSSOConfigurationMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private EntityManagerInterface $em,
        private AbstractSSOConfigurationRepository $repository,
        private LoggerInterface $logger
    ) {
    }

    public function __invoke(Arg $input): array
    {
        $this->formatInput($input);
        $ssoConfigurationId = GlobalId::fromGlobalId($input->offsetGet('id'))['id'];

        $ssoConfiguration = $this->repository->find($ssoConfigurationId);

        if (!$ssoConfiguration) {
            $this->logger->error("Unknown SSO Configuration with id: {$ssoConfigurationId}");

            return [
                'userErrors' => [
                    [
                        'message' => 'SSO Configuration not found.',
                    ],
                ],
            ];
        }

        $this->em->remove($ssoConfiguration);
        $this->em->flush();

        return ['deletedSsoConfigurationId' => $input->offsetGet('id'), 'userErrors' => []];
    }
}
