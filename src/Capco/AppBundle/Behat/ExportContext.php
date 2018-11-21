<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\PyStringNode;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Behat\Symfony2Extension\Context\KernelDictionary;
use Box\Spout\Common\Type;
use Box\Spout\Reader\CSV\Reader;
use Box\Spout\Reader\ReaderFactory;
use Box\Spout\Reader\ReaderInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class ExportContext implements KernelAwareContext
{
    use KernelDictionary;

    private $config = [
        'readerType' => Type::CSV,
        'delimiter' => ',',
        'enclosure' => '"',
    ];

    public function setKernel(KernelInterface $kernel): void
    {
        $this->kernel = $kernel;
    }

    private function getExportDir(): string
    {
        return $this->getKernel()->getRootDir() . '/../web/export';
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
        if ($readerType === Type::CSV && $reader instanceof Reader) {
            $reader
                ->setFieldDelimiter($this->getConfigParameter('delimiter'))
                ->setFieldEnclosure($this->getConfigParameter('enclosure'));
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

    /**
     * @Then /^exported file with name "([^"]*)" should contain:$/
     */
    public function exportedFileWithNameShouldCountain(string $name, PyStringNode $behatInput): void
    {
        $path = $this->getExportDir() . "/$name";
        $delimiter = $this->getConfigParameter('delimiter');

        $csvLines = $this->getFileLines($path);
        $csvHeader = array_shift($csvLines);
        $behatLines = $behatInput->getStrings();
        $behatHeader = explode($delimiter, array_shift($behatLines));
        $behatLines = array_map(function (string $behatLine) use ($delimiter) {
            return explode($delimiter, $behatLine);
        }, $behatLines);

        $output = $this->getCleanOutput($csvHeader, $csvLines, $behatHeader, $behatLines);

        $this->compareHeader($output['behat']['header'], $output['csv']['header']);
        $this->compareLines($output['behat']['lines'], $output['csv']['lines']);
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
    }

    private function compareLines(array $expected, array $actual): void
    {
        foreach ($expected as $i => $expectedLine) {
            foreach ($expectedLine as $columnName => $cellValue) {
                if ($actual[$i][$columnName] !== $cellValue) {
                    throw new \RuntimeException(
                        sprintf(
                            "\n\nRow %s does not match the expected one. Given:\n\n\t%s\n\nExpected:\n\n\t%s\n\nInvalid cell value: %s",
                            $i + 1,
                            implode(' | ', $actual[$i]),
                            implode(' | ', $expected[$i]),
                            $cellValue
                        )
                    );
                }
            }
        }
    }

    private function getCleanOutput(
        array $csvHeader,
        array $csvLines,
        array $behatHeader,
        array $behatLines
    ): array {
        $output['csv'] = [
            'header' => $csvHeader,
            'lines' => array_map(function (array $csvLine) use ($csvHeader) {
                $result = [];
                foreach ($csvLine as $i => $csvField) {
                    $result[$csvHeader[$i]] = $csvField;
                }
                return $result;
            }, $csvLines),
        ];

        $output['behat'] = [
            'header' => $behatHeader,
            'lines' => array_map(function (array $behatLine) use ($behatHeader) {
                $result = [];
                foreach ($behatLine as $i => $csvField) {
                    $result[$behatHeader[$i]] = $csvField;
                }
                return $result;
            }, $behatLines),
        ];

        return $output;
    }
}
