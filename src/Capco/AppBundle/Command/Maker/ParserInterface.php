<?php

namespace Capco\AppBundle\Command\Maker;

interface ParserInterface
{
    /**
     * Given a path to a template file (e.g Message.tpl.php), output a string
     * with the template file parsed and filled with the parameters.
     */
    public function parseTemplate(string $path, array $parameters = []): string;
}
