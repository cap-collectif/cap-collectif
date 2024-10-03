<?php

namespace Capco\AppBundle\GraphQL\Resolver\SiteParameter;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\Security\SiteParameterVoter;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class SiteParameterQueryResolver implements QueryInterface
{
    private $repository;
    private $translationRepository;
    private AuthorizationChecker $authorizationChecker;

    public function __construct(EntityManagerInterface $entityManager, AuthorizationChecker $authorizationChecker)
    {
        $this->repository = $entityManager->getRepository(SiteParameter::class);
        $this->translationRepository = $entityManager->getRepository(
            SiteParameterTranslation::class
        );
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $argument): ?SiteParameter
    {
        $siteParameter = $this->repository->findOneBy([
            'keyname' => $argument->offsetGet('keyname'),
        ]);

        if (!$siteParameter || !$siteParameter->getIsEnabled()) {
            return null;
        }

        if (!$this->isGranted($siteParameter)) {
            throw new AccessDeniedException();
        }

        if ($siteParameter->isTranslatable()) {
            $this->loadTranslations($siteParameter);
        }

        return $siteParameter;
    }

    public function isGranted(SiteParameter $siteParameter): bool
    {
        return $this->authorizationChecker->isGranted(SiteParameterVoter::VIEW, $siteParameter);
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
