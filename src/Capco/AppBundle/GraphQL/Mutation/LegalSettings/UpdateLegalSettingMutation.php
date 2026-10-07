<?php

namespace Capco\AppBundle\GraphQL\Mutation\LegalSettings;

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

class UpdateLegalSettingMutation implements MutationInterface
{
    use MutationTrait;

    final public const LEGAL_PARAMETER_NOT_FOUND = 'LEGAL_PARAMETER_NOT_FOUND';
    final public const INVALID_VALUE = 'INVALID_VALUE';
    final public const CATEGORY = 'pages.legal';
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
            // The current request may have loaded translations for only one locale. Refreshing makes the
            // mutation payload expose every stored translation.
            $this->entityManager->refresh($siteParameter);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        // The edited locale can differ from the viewer locale.
        foreach (array_keys($valuesByLocale) as $locale) {
            $this->updateSiteParameterMutation->invalidateCache($siteParameter, $locale);
        }

        return ['siteParameter' => $siteParameter];
    }

    private function getSiteParameter(Argument $input): SiteParameter
    {
        $siteParameter = $this->repository->find($input->offsetGet('id'));

        if (!$siteParameter instanceof SiteParameter || self::CATEGORY !== $siteParameter->getCategory()) {
            throw new UserError(self::LEGAL_PARAMETER_NOT_FOUND);
        }

        return $siteParameter;
    }

    /**
     * @param array<int, array{locale: string, value: string}> $translations
     *
     * @return array<string, string>
     */
    private function resolveValuesByLocale(SiteParameter $siteParameter, array $translations): array
    {
        $valuesByLocale = [];
        foreach ($translations as $translation) {
            $valuesByLocale[(string) $translation['locale']] = (string) $translation['value'];
        }

        if ([] === $valuesByLocale || ($siteParameter->isTranslatable() && $this->toggleManager->isActive(Manager::multilangue))) {
            return $valuesByLocale;
        }

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

    // Query translations directly: a partially loaded Doctrine collection can otherwise insert duplicates.
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
