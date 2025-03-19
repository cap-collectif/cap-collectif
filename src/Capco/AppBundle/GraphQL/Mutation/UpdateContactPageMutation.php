<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Model\TranslationInterface;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Twig\SiteParameterRuntime;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Cache\CacheItemInterface;

class UpdateContactPageMutation implements MutationInterface
{
    use MutationTrait;
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
        'customcode' => self::CONTACT_PAGE_CODE_KEYNAME,
    ];

    public function __construct(private readonly SiteParameterRepository $siteParameterRepository, private readonly EntityManagerInterface $em, private readonly RedisCache $cache, private readonly MediaRepository $mediaRepository, private readonly SiteImageRepository $imageRepository, private readonly SiteParameterResolver $resolver, private readonly string $locale)
    {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $locale = $args->offsetGet('locale');
        $updated = $return = [];
        foreach (self::CONTACT_PARAMETERS as $graphqlKey => $dbKey) {
            if ($args->offsetExists($graphqlKey)) {
                $parameter = $this->getParameter($dbKey);
                $return[$graphqlKey] =
                    self::CONTACT_PAGE_PICTO_KEYNAME === $dbKey
                        ? $this->updateImageValue(
                            $parameter,
                            (string) $args->offsetGet($graphqlKey)
                        )
                        : $this->updateSiteParameterValue(
                            $parameter,
                            (string) $args->offsetGet($graphqlKey),
                            $locale
                        );
                $updated[] = $dbKey;
            }
        }

        if (empty($updated)) {
            throw new \RuntimeException('Site parameters not found');
        }

        $this->em->flush();
        foreach ($updated as $dbKey) {
            $this->cache->delete(SiteParameterRuntime::getCacheKey($dbKey, $this->locale));
            $data = $this->resolver->getValue($dbKey, $this->locale);
            /** @var CacheItemInterface $cachedItem */
            $cachedItem = $this->cache->getItem(
                SiteParameterRuntime::getCacheKey($dbKey, $this->locale)
            );
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $return;
    }

    private function updateImageValue(SiteImage $image, string $value): SiteImage
    {
        $image->setMedia($this->mediaRepository->find($value));

        return $image;
    }

    private function updateSiteParameterValue(
        SiteParameter $parameter,
        string $value,
        ?string $locale = null
    ): string {
        if ($parameter->isTranslatable()) {
            $updatedTranslation = $this->updateOldTranslationIfAny($parameter, $value, $locale);
            if (null === $updatedTranslation) {
                $updatedTranslation = $this->createAndPersistNewTranslation(
                    $parameter,
                    $value,
                    $locale
                );
            }

            return $updatedTranslation->getValue();
        }

        $parameter->setValue($value);

        return $parameter->getValue();
    }

    private function updateOldTranslationIfAny(
        SiteParameter $parameter,
        string $newTranslation,
        ?string $locale = null
    ): ?TranslationInterface {
        if (null === $locale) {
            return $this->updateDefaultTranslation($parameter, $newTranslation);
        }

        $oldTranslation = $this->em
            ->getRepository(SiteParameterTranslation::class)
            ->findOneBy(['translatable' => $parameter, 'locale' => $locale])
        ;
        if ($oldTranslation) {
            if ($oldTranslation->getLocale() === $locale) {
                $oldTranslation->setValue($newTranslation);
                $this->em->persist($oldTranslation);

                return $oldTranslation;
            }
        }

        return null;
    }

    private function updateDefaultTranslation(
        SiteParameter $parameter,
        string $newTranslation
    ): ?TranslationInterface {
        $parameter->setValue($newTranslation);
        $this->em->persist($parameter);

        return $parameter->getTranslations()->first() ?: null;
    }

    private function createAndPersistNewTranslation(
        SiteParameter $parameter,
        string $newValue,
        string $locale
    ): SiteParameterTranslation {
        $newTranslation = (new SiteParameterTranslation())
            ->setTranslatable($parameter)
            ->setLocale($locale)
            ->setValue($newValue)
        ;
        $this->em->persist($newTranslation);

        return $newTranslation;
    }

    private function getParameter(string $keyname)
    {
        $repo =
            self::CONTACT_PAGE_PICTO_KEYNAME === $keyname
                ? $this->imageRepository
                : $this->siteParameterRepository;

        return $repo->findOneBy(['keyname' => $keyname]);
    }
}
