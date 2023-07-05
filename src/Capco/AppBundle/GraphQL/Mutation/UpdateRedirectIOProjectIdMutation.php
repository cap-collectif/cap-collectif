<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateRedirectIOProjectIdMutation implements MutationInterface
{
    private const REDIRECTION_IO_PROJECT_ID_PARAM_KEY = 'redirectionio.project.id';
    private $siteParameterRepository;
    private $em;

    public function __construct(
        SiteParameterRepository $siteParameterRepository,
        EntityManagerInterface $em
    ) {
        $this->em = $em;
        $this->siteParameterRepository = $siteParameterRepository;
    }

    public function __invoke(Argument $args): array
    {
        $parameter = $this->siteParameterRepository->findOneBy([
            'keyname' => self::REDIRECTION_IO_PROJECT_ID_PARAM_KEY,
        ]);

        if (null === $parameter) {
            throw new \RuntimeException('Site parameter not found');
        }

        $savedValue = $this->updateSiteParameterValue(
            $parameter,
            (string) $args->offsetGet('projectId')
        );

        if (empty($savedValue)) {
            throw new \RuntimeException('Site parameters not found');
        }

        $this->em->flush();

        return [
            'projectId' => $savedValue,
        ];
    }

    private function updateSiteParameterValue(SiteParameter $parameter, string $value): string
    {
        $parameter->setValue($value);

        return $parameter->getValue();
    }
}
