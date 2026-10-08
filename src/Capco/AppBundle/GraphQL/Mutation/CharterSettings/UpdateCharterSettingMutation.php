<?php

namespace Capco\AppBundle\GraphQL\Mutation\CharterSettings;

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

class UpdateCharterSettingMutation implements MutationInterface
{
    use MutationTrait;

    final public const SITE_PARAMETER_NOT_FOUND = 'SITE_PARAMETER_NOT_FOUND';
    final public const CATEGORY = 'pages.charter';

    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly LocaleRepository $localeRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UpdateSiteParameterMutation $cacheInvalidator,
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
            $this->entityManager->refresh($siteParameter);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        $localesToInvalidate = array_keys($valuesByLocale);
        if ($isEnabledChanged) {
            $localesToInvalidate = array_unique([...$localesToInvalidate, ...$this->localeRepository->findEnabledLocalesCodes()]);
        }
        foreach ($localesToInvalidate as $locale) {
            $this->cacheInvalidator->invalidateCache($siteParameter, $locale);
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
     * @return array<string, string>
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

        $defaultLocale = $this->localeRepository->getDefaultCode();

        return [$defaultLocale => $valuesByLocale[$defaultLocale] ?? array_values($valuesByLocale)[0]];
    }

    private function updateValue(SiteParameter $siteParameter, string $value, string $locale): void
    {
        $translation = $this->entityManager
            ->getRepository(SiteParameterTranslation::class)
            ->findOneBy(['translatable' => $siteParameter, 'locale' => $locale])
        ;

        if ('' === trim($value)) {
            if ($translation) {
                $this->entityManager->remove($translation);
            }

            return;
        }

        if ($translation) {
            $translation->setValue($value);

            return;
        }

        $this->entityManager->persist(
            (new SiteParameterTranslation())->setTranslatable($siteParameter)->setLocale($locale)->setValue($value)
        );
    }
}
