<?php

namespace Capco\AppBundle\Command\Maker;

class Parser implements ParserInterface
{
    public function parseTemplate(string $path, array $parameters = []): string
    {
        ob_start();
        extract($parameters, EXTR_SKIP);
        include "$path";

        return ob_get_clean();
    }
}
