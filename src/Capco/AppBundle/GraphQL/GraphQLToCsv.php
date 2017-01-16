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

        echo "Getting headers";
        $fields = $this->infoResolver->queryStringToFields($requestString);
        $headers = $this->infoResolver->guessHeadersFromFields($fields);
        echo "Done";

        $writer->insertOne($headers);
        $this->csvGenerator->setHeaders($headers);

        foreach ($fields as $fieldKey => $field) {
            $rows = [];
            foreach ($requestResult['data'][$fieldKey] as $currentData) {
                $this->csvGenerator->writeNewRow($rows, $currentData, $fieldKey);
            }
            $writer->insertAll($rows);
        }
    }
}
