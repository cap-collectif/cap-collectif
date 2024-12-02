<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\DebateArgumentInterfaceNormalizer;
use Capco\AppBundle\Command\Service\ExportInterface\ExportableDebateContributionInterface;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Repository\DebateRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class DebateContributionExporter extends ContributionExporter
{
    final public const BATCH_SIZE = 1000;
    private const HEADERS_TABLE_SUMMARY = [
        'Debate',
        'Debate Argument(s)',
        'Debate Anonymous Argument(s)',
    ];
    private const STYLE_TABLE_SUMMARY = 'box-double';

    public function __construct(
        protected EntityManagerInterface $entityManager,
        private readonly DebateRepository $debateRepository,
        private readonly DebateArgumentInterfaceNormalizer $debateArgumentInterfaceNormalizer,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly LoggerInterface $logger,
        Filesystem $fileSystem
    ) {
        $this->serializer = $this->initializeSerializer();
        $this->context['export_debate_contributions'] = true;

        parent::__construct($this->entityManager, $this->serializer, $fileSystem, $this->contributionsFilePathResolver);
    }

    public function exportDebateContributions(
        Debate $debate,
        OutputInterface $output,
        ?string $delimiter
    ): void {
        $this->setDelimiter($delimiter);
        $debateStep = $debate->getStep();
        $paths['simplified'] = $this->contributionsFilePathResolver->getSimplifiedExportPath($debateStep);
        $paths['full'] = $this->contributionsFilePathResolver->getFullExportPath($debateStep);

        if ($this->shouldExport($debate, $paths)) {
            $this->exportContributionsInBatches($debate, $output);
        }
    }

    /**
     * @param array<string>                 $headers
     * @param array<array<int, int|string>> $valuesPerRow
     */
    public function renderTableSummaryDataPerDebate(array $headers, array $valuesPerRow, string $style, OutputInterface $output): void
    {
        (new Table($output))
            ->setHeaders($headers)
            ->setRows($valuesPerRow)
            ->setStyle($style)
            ->render()
        ;
    }

    protected function getOldestUpdateDate(string $simplifiedPath, string $fullPath): \DateTime
    {
        $simplifiedFileDate = filemtime($simplifiedPath);
        $fullFileDate = filemtime($fullPath);

        return (new \DateTime())->setTimestamp(min($simplifiedFileDate, $fullFileDate));
    }

    /**
     * @param array<string, string> $paths
     */
    private function shouldExport(Debate $debate, array $paths): bool
    {
        if (!file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths['simplified'], $paths['full']);

        try {
            return $this->debateRepository->hasNewArgumentsForADebate($debate, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    private function exportContributionsInBatches(
        Debate $debate,
        OutputInterface $output
    ): void {
        $withHeader = true;
        $argumentOffset = 0;

        $progressBar = new ProgressBar($output);
        $progressBar->setFormat("\n%current%/%max% %message% [%bar%] %percent%%\n");
        $progressBar->setMessage('processed argument(s) ');

        do {
            /** @var ExportableDebateContributionInterface[] $contributions */
            $contributions = $this->debateRepository->getDebateArgumentsAndDebateAnonymousArgumentsConfirmed(
                $debate,
                $argumentOffset,
                self::BATCH_SIZE
            );

            $progressBar->setMaxSteps($progressBar->getMaxSteps() + \count($contributions));

            $this->exportContributions(
                $contributions,
                $debate->getStep(),
                $withHeader
            );

            $valuesPerRow = $this->getValuesPerRow($debate, $contributions);
            $this->renderTableSummaryDataPerDebate(
                self::HEADERS_TABLE_SUMMARY,
                $valuesPerRow,
                self::STYLE_TABLE_SUMMARY,
                $output
            );

            $this->entityManager->clear();
            $withHeader = false;
            $argumentOffset += self::BATCH_SIZE;
            $progressBar->advance($progressBar->getMaxSteps());
        } while (self::BATCH_SIZE === \count($contributions));

        $progressBar->finish();
    }

    private function initializeSerializer(): SerializerInterface
    {
        return new Serializer(
            [
                $this->debateArgumentInterfaceNormalizer,
            ],
            [new CsvEncoder()],
        );
    }

    /**
     * @param ExportableDebateContributionInterface[] $debateArguments
     *
     * @return array<array<int, int|string>>
     */
    private function getValuesPerRow(Debate $debate, array $debateArguments): array
    {
        $debateAnonymousArguments = array_filter(
            $debateArguments,
            fn (ExportableDebateContributionInterface $argument) => $argument instanceof DebateAnonymousArgument
        );

        $debateArguments = array_filter(
            $debateArguments,
            fn (ExportableDebateContributionInterface $argument) => $argument instanceof DebateArgument
        );

        return [
            [
                $debate->getId(),
                \count($debateArguments),
                \count($debateAnonymousArguments),
            ],
        ];
    }
}
