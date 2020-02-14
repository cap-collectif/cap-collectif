<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Twig\SiteParameterExtension;
use Capco\MediaBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateContactPageMutation implements MutationInterface
{
    private const CONTACT_PAGE_TITLE_KEYNAME = 'contact.title';
    private const CONTACT_PAGE_DESCRIPTION_KEYNAME = 'contact.content.body';
    private const CONTACT_PAGE_PICTO_KEYNAME = 'contact.picto';
    private const CONTACT_PAGE_META_KEYNAME = 'contact.metadescription';
    private const CONTACT_PAGE_CODE_KEYNAME = 'contact.customcode';
    private const CONTACT_PARAMETERS = [
        'title' => self::CONTACT_PAGE_TITLE_KEYNAME,
        'description' => self::CONTACT_PAGE_DESCRIPTION_KEYNAME,
        'picto' => self::CONTACT_PAGE_PICTO_KEYNAME,
        'metadescription' => self::CONTACT_PAGE_META_KEYNAME,
        'customcode' => self::CONTACT_PAGE_CODE_KEYNAME
    ];

    private $siteParameterRepository;
    private $imageRepository;
    private $em;
    private $cache;
    private $mediaRepository;

    public function __construct(
        SiteParameterRepository $siteParameterRepository,
        EntityManagerInterface $em,
        RedisCache $cache,
        MediaRepository $mediaRepository,
        SiteImageRepository $imageRepository
    ) {
        $this->em = $em;
        $this->cache = $cache;
        $this->imageRepository = $imageRepository;
        $this->mediaRepository = $mediaRepository;
        $this->siteParameterRepository = $siteParameterRepository;
    }

    public function __invoke(Argument $args): array
    {
        $locale = $args->offsetGet('locale');
        $updated = $return = [];
        foreach (self::CONTACT_PARAMETERS as $graphqlKey => $dbKey) {
            if ($args->offsetExists($graphqlKey)) {
                $parameter = $this->getParameter($dbKey);
                $return[$graphqlKey] = (self::CONTACT_PAGE_PICTO_KEYNAME === $dbKey) ?
                    $this->updateImageValue($parameter, (string) $args->offsetGet($graphqlKey)) :
                    $this->updateSiteParameterValue($parameter, (string) $args->offsetGet($graphqlKey), $locale);
                $updated[] = $dbKey;
            }
        }

        if (empty($updated)) {
            throw new \RuntimeException('Site parameters not found');
        }

        $this->em->flush();
        foreach ($updated as $dbKey) {
            $this->cache->deleteItem(SiteParameterExtension::CACHE_KEY . $dbKey);
        }

        return $return;
    }

    private function updateImageValue(SiteImage $image, string $value): SiteImage
    {
        $image->setMedia($this->mediaRepository->find($value));
        return $image;
    }

    private function updateSiteParameterValue(SiteParameter $parameter, string $value, ?string $locale = null): string
    {
        if ($parameter->isTranslatable()) {
            $updatedTranslation = $this->updateOldTranslationIfAny($parameter, $value, $locale);
            if (is_null($updatedTranslation)) {
                $updatedTranslation = $this->createAndPersistNewTranslation($parameter, $value, $locale);
            }

            return $updatedTranslation->getValue();
        }

        $parameter->setValue($value);
        return $parameter->getValue();
    }

    private function updateOldTranslationIfAny(SiteParameter $parameter, string $newTranslation, ?string $locale = null): ?SiteParameterTranslation
    {
        if (is_null($locale)) {
            return $this->updateDefaultTranslation($parameter, $newTranslation);
        }

        $oldTranslation = $this->em->getRepository(SiteParameterTranslation::class)->findOneBy(['translatable' => $parameter, 'locale' => $locale]);
        if ($oldTranslation) {
            if ($oldTranslation->getLocale() === $locale) {
                $oldTranslation->setValue($newTranslation);
                $this->em->persist($oldTranslation);

                return $oldTranslation;
            }
        }

        return null;
    }

    private function updateDefaultTranslation(SiteParameter $parameter, string $newTranslation): ?SiteParameterTranslation
    {
        $parameter->setValue($newTranslation);
        $this->em->persist($parameter);

        return ($parameter->getTranslations()->first()) ? $parameter->getTranslations()->first() :null;
    }

    private function createAndPersistNewTranslation(
        SiteParameter $parameter,
        string $newValue,
        string $locale
    ): SiteParameterTranslation {
        $newTranslation = (new SiteParameterTranslation())
            ->setTranslatable($parameter)
            ->setLocale($locale)
            ->setValue($newValue);
        $this->em->persist($newTranslation);

        return $newTranslation;
    }

    private function getParameter(string $keyname)
    {
        $repo = (self::CONTACT_PAGE_PICTO_KEYNAME === $keyname) ? $this->imageRepository : $this->siteParameterRepository;

        return $repo->findOneBy(['keyname' => $keyname]);
    }
}
