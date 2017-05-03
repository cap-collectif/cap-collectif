<?php

namespace Capco\AppBundle\GraphQL;

class InfoResolver
{
    public function guessHeadersFromFields(array $data): array
    {
        $headers = [];
        $this->appendString('', $data, $headers);

        return $headers;
    }

    private function appendString(string $string, $array, &$result)
    {
        if (is_array($array)) {
            foreach ($array as $key => $value) {
                $newString = is_int($key)
                  ? $string
                  : ($string !== '' ? $string . '_' : '') . $key
                ;
                $this->appendString($newString, $value, $result);
            }

            return;
        }
        if (!in_array($string, $result, true)) {
            $result[] = $string;
        }
    }
}
