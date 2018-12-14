<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\PyStringNode;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Behat\Symfony2Extension\Context\KernelDictionary;
use Box\Spout\Common\Type;
use Box\Spout\Reader\CSV\Reader;
use Box\Spout\Reader\ReaderFactory;
use Box\Spout\Reader\ReaderInterface;
use PHPUnit\Framework\Assert;
use Symfony\Component\HttpKernel\KernelInterface;

class ExportContext implements KernelAwareContext
{
    use KernelDictionary;

    private const SNAPSHOTS_DIRNAME = '__snapshots__';

    private $config = [
        'readerType' => Type::CSV,
        'delimiter' => ',',
        'enclosure' => '"',
    ];

    public function setKernel(KernelInterface $kernel): void
    {
        $this->kernel = $kernel;
    }

    /**
     * @Then /^exported "([^"]*)" file with name "([^"]*)" should have header:$/
     */
    public function exportedFileTypeFileWithNameShouldHaveHeader(
        string $fileType,
        string $name,
        PyStringNode $behatInput
    ): void {
        $this->setConfigParameter('readerType', $fileType);

        $path = $this->getExportDir() . "/${name}";

        Assert::assertFileExists($path);

        $delimiter = $this->getConfigParameter('delimiter');
        $csvLines = $this->getFileLines($path);
        $csvHeader = array_shift($csvLines);
        $behatLines = $behatInput->getStrings();
        $behatHeader = explode($delimiter, array_shift($behatLines));

        $output = $this->getCleanOutput($behatHeader, $behatLines, $csvHeader, $csvLines);

        $this->compareHeader($output['expected']['header'], $output['actual']['header']);
    }

    /**
     * @Then /^exported "([^"]*)" file with name "([^"]*)" should have (?P<num>\d+) rows$/
     */
    public function exportedFileTypeFileWithNameShouldHaveRows(
        string $fileType,
        string $name,
        int $rows
    ): void {
        $this->setConfigParameter('readerType', $fileType);

        $path = $this->getExportDir() . "/${name}";

        Assert::assertFileExists($path);

        $lines = $this->getFileLines($path);
        Assert::assertCount($rows, $lines);
    }

    /**
     * @Then /^exported "([^"]*)" file with name "([^"]*)" should match its snapshot$/
     */
    public function exportedFileTypeFileWithNameShouldLooksLikeItsSnapshot(
        string $fileType,
        string $name
    ): void {
        $this->setConfigParameter('readerType', $fileType);

        $realPath = $this->getExportDir() . "/${name}";
        $snapshotPath = $this->getSnapshotsDir() . "/${name}";

        Assert::assertFileExists($realPath);
        Assert::assertFileExists($snapshotPath);

        $csvLines = $this->getFileLines($realPath);
        $csvHeader = array_shift($csvLines);
        $snapshotLines = $this->getFileLines($snapshotPath);
        $snapshotHeader = array_shift($snapshotLines);

        $output = $this->getCleanOutput($snapshotHeader, $snapshotLines, $csvHeader, $csvLines);

        $this->compareOutput($output);
    }

    /**
     * @Then /^exported "([^"]*)" file with name "([^"]*)" should contain:$/
     */
    public function exportedFileTypeFileWithNameShouldCountain(
        string $fileType,
        string $name,
        PyStringNode $behatInput
    ): void {
        $this->setConfigParameter('readerType', $fileType);

        $path = $this->getExportDir() . "/${name}";

        Assert::assertFileExists($path);

        $delimiter = $this->getConfigParameter('delimiter');

        $csvLines = $this->getFileLines($path);
        $csvHeader = array_shift($csvLines);
        $behatLines = $behatInput->getStrings();
        $behatHeader = explode($delimiter, array_shift($behatLines));
        $behatLines = array_map(function (string $behatLine) use ($delimiter) {
            return explode($delimiter, $behatLine);
        }, $behatLines);

        $output = $this->getCleanOutput($behatHeader, $behatLines, $csvHeader, $csvLines);

        $this->compareOutput($output);
    }

    private function getExportDir(): string
    {
        return $this->getKernel()->getRootDir() . '/../web/export';
    }

    private function getSnapshotsDir(): string
    {
        return $this->getKernel()->getRootDir() .
            '/../features/commands/' .
            self::SNAPSHOTS_DIRNAME;
    }

