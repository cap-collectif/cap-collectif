<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\CustomCodeVersion;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\Repository\CustomCodeVersionRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Validator\Constraints\ValidCustomCodeContent;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CustomCodeVersioningService
{
    final public const INVALID_KEYNAME = 'INVALID_KEYNAME';
    final public const INVALID_CONTENT = 'INVALID_CONTENT';
    final public const INVALID_METADATA = 'INVALID_METADATA';
    final public const INVALID_REFERENCE_URL = 'INVALID_REFERENCE_URL';
    final public const NO_CHANGES = 'NO_CHANGES';
    final public const CONFLICT = 'CONFLICT';
    final public const VERSION_NOT_FOUND = 'VERSION_NOT_FOUND';
    final public const DEFAULT_VERSIONS_LIMIT = 5;

    final public const ALLOWED_KEYNAMES = [
        'global.site.embed_js',
        'homepage.customcode',
        'registration.customcode',
        'event.customcode',
        'blog.customcode',
        'themes.customcode',
        'projects.customcode',
        'members.customcode',
        'contact.customcode',
    ];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly CustomCodeVersionRepository $customCodeVersionRepository,
        private readonly SiteParameterRepository $siteParameterRepository,
        private readonly UpdateSiteParameterMutation $updateSiteParameterMutation,
        private readonly ValidatorInterface $validator
    ) {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getConfiguration(int $versionsLimit = self::DEFAULT_VERSIONS_LIMIT): array
    {
        $versionsLimit = max(1, min($versionsLimit, 50));

        return array_map(function (string $keyname) use ($versionsLimit): array {
            $siteParameter = $this->getSiteParameter($keyname);
            $activeContent = $siteParameter?->getValue();
            $versions = $this->getVersionMetadataPage($keyname, $versionsLimit + 1);
            $versionsCount = $this->customCodeVersionRepository->countByKeyname($keyname);

            return [
                'id' => $keyname,
                'keyname' => $keyname,
                'label' => self::getLabel($keyname),
                'description' => self::getDescription($keyname),
                'activeContent' => $activeContent,
                'activeContentHash' => self::hashContent($activeContent),
                'versions' => \array_slice($versions, 0, $versionsLimit),
                'hasMoreVersions' => \count($versions) > $versionsLimit,
                'versionsCount' => $versionsCount,
            ];
        }, self::ALLOWED_KEYNAMES);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getVersionMetadataPage(string $keyname, int $limit, int $offset = 0): array
    {
        $this->assertAllowedKeyname($keyname);

        return $this->customCodeVersionRepository->findLatestMetadataByKeyname(
            $keyname,
            max(1, min($limit, 50)),
            max(0, $offset)
        );
    }

    public function commit(
        string $keyname,
        ?string $content,
        string $title,
        string $authorName,
        ?string $description,
        ?string $referenceUrl,
        string $baseContentHash,
        ?User $createdByUser = null
    ): CustomCodeVersion {
        $this->assertAllowedKeyname($keyname);
        $this->assertContentIsValid($content);
        $this->assertMetadataIsValid($title, $authorName);
        $this->assertReferenceUrlIsValid($referenceUrl);

        return $this->createVersion(
            $keyname,
            $content,
            $title,
            $authorName,
            $description,
            $referenceUrl,
            $baseContentHash,
            CustomCodeVersion::TYPE_COMMIT,
            null,
            $createdByUser
        );
    }

    public function restore(
        string $versionId,
        string $title,
        string $authorName,
        ?string $description,
        ?string $referenceUrl,
        string $baseContentHash,
        ?User $createdByUser = null
    ): CustomCodeVersion {
        $this->assertMetadataIsValid($title, $authorName);
        $this->assertReferenceUrlIsValid($referenceUrl);

        $versionToRestore = $this->customCodeVersionRepository->find($versionId);
        if (!$versionToRestore instanceof CustomCodeVersion) {
            throw new UserError(self::VERSION_NOT_FOUND);
        }

        return $this->createVersion(
            $versionToRestore->getKeyname(),
            $versionToRestore->getContent(),
            $title,
            $authorName,
            $description,
            $referenceUrl,
            $baseContentHash,
            CustomCodeVersion::TYPE_RESTORE,
            $versionToRestore,
            $createdByUser
        );
    }

    public static function hashContent(?string $content): string
    {
        return hash('sha256', $content ?? '');
    }

    /**
     * @return null|array<string, mixed>
     */
    public function getVersion(string $versionId, bool $includeContent = true): ?array
    {
        $version = $this->customCodeVersionRepository->find($versionId);

        return $version instanceof CustomCodeVersion ? self::normalizeVersion($version, $includeContent) : null;
    }

    /**
     * @return array<string, mixed>
     */
    public static function normalizeVersion(CustomCodeVersion $version, bool $includeContent = false): array
    {
        $normalizedVersion = [
            'id' => GlobalId::toGlobalId('CustomCodeVersion', $version->getId()),
            'keyname' => $version->getKeyname(),
            'title' => $version->getTitle(),
            'authorName' => $version->getAuthorName(),
            'description' => $version->getDescription(),
            'referenceUrl' => $version->getReferenceUrl(),
            'contentHash' => $version->getContentHash(),
            'previousContentHash' => $version->getPreviousContentHash(),
            'type' => $version->getType(),
            'restoredFromVersion' => $version->getRestoredFromVersion()
                ? self::normalizeVersion($version->getRestoredFromVersion(), false)
                : null,
            'createdByUserId' => $version->getCreatedByUserId(),
            'createdAt' => $version->getCreatedAt(),
        ];

        if ($includeContent) {
            $normalizedVersion['content'] = $version->getContent();
        }

        return $normalizedVersion;
    }

    public static function getLabel(string $keyname): string
    {
        return match ($keyname) {
            'homepage.customcode' => 'Accueil',
            'registration.customcode' => 'Inscription',
            'event.customcode' => 'Événements',
            'blog.customcode' => 'Actualités',
            'themes.customcode' => 'Thèmes',
            'projects.customcode' => 'Projets',
            'members.customcode' => 'Membres',
            'contact.customcode' => 'Contact',
            'global.site.embed_js' => 'Toutes les pages',
            default => $keyname,
        };
    }

    public static function getDescription(string $keyname): string
    {
        return match ($keyname) {
            'homepage.customcode' => 'Code injecté sur la page d’accueil.',
            'registration.customcode' => 'Code injecté sur le parcours d’inscription.',
            'event.customcode' => 'Code injecté sur les pages de liste des événements.',
            'blog.customcode' => 'Code injecté sur la page de liste des actualités.',
            'themes.customcode' => 'Code injecté sur les pages de thèmes.',
            'projects.customcode' => 'Code injecté sur les pages de liste des projets.',
            'members.customcode' => 'Code injecté sur les pages des membres.',
            'contact.customcode' => 'Code injecté sur la page de contact.',
            'global.site.embed_js' => 'Code injecté globalement sur toutes les pages.',
            default => '',
        };
    }

    private function createVersion(
        string $keyname,
        ?string $content,
        string $title,
        string $authorName,
        ?string $description,
        ?string $referenceUrl,
        string $baseContentHash,
        string $type,
        ?CustomCodeVersion $restoredFromVersion,
        ?User $createdByUser
    ): CustomCodeVersion {
        $this->assertAllowedKeyname($keyname);
        // Validation errors must roll back without closing the entity manager.
        [$version, $siteParameter] = $this->entityManager->getConnection()->transactional(function () use (
            $keyname,
            $content,
            $title,
            $authorName,
            $description,
            $referenceUrl,
            $baseContentHash,
            $type,
            $restoredFromVersion,
            $createdByUser
        ): array {
            $siteParameter = $this->getRequiredSiteParameter($keyname);
            $activeContent = $siteParameter->getValue();
            $activeContentHash = self::hashContent($activeContent);
            $newContentHash = self::hashContent($content);

            if ($activeContentHash !== $baseContentHash) {
                throw new UserError(self::CONFLICT);
            }

            if ($newContentHash === $activeContentHash) {
                throw new UserError(self::NO_CHANGES);
            }

            $version = (new CustomCodeVersion())
                ->setKeyname($keyname)
                ->setTitle(trim($title))
                ->setAuthorName(self::capitalizeAuthorName($authorName))
                ->setDescription($description ? trim($description) : null)
                ->setReferenceUrl($referenceUrl ? trim($referenceUrl) : null)
                ->setContent($content)
                ->setContentHash($newContentHash)
                ->setPreviousContentHash($activeContentHash)
                ->setType($type)
                ->setRestoredFromVersion($restoredFromVersion)
                ->setCreatedByUserId($createdByUser?->getId())
            ;

            $this->entityManager->persist($version);
            $siteParameter->setValue($content);
            $this->entityManager->flush();

            return [$version, $siteParameter];
        });

        $this->updateSiteParameterMutation->invalidateCache($siteParameter);

        return $version;
    }

    private function getRequiredSiteParameter(string $keyname): SiteParameter
    {
        // Refresh already-managed entities with the value read under the lock.
        $siteParameter = $this->siteParameterRepository->createQueryBuilder('parameter')
            ->where('parameter.keyname = :keyname')
            ->setParameter('keyname', $keyname)
            ->getQuery()
            ->setLockMode(LockMode::PESSIMISTIC_WRITE)
            ->setHint(Query::HINT_REFRESH, true)
            ->getOneOrNullResult()
        ;
        if (!$siteParameter instanceof SiteParameter) {
            throw new UserError(self::INVALID_KEYNAME);
        }

        return $siteParameter;
    }

    private function getSiteParameter(string $keyname): ?SiteParameter
    {
        return $this->siteParameterRepository->findOneByKeyname($keyname);
    }

    private static function capitalizeAuthorName(string $authorName): string
    {
        $normalizedAuthorName = preg_replace('/\s+/', ' ', trim($authorName)) ?? trim($authorName);

        return preg_replace_callback(
            '/(^|[\s\'-])(\p{L})/u',
            static fn (array $matches): string => $matches[1] . mb_strtoupper($matches[2], 'UTF-8'),
            $normalizedAuthorName
        ) ?? $normalizedAuthorName;
    }

    private function assertAllowedKeyname(string $keyname): void
    {
        $violations = $this->validator->validate($keyname, [
            new Assert\Choice(['choices' => self::ALLOWED_KEYNAMES]),
        ]);

        if ($violations->count() > 0) {
            throw new UserError(self::INVALID_KEYNAME);
        }
    }

    private function assertReferenceUrlIsValid(?string $referenceUrl): void
    {
        if (null === $referenceUrl || '' === trim($referenceUrl)) {
            return;
        }

        $violations = $this->validator->validate(trim($referenceUrl), [
            new Assert\Url(['protocols' => ['https']]),
            new Assert\Length(['max' => 2048]),
        ]);

        if ($violations->count() > 0) {
            throw new UserError(self::INVALID_REFERENCE_URL);
        }
    }

    private function assertMetadataIsValid(string $title, string $authorName): void
    {
        $violations = $this->validator->validate(['title' => trim($title), 'authorName' => trim($authorName)], [
            new Assert\Collection([
                'title' => [new Assert\NotBlank(), new Assert\Length(['max' => 255])],
                'authorName' => [new Assert\NotBlank(), new Assert\Length(['max' => 120])],
            ]),
        ]);

        if ($violations->count() > 0) {
            throw new UserError(self::INVALID_METADATA);
        }
    }

    private function assertContentIsValid(?string $content): void
    {
        $violations = $this->validator->validate($content, [new ValidCustomCodeContent()]);

        if ($violations->count() > 0) {
            throw new UserError(self::INVALID_CONTENT);
        }
    }
}
