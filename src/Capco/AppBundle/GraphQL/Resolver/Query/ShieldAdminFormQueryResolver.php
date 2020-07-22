<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ShieldAdminFormQueryResolver implements ResolverInterface
{
    protected $toggleManager;
    protected $siteParameterRepository;
    protected $siteImageRepository;
    protected $siteParameterTranslationRepository;

    public function __construct(Manager $toggleManager, EntityManagerInterface $entityManager)
    {
        $this->toggleManager = $toggleManager;
        $this->siteParameterRepository = $entityManager->getRepository(SiteParameter::class);
        $this->siteParameterTranslationRepository = $entityManager->getRepository(
            SiteParameterTranslation::class
        );
        $this->siteImageRepository = $entityManager->getRepository(SiteImage::class);
    }

    public function __invoke(): array
    {
        $introductionText = $this->loadIntroduction();

        $translations = [];
        foreach ($introductionText->getTranslations() as $translation) {
            $translations[] = [
                'locale' => $translation->getLocale(),
                'introduction' => $translation->getValue(),
            ];
        }

        $logo = $this->siteImageRepository->findOneBy(['keyname' => 'image.shield']);

        return [
            'shieldMode' => $this->toggleManager->isActive('shield_mode'),
            'introduction' => $introductionText ? $introductionText->getValue() : null,
            'media' => $logo ? $logo->getMedia() : null,
            'translations' => $translations,
        ];
    }

    private function loadIntroduction(): SiteParameter
    {
        $introduction = $this->siteParameterRepository->findOneBy([
            'keyname' => 'shield.introduction',
        ]);

        $translations = $this->siteParameterTranslationRepository->findBy([
            'translatable' => $introduction,
        ]);

        foreach ($translations as $translation) {
            $introduction->addTranslation($translation);
        }

        return $introduction;
    }
}
