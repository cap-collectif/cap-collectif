<?php

namespace Capco\AppBundle\GraphQL;

use League\Csv\Writer;
use GraphQL\Language\Parser;
use GraphQL\Language\Source;

class GraphQLToCsv
{
    public function generate(string $requestString, array $requestResult, Writer &$writer)
    {
        $infoResolver = new InfoResolver();
        $csvGenerator = new CsvWriter();

        $fields = $infoResolver->queryStringToFields($requestString);
        $headers = $infoResolver->guessHeadersFromFields($fields);

        $writer->insertOne($headers);
        $csvGenerator->setHeaders($headers);

        foreach (array_keys($fields) as $fieldKey) {
            $rows = [];
            foreach ($requestResult['data'][$fieldKey] as $currentData) {
                $csvGenerator->writeNewRow($rows, $currentData, $fieldKey);
            }
            $writer->insertAll($rows);
        }
    }
}
