<?php

namespace Capco\AppBundle\GraphQL\Resolver\SiteParameter;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SiteParameterQueryResolver implements QueryInterface
{
    private $repository;
    private $translationRepository;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->repository = $entityManager->getRepository(SiteParameter::class);
        $this->translationRepository = $entityManager->getRepository(
            SiteParameterTranslation::class
        );
    }

    public function __invoke(Argument $argument): ?SiteParameter
    {
        $siteParameter = $this->repository->findOneBy([
            'keyname' => $argument->offsetGet('keyname'),
        ]);
        if ($siteParameter && $siteParameter->isTranslatable()) {
            $this->loadTranslations($siteParameter);
        }

        return $siteParameter;
    }

    private function loadTranslations(SiteParameter $siteParameter): SiteParameter
    {
        $translations = $this->translationRepository->findBy(['translatable' => $siteParameter]);
        foreach ($translations as $translation) {
            $siteParameter->addTranslation($translation);
        }

        return $siteParameter;
    }
}
