<?php

namespace Capco\AppBundle\GraphQL\Mutation\LoginSettings;

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

class UpdateLoginSettingMutation implements MutationInterface
{
    use MutationTrait;

    final public const SITE_PARAMETER_NOT_FOUND = 'SITE_PARAMETER_NOT_FOUND';
    final public const CATEGORY = 'pages.login';

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
        $valuesByLocale = $this->resolveValuesByLocale((array) ($input->offsetGet('translations') ?? []));

        try {
            $siteParameter = $this->getSiteParameter($input);
            $isEnabled = (bool) $input->offsetGet('isEnabled');
            $isEnabledChanged = $siteParameter->getIsEnabled() !== $isEnabled;
            $siteParameter->setIsEnabled($isEnabled);
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

        // A translation change is locale-specific, but the enabled state is global to the site
        // parameter. Invalidate every enabled locale when it changes so public pages do not keep
        // an enabled/disabled value from their per-locale cache.
        $localesToInvalidate = array_keys($valuesByLocale);
        if ($isEnabledChanged) {
            $localesToInvalidate = array_unique([
                ...$localesToInvalidate,
                ...$this->localeRepository->findEnabledLocalesCodes(),
            ]);
        }

        // Do not default to the viewer's locale: the admin may browse in a locale different from
        // the translations just saved — see UpdateSiteParameterMutation::invalidateCache().
        foreach ($localesToInvalidate as $locale) {
            $this->updateSiteParameterMutation->invalidateCache($siteParameter, $locale);
        }

        return ['siteParameter' => $siteParameter];
    }

    private function getSiteParameter(Argument $input): SiteParameter
    {
        $siteParameter = $this->repository->find($input->offsetGet('id'));

        if (!$siteParameter instanceof SiteParameter || self::CATEGORY !== $siteParameter->getCategory()) {
            throw new UserError(self::SITE_PARAMETER_NOT_FOUND);
        }

        return $siteParameter;
    }

    /**
     * @param array<int, array{locale: string, value: string}> $translations
     *
     * @return array<string, string> the values indexed by locale
     */
    private function resolveValuesByLocale(array $translations): array
    {
        $valuesByLocale = [];
        foreach ($translations as $translation) {
            $valuesByLocale[(string) $translation['locale']] = (string) $translation['value'];
        }

        if ([] === $valuesByLocale || $this->toggleManager->isActive(Manager::multilangue)) {
            return $valuesByLocale;
        }

        // Without the multilangue feature the platform only exposes its default locale, so the value
        // is stored under that locale whatever locale the client sent.
        $defaultLocale = $this->localeRepository->getDefaultCode();

        return [$defaultLocale => $valuesByLocale[$defaultLocale] ?? array_values($valuesByLocale)[0]];
    }

    // Deliberately query SiteParameterTranslation directly instead of `SiteParameter::setValue($value,
    // $locale)` + `mergeNewTranslations()`: that pair relies on the `translations` collection (mapped
    // dynamically by TranslatableEventSubscriber as a *regular* LAZY OneToMany, not EXTRA_LAZY) being
    // properly initialized before `get($locale)`/`contains()` are called. In practice this was flaky
    // under load — same code, same input, alternating between correctly updating the existing row and
    // trying to INSERT a second row for the same (translatable_id, locale) and hitting the unique
    // constraint, seemingly depending on which PHP-FPM worker served the request. Querying the
    // repository directly sidesteps that lazy-collection edge case entirely.
    private function updateValue(SiteParameter $siteParameter, string $value, string $locale): void
    {
        $translation = $this->entityManager
            ->getRepository(SiteParameterTranslation::class)
            ->findOneBy(['translatable' => $siteParameter, 'locale' => $locale])
        ;

        if ('' === trim($value)) {
            // An emptied value removes the translation, as `mergeNewTranslations()` does for
            // translatable entities: the public side then simply has no text for this locale.
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
