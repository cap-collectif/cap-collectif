<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateHubApiGreenConfigurationMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly ExternalServiceConfigurationRepository $repository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    /**
     * @return array{configuration: array{isConfigured: bool}}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $token = trim((string) $input->offsetGet('token'));

        if ('' === $token) {
            throw new UserError('The Hub API Green token cannot be empty.');
        }

        $configuration = $this->repository->findHubApiGreenToken();
        if (!$configuration) {
            $configuration = new ExternalServiceConfiguration();
            $configuration->setType(ExternalServiceConfiguration::HUB_API_GREEN_TOKEN);
            $this->em->persist($configuration);
        }
        $configuration->setValue($token);

        $this->em->flush();

        return ['configuration' => ['isConfigured' => true]];
    }
}
