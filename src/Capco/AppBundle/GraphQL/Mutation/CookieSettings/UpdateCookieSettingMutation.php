<?php

namespace Capco\AppBundle\GraphQL\Mutation\CookieSettings;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateCookieSettingMutation implements MutationInterface
{
    use MutationTrait;

    final public const COOKIE_PARAMETER_NOT_FOUND = 'COOKIE_PARAMETER_NOT_FOUND';
    final public const INVALID_VALUE = 'INVALID_VALUE';
    final public const CATEGORY = 'pages.cookies';
    // Same limit as the LessThanIfMetaDescription constraint on SiteParameter
    private const META_DESCRIPTION_MAX_LENGTH = 160;

    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly LocaleRepository $localeRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UpdateSiteParameterMutation $updateSiteParameterMutation,
        private readonly Manager $toggleManager
    ) {
    }

    /**
     * @return array{siteParameter?: SiteParameter, errorCode?: string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        try {
            $siteParameter = $this->getSiteParameter($input);
            $valuesByLocale = $this->resolveValuesByLocale(
                $siteParameter,
                (array) ($input->offsetGet('translations') ?? [])
            );
            foreach ($valuesByLocale as $value) {
                self::checkValue($siteParameter, $value);
            }

            $siteParameter->setIsEnabled((bool) $input->offsetGet('isEnabled'));
            foreach ($valuesByLocale as $locale => $value) {
                $this->updateValue($siteParameter, $value, $locale);
            }
            $this->entityManager->flush();
            // Earlier in the same request, site parameters may have been loaded with their translations
            // fetch-joined on the current locale only (see SiteParameterRepository::getValues(), run by
            // SiteParameterResolver when its cache is cold), which leaves a partially initialized
            // `translations` collection on this very entity in the identity map. Refreshing it discards that
            // partial collection so the payload exposes every translation as it is now stored.
            $this->entityManager->refresh($siteParameter);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        // Invalidate the cache of every locale that was actually edited, not the viewer's own locale:
        // the admin may browse in a locale different from the ones just saved.
        foreach (array_keys($valuesByLocale) as $locale) {
            $this->updateSiteParameterMutation->invalidateCache($siteParameter, $locale);
        }

        return ['siteParameter' => $siteParameter];
    }

    private function getSiteParameter(Argument $input): SiteParameter
    {
        $siteParameter = $this->repository->find($input->offsetGet('id'));

        if (!$siteParameter instanceof SiteParameter || self::CATEGORY !== $siteParameter->getCategory()) {
            throw new UserError(self::COOKIE_PARAMETER_NOT_FOUND);
        }

        return $siteParameter;
    }

    /**
     * @param array<int, array{locale: string, value: string}> $translations
     *
     * @return array<string, string> the values indexed by locale
     */
    private function resolveValuesByLocale(SiteParameter $siteParameter, array $translations): array
    {
        $valuesByLocale = [];
        foreach ($translations as $translation) {
            $valuesByLocale[(string) $translation['locale']] = (string) $translation['value'];
        }

        if ([] === $valuesByLocale) {
            return $valuesByLocale;
        }

        if ($siteParameter->isTranslatable() && $this->toggleManager->isActive(Manager::multilangue)) {
            return $valuesByLocale;
        }

        // A non-translatable setting has a single value, and without the multilangue feature the platform
        // only exposes its default locale: the value is stored under that locale whatever locale was sent.
        $defaultLocale = $this->localeRepository->getDefaultCode();

        return [$defaultLocale => $valuesByLocale[$defaultLocale] ?? array_values($valuesByLocale)[0]];
    }

    private static function checkValue(SiteParameter $siteParameter, string $value): void
    {
        if (SiteParameter::TYPE_INTEGER === (int) $siteParameter->getType() && (!ctype_digit($value) || (int) $value <= 0)) {
            throw new UserError(self::INVALID_VALUE);
        }

        if ($siteParameter->isSocialNetworkDescription() && mb_strlen($value) > self::META_DESCRIPTION_MAX_LENGTH) {
            throw new UserError(self::INVALID_VALUE);
        }
    }

    // Deliberately query SiteParameterTranslation directly instead of `SiteParameter::setValue($value,
    // $locale)` + `mergeNewTranslations()`: when the `translations` collection is only partially loaded in
    // the identity map, `translate()` misses the existing row of another locale and the flush tries to
    // INSERT a duplicate (translatable_id, locale), hitting the unique constraint intermittently.
    private function updateValue(SiteParameter $siteParameter, string $value, string $locale): void
    {
        if (!$siteParameter->isTranslatable()) {
            $siteParameter->setValue($value);

            return;
        }

        $translation = $this->entityManager
            ->getRepository(SiteParameterTranslation::class)
            ->findOneBy(['translatable' => $siteParameter, 'locale' => $locale])
        ;

        if ('' === trim($value)) {
            // An emptied value removes the translation, as `mergeNewTranslations()` does
            if ($translation) {
                $this->entityManager->remove($translation);
            }

            return;
        }

        if ($translation) {
            $translation->setValue($value);

            return;
        }

        $newTranslation = (new SiteParameterTranslation())
            ->setTranslatable($siteParameter)
            ->setLocale($locale)
            ->setValue($value)
        ;
        $this->entityManager->persist($newTranslation);
    }
}
