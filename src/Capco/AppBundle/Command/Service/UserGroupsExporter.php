<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\UserGroupNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\UserGroupsFilePathResolver;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Repository\UserGroupRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class UserGroupsExporter
{
    final public const CSV_DELIMITER = ';';
    final public const BATCH_SIZE = 10000;
    private SymfonyStyle $style;
    private string $delimiter = self::CSV_DELIMITER;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private readonly Filesystem $fileSystem,
        private readonly UserGroupsFilePathResolver $userGroupsFilePathResolver,
        private readonly UserGroupNormalizer $userGroupNormalizer,
        private readonly UserGroupRepository $userGroupRepository,
    ) {
        $this->serializer = $this->initializeSerializer();
    }

    public function initializeStyle(SymfonyStyle $style): void
    {
        $this->style = $style;
    }

    public function exportUserGroups(string $delimiter): void
    {
        $this->setDelimiter($delimiter);
        $path = $this->userGroupsFilePathResolver->getExportPath();

        $this->exportUserGroupsByBatch($path);
    }

    private function setDelimiter(?string $delimiter): void
    {
        if ($delimiter) {
            $this->delimiter = $delimiter;
        }
    }

    private function initializeSerializer(): SerializerInterface
    {
        return new Serializer(
            [
                $this->userGroupNormalizer,
            ],
            [new CsvEncoder()],
        );
    }

    /**
     * @param array<UserGroup> $userGroups
     */
    private function write(array $userGroups, bool $withHeader, string $path): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
            'is_full_export' => true,
        ];

        $content = $this->serializer->serialize(
            $userGroups,
            CsvEncoder::FORMAT,
            $context
        );

        if ($withHeader) {
            $this->fileSystem->dumpFile($path, $content);
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($content);
    }

    private function exportUserGroupsByBatch(string $path): void
    {
        $offset = 0;
        $countUserGroups = 0;
        $withHeaders = true;
        do {
            $userGroups = $this->userGroupRepository->findAllUserGroupsPaginated($offset, self::BATCH_SIZE);

            if ([] === $userGroups) {
                continue;
            }

            $this->write($userGroups, $withHeaders, $path);
            $withHeaders = false;
            $this->entityManager->clear();
            $offset += self::BATCH_SIZE;
            $countUserGroups += \count($userGroups);
        } while (\count($userGroups) > 0);

        $this->style->writeln(sprintf('%d user groups have been exported', $countUserGroups));
    }
}
