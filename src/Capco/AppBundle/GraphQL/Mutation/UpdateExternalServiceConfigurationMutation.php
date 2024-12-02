<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateExternalServiceConfigurationMutation implements MutationInterface
{
    use MutationTrait;

    final public const INVALID_VALUE = 'INVALID_VALUE';

    public function __construct(private readonly ExternalServiceConfigurationRepository $repository, private readonly EntityManagerInterface $em)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $externalServiceConfiguration = $this->getExternalServiceConfiguration($input);

        try {
            $externalServiceConfiguration->setValue($this->checkAndGetValue($input));
            $this->em->flush();

            return compact('externalServiceConfiguration');
        } catch (UserError $e) {
            $error = $e->getMessage();

            return compact('externalServiceConfiguration', 'error');
        }
    }

    private function getExternalServiceConfiguration(Argument $input): ExternalServiceConfiguration
    {
        return $this->repository->findOneByType($input->offsetGet('type'));
    }

    private function checkAndGetValue(Argument $input): string
    {
        $value = $input->offsetGet('value');
        if (
            !\in_array(
                $value,
                ExternalServiceConfiguration::AVAILABLE_VALUES[$input->offsetGet('type')]
            )
        ) {
            throw new UserError(self::INVALID_VALUE);
        }

        return $value;
    }
}
