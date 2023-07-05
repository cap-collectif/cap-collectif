<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateCASSSOConfigurationMutation implements MutationInterface
{
    public const CONFIGURATION_NOT_FOUND = 'CONFIGURATION_NOT_FOUND';

    private EntityManagerInterface $em;
    private GlobalIdResolver $resolver;

    public function __construct(EntityManagerInterface $em, GlobalIdResolver $resolver)
    {
        $this->em = $em;
        $this->resolver = $resolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        try {
            $configuration = $this->getConfiguration($input, $viewer);
            self::updateConfiguration($input, $configuration);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        $this->em->flush();

        return ['ssoConfiguration' => $configuration];
    }

    private static function updateConfiguration(
        Argument $input,
        CASSSOConfiguration $configuration
    ): void {
        $configuration->setName($input->offsetGet('name'));
        $configuration->setCasServerUrl($input->offsetGet('casServerUrl'));
        $configuration->setCasVersion($input->offsetGet('casVersion'));

        file_put_contents(
            $configuration->getCasCertificateFile(),
            $input->offsetGet('casCertificate')
        );
    }

    private function getConfiguration(Argument $input, User $viewer): CASSSOConfiguration
    {
        $configuration = $this->resolver->resolve($input->offsetGet('id'), $viewer);
        if (!($configuration instanceof CASSSOConfiguration)) {
            throw new UserError(self::CONFIGURATION_NOT_FOUND);
        }

        return $configuration;
    }
}
