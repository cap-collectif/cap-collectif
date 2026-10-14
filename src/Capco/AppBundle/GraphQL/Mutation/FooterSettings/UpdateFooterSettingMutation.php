<?php

namespace Capco\AppBundle\GraphQL\Mutation\FooterSettings;

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

class UpdateFooterSettingMutation implements MutationInterface
{
    use MutationTrait;

    final public const FOOTER_PARAMETER_NOT_FOUND = 'FOOTER_PARAMETER_NOT_FOUND';
    final public const INVALID_VALUE = 'INVALID_VALUE';
    private const CATEGORY = 'pages.footer';
    private const META_DESCRIPTION_MAX_LENGTH = 160;

    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly LocaleRepository $localeRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UpdateSiteParameterMutation $updateSiteParameterMutation,
        private readonly Manager $toggleManager
    ) {
    }

    /** @return array{siteParameter?: SiteParameter, errorCode?: string} */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        try {
            $parameter = $this->getParameter($input);
            $values = $this->resolveValues($parameter, (array) ($input->offsetGet('translations') ?? []));
            foreach ($values as $value) {
                $this->checkValue($parameter, $value);
            }
            $parameter->setIsEnabled((bool) $input->offsetGet('isEnabled'));
            foreach ($values as $locale => $value) {
                $this->updateValue($parameter, $value, $locale);
            }
            $this->entityManager->flush();
            $this->entityManager->refresh($parameter);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        foreach (array_keys($values) as $locale) {
            $this->updateSiteParameterMutation->invalidateCache($parameter, $locale);
        }

        return ['siteParameter' => $parameter];
    }

    private function getParameter(Argument $input): SiteParameter
    {
        $parameter = $this->repository->find($input->offsetGet('id'));
        if (!$parameter instanceof SiteParameter || self::CATEGORY !== $parameter->getCategory()) {
            throw new UserError(self::FOOTER_PARAMETER_NOT_FOUND);
        }

        return $parameter;
    }

    /**
     * @param array<int, array{locale: string, value: string}> $translations
     *
     * @return array<string, string>
     */
    private function resolveValues(SiteParameter $parameter, array $translations): array
    {
        $values = [];
        foreach ($translations as $translation) {
            $values[(string) $translation['locale']] = (string) $translation['value'];
        }
        if ([] === $values || ($parameter->isTranslatable() && $this->toggleManager->isActive(Manager::multilangue))) {
            return $values;
        }

        $defaultLocale = $this->localeRepository->getDefaultCode();

        return [$defaultLocale => $values[$defaultLocale] ?? array_values($values)[0]];
    }

    private function checkValue(SiteParameter $parameter, string $value): void
    {
        if (SiteParameter::TYPE_INTEGER === (int) $parameter->getType() && (!ctype_digit($value) || (int) $value <= 0)) {
            throw new UserError(self::INVALID_VALUE);
        }
        if ($parameter->isSocialNetworkDescription() && mb_strlen($value) > self::META_DESCRIPTION_MAX_LENGTH) {
            throw new UserError(self::INVALID_VALUE);
        }
    }

    private function updateValue(SiteParameter $parameter, string $value, string $locale): void
    {
        if (!$parameter->isTranslatable()) {
            $parameter->setValue($value);

            return;
        }
        $repository = $this->entityManager->getRepository(SiteParameterTranslation::class);
        $translation = $repository->findOneBy(['translatable' => $parameter, 'locale' => $locale]);
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
            (new SiteParameterTranslation())->setTranslatable($parameter)->setLocale($locale)->setValue($value)
        );
    }
}
