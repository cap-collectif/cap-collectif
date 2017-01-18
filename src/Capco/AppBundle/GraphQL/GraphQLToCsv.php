<?php

namespace Capco\AppBundle\GraphQL;

use League\Csv\Writer;

class GraphQLToCsv
{
    public $infoResolver = null;
    public $csvGenerator = null;

    public function generate(string $requestString, array $requestResult, Writer $writer)
    {
        if (!$this->infoResolver) {
            $this->infoResolver = new InfoResolver();
            $this->csvGenerator = new CsvWriter();
        }

        $fields = $this->infoResolver->queryStringToFields($requestString);
        $headers = $this->infoResolver->guessHeadersFromFields($fields);

        $writer->insertOne($headers);
        $this->csvGenerator->setHeaders($headers);

        foreach ($fields as $fieldKey => $field) {
            $rows = [];
            foreach ($requestResult['data'][$fieldKey] as $currentData) {
                $this->csvGenerator->writeNewRow($rows, $currentData, $fieldKey);
            }
            foreach ($rows as $row) {
                $writer->insertOne($row);
                usleep(100);
            }
        }
    }
}
