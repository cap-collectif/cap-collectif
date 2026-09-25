<?php

namespace Capco\AppBundle\GraphQL\Resolver\LoginSettings;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class LoginSettingsQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * @return SiteParameter[]
     */
    public function __invoke(): array
    {
        $siteParameters = $this->repository->findBy(['category' => 'pages.login'], ['position' => 'ASC']);

        foreach ($siteParameters as $siteParameter) {
            $this->loadTranslations($siteParameter);
        }

        return $siteParameters;
    }

    private function loadTranslations(SiteParameter $siteParameter): void
    {
        $translations = $this->entityManager
            ->getRepository(SiteParameterTranslation::class)
            ->findBy(['translatable' => $siteParameter])
        ;
        foreach ($translations as $translation) {
            $siteParameter->addTranslation($translation);
        }
    }
}
