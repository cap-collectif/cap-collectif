<?php

namespace Capco\AppBundle\Generator\CSV;

use Symfony\Component\HttpFoundation\Response;

abstract class AbstractCSVResponseGenerator
{
    protected static function generate(array $headers, array $data): Response
    {
        $rows = [];
        $rows[] = implode(',', $headers);

        foreach ($data as $datum) {
            $rows[] = implode(',', $datum);
        }

        $response = new Response(implode("\n", $rows));
        $response->headers->set('Content-Type', 'text/csv');

        return $response;
    }
}
