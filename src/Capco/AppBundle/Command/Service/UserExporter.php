<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\UserNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\UsersFilePathResolver;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class UserExporter
{
    final public const CSV_DELIMITER = ';';
    final public const BATCH_SIZE = 10000;
    private SymfonyStyle $style;
    private ?string $delimiter = self::CSV_DELIMITER;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private readonly Filesystem $fileSystem,
        private readonly UsersFilePathResolver $usersFilePathResolver,
        private readonly UserNormalizer $userNormalizer,
        private readonly UserRepository $userRepository,
        private readonly LocaleRepository $localeRepository,
        private readonly LoggerInterface $logger
    ) {
        $this->serializer = $this->initializeSerializer();
    }

    public function initializeStyle(SymfonyStyle $style): void
    {
        $this->style = $style;
    }

    /**
     * @throws LocaleConfigurationException
     */
    public function exportUsers(string $delimiter): void
    {
        $this->setDelimiter($delimiter);
        $path = $this->usersFilePathResolver->getExportPath();

        $this->shouldExport($path)
            ? $this->exportUsersByBatch($path)
            : $this->style->note('No new users to export');
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
                $this->userNormalizer,
            ],
            [new CsvEncoder()],
        );
    }

    /**
     * @param array<User> $users
     */
    private function write(array $users, bool $withHeader, string $path): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
            'is_full_export' => true,
        ];

        $content = $this->serializer->serialize(
            $users,
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

    private function shouldExport(string $path): bool
    {
        if (!file_exists($path)) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($path);

        try {
            return $this->userRepository->hasNewUsers($oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    private function getOldestUpdateDate(string $path): \DateTime
    {
        $fileDate = filemtime($path);

        return (new \DateTime())->setTimestamp($fileDate);
    }

    /**
     * @throws LocaleConfigurationException
     */
    private function exportUsersByBatch(string $path): void
    {
        $offset = 0;
        $countUsers = 0;
        $withHeaders = true;
        do {
            $users = $this->userRepository->findAllUsersPaginated($this->localeRepository->getDefaultCode(), $offset, self::BATCH_SIZE);

            if ([] === $users) {
                continue;
            }

            $this->write($users, $withHeaders, $path);
            $withHeaders = false;
            $this->entityManager->clear();
            $offset += self::BATCH_SIZE;
            $countUsers += \count($users);
        } while (\count($users) > 0);

        $this->style->writeln(sprintf('%d users has been exported', $countUsers));
    }
}
