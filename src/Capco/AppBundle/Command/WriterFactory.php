<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Exception\UnsupportedTypeException;
use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\CSV\Writer as CsvWriter;
use Box\Spout\Writer\ODS\Writer as OdsWriter;
use Box\Spout\Writer\WriterInterface;
use Box\Spout\Writer\XLSX\Writer as XLSXWriter;

class WriterFactory
{
    /**
     * @throws UnsupportedTypeException
     *
     * @return null|CsvWriter|OdsWriter|XlsxWriter
     */
    public static function create(string $writerType, string $delimiter = ';'): WriterInterface
    {
        $writer = null;

        switch ($writerType) {
            case Type::CSV:
                $writer = WriterEntityFactory::createCSVWriter();

                break;

            case Type::XLSX:
                $writer = WriterEntityFactory::createXLSXWriter();

                break;

            case Type::ODS:
                $writer = WriterEntityFactory::createODSWriter();

                break;

            default:
                throw new UnsupportedTypeException('No writers supporting the given type: ' . $writerType);
        }

        $writer->setFieldDelimiter($delimiter);

        return $writer;
    }
}
