<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Exception\UnsupportedTypeException;
use Box\Spout\Common\Helper\GlobalFunctionsHelper;
use Box\Spout\Common\Type;
use Box\Spout\Writer\CSV\Writer as CsvWriter;
use Box\Spout\Writer\XLSX\Writer as XLSXWriter;
use Box\Spout\Writer\ODS\Writer as OdsWriter;

class WriterFactory
{

    /**
     * @param string $writerType
     * @param string $delimiter
     * @return CsvWriter|OdsWriter|XlsxWriter|null
     * @throws UnsupportedTypeException
     */
    public static function create(string $writerType, string $delimiter = ';')
    {
        $writer = null;

        switch ($writerType) {
            case Type::CSV:
                $writer = new CsvWriter();
                break;
            case Type::XLSX:
                $writer = new XLSXWriter();
                break;
            case Type::ODS:
                $writer = new ODSWriter();
                break;
            default:
                throw new UnsupportedTypeException('No writers supporting the given type: ' . $writerType);
        }

        $writer->setFieldDelimiter($delimiter);
        $writer->setGlobalFunctionsHelper(new GlobalFunctionsHelper());

        return $writer;
    }
}
