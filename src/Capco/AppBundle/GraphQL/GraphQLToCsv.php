<?php

namespace Capco\AppBundle\GraphQL;

use League\Csv\Writer;

class GraphQLToCsv
{
    public function generate(string $requestString, array $requestResult, Writer $writer)
    {
        $infoResolver = new InfoResolver();
        $csvGenerator = new CsvWriter();

        $fields = $infoResolver->queryStringToFields($requestString);
        $headers = $infoResolver->guessHeadersFromFields($fields);

        $writer->insertOne($headers);
        $csvGenerator->setHeaders($headers);

        foreach ($fields as $fieldKey => $field) {
            $rows = [];
            foreach ($requestResult['data'][$fieldKey] as $currentData) {
                $csvGenerator->writeNewRow($rows, $currentData, $fieldKey);
            }
            $writer->insertAll($rows);
        }
    }
}