    private function getConfig(): array
    {
        return $this->config;
    }

    private function getConfigParameter(string $parameter): string
    {
        return $this->config[$parameter];
    }

    private function setConfigParameter(string $parameter, string $value): self
    {
        $this->config[$parameter] = $value;

        return $this;
    }

    private function getReader(): ReaderInterface
    {
        $readerType = $this->getConfigParameter('readerType');
        $reader = ReaderFactory::create($readerType);
        if (Type::CSV === $readerType && $reader instanceof Reader) {
            $reader
                ->setFieldDelimiter($this->getConfigParameter('delimiter'))
                ->setFieldEnclosure($this->getConfigParameter('enclosure'));
        } elseif (Type::XLSX === $readerType && $reader instanceof \Box\Spout\Reader\XLSX\Reader) {
            $reader->setShouldPreserveEmptyRows(true);
        }

        return $reader;
    }

    private function getFileLines(string $path): array
    {
        $reader = $this->getReader();

        $reader->open($path);
        $sheet = current(iterator_to_array($reader->getSheetIterator()));
        $lines = iterator_to_array($sheet->getRowIterator());
        $reader->close();

        return $lines;
    }

    private function compareHeader(array $expected, array $actual): void
    {
        $diff = array_diff($actual, $expected);
        if (0 !== \count($diff)) {
            throw new \RuntimeException(
                sprintf(
                    "\n\nHeader in the file does not match the expected one. Given:\n\n\t%s\n\nNon expected headers: %s",
                    implode(' | ', $actual),
                    implode(' | ', $diff)
                )
            );
        }

        $diff = array_diff($expected, $actual);
        if (0 !== \count($diff)) {
            throw new \RuntimeException(
                sprintf(
                    "\n\nHeader in the file does not match the expected one. Given:\n\n\t%s\n\nMissing headers: %s",
                    implode(' | ', $actual),
                    implode(' | ', $diff)
                )
            );
        }

        if (\count($expected) !== \count($actual)) {
            throw new \RuntimeException(
                sprintf(
                    "\n\nHeader in the file does not match the expected one. Given:\n\n\t%s\n\nDuplicated fields detected.",
                    implode(' | ', $actual)
                )
            );
        }

        $this->compareHeaderOrder($expected, $actual);
    }

    private function compareHeaderOrder(array $expected, array $actual): void
    {
        Assert::assertEquals(
            $expected,
            $actual,
            sprintf('Expecting to see headers order like %d , found %d', $expected, $actual)
        );
    }

    private function compareLines(array $expected, array $actual): void
    {
        foreach ($expected as $i => $expectedLine) {
            foreach ($expectedLine as $columnName => $cellValue) {
                $suffix = strtolower(substr($columnName, -2));
                // We skip date values because they can be dynamic
                if ('at' === $suffix) {
                    continue;
                }
                if ($actual[$i][$columnName] !== $cellValue) {
                    throw new \RuntimeException(
                        sprintf(
                            "\n\nRow %s does not match the expected one. Given:\n\n\t%s\n\nExpected:\n\n\t%s\n\nInvalid cell value: %s",
                            $i + 1,
                            implode(' | ', $actual[$i]),
                            implode(' | ', $expected[$i]),
                            "${cellValue} (${columnName})"
                        )
                    );
                }
            }
        }
    }

    private function getCleanOutput(
        array $expectedHeader,
        array $expectedLines,
        array $actualHeader,
        array $actualLines
    ): array {
        $output['expected'] = [
            'header' => $expectedHeader,
            'lines' => array_map(function (array $expectedLine) use ($expectedHeader) {
                $result = [];
                foreach ($expectedLine as $i => $csvField) {
                    $result[$expectedHeader[$i]] = $csvField;
                }

                return $result;
            }, $expectedLines),
        ];

        $output['actual'] = [
            'header' => $actualHeader,
            'lines' => array_map(function (array $actualLine) use ($actualHeader) {
                $result = [];
                foreach ($actualLine as $i => $field) {
                    $result[$actualHeader[$i]] = $field;
                }

                return $result;
            }, $actualLines),
        ];

        return $output;
    }

    private function compareOutput(array $output): void
    {
        $this->compareHeader($output['expected']['header'], $output['actual']['header']);
        $this->compareLines($output['expected']['lines'], $output['actual']['lines']);
    }
}
