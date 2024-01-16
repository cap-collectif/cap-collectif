<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateCASSSOConfigurationMutation implements MutationInterface
{
    use MutationTrait;
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $configuration = new CASSSOConfiguration();
        $configuration->setName($input->offsetGet('name'));
        $configuration->setCasServerUrl($input->offsetGet('casServerUrl'));
        $configuration->setCasVersion($input->offsetGet('casVersion'));
        $configuration->setCasCertificateFile(self::generateFile($input));

        $this->em->persist($configuration);
        $this->em->flush();

        return ['ssoConfiguration' => $configuration];
    }

    private static function generateFile(Argument $input): string
    {
        $path = getenv('SYMFONY_CAS_CERTIFICATE_DIRECTORY');
        is_dir($path) || mkdir($path);
        $fileURI = $path . '/' . str_replace('', '_', $input->offsetGet('name')) . '.crt';
        file_put_contents($fileURI, $input->offsetGet('casCertificate'));

        return $fileURI;
    }
}
