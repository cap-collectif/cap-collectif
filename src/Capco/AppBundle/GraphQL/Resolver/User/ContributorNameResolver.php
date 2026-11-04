<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Enum\TranslationLocale;
use Capco\UserBundle\Entity\User;
use Symfony\Contracts\Translation\TranslatorInterface;

class ContributorNameResolver
{
    private const ANONYMIZED_NAME = 'global.user.anonymized';

    public function __construct(
        private readonly TranslatorInterface $translator
    ) {}

    public function resolveUsername(Author|ContributorInterface|DebateAnonymousArgument|null $contributor): ?string
    {
        $anonymized = $contributor instanceof DebateAnonymousArgument
            ? self::ANONYMIZED_NAME === $contributor->getUsername()
            : $contributor instanceof ContributorInterface && $contributor->isAnonymized();

        return $anonymized ? $this->anonymizedName() : $contributor?->getUsername();
    }

    public function resolveDisplayName(Participant|User $contributor): string
    {
        return $contributor->isAnonymized() ? $this->anonymizedName() : $contributor->getDisplayName();
    }

    public function anonymizedName(): string
    {
        $name = $this->translator->trans(self::ANONYMIZED_NAME, [], 'CapcoAppBundle');

        return '' === $name || self::ANONYMIZED_NAME === $name
            ? $this->translator->trans(self::ANONYMIZED_NAME, [], 'CapcoAppBundle', TranslationLocale::FR_FR)
            : $name;
    }
}
