<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Contracts\Cache\CacheInterface;

class CollectParticipantExporter extends ParticipantExporter
{
    protected EntityManagerInterface $entityManager;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly ParticipantNormalizer $participantNormalizer,
        EntityManagerInterface $entityManager,
        Filesystem $fileSystem,
        private readonly ParticipantsFilePathResolver $participantsFilePathResolver,
        private readonly LoggerInterface $logger,
        private readonly CacheInterface $cache
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem);
    }

    /**
     * @param array<User> $participants
     */
    public function exportCollectParticipants(CollectStep $collectStep, array $participants, ?string $delimiter, bool $withHeaders, bool $append, OutputInterface $output): void
    {
        $this->setDelimiter($delimiter);

        $paths['simplified'] = $this->participantsFilePathResolver->getSimplifiedExportPath($collectStep);
        $paths['full'] = $this->participantsFilePathResolver->getFullExportPath($collectStep);

        if ($this->shouldExportParticipant($collectStep, $participants, $paths, $append)) {
            $this->setStep($collectStep);
            $this->exportParticipants($participants, $paths, $withHeaders, $append);
        }
    }

    /**
     * @param array<User> $data
     */
    protected function write(string $path, array $data, bool $withHeader, bool $isFullExport, bool $append): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::IS_FULL_EXPORT => $isFullExport,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
        ];

        if (!$isFullExport) {
            $data = array_filter($data, function (User $participant) {
                foreach ($participant->getVotes() as $vote) {
                    $step = $vote->getStep();

                    if ('collect' === $step?->getType()
                        && true === $vote->getIsAccounted()
                        && $step->getSlug() === $this->step->getSlug()) {
                        return true;
                    }
                }

                $proposals = $this->step->getProposalForm()?->getProposals();

                if ($proposals) {
                    return $participant->getProposals()->exists(
                        fn ($key, $proposal) => $proposals->contains($proposal)
                    );
                }

                return false;
            });

            $data = array_values($data);
        }

        if (null !== $this->step) {
            $context['step'] = $this->step;
        }

        $content = $this->serializer->serialize(
            $data,
            CsvEncoder::FORMAT,
            $context
        );

        if ($withHeader && !$append) {
            $this->fileSystem->dumpFile($path, $content);

            $this->style->writeln("\n<info>Exported the CSV files : {$path}</info>");
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($content);
    }

    /**
     * @param array<string, string> $paths
     * @param array<User>           $participants
     */
    private function shouldExportParticipant(CollectStep $collectStep, array $participants, array $paths, bool $append): bool
    {
        if ($append || !file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths);

        try {
            $cacheKey = sprintf('%s-collect-participants-count', $collectStep->getSlug());
            $currentCount = \count($participants);
            $lastParticipantsCount = $this->cache->get($cacheKey, fn () => 0);

            if ($currentCount !== $lastParticipantsCount) {
                $this->cache->delete($cacheKey);
                $this->cache->get($cacheKey, fn () => $currentCount);

                return true;
            }

            return $this->userRepository->hasNewParticipantsForACollectStep($collectStep, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->participantNormalizer],
            [new CsvEncoder()]
        );
    }
}
