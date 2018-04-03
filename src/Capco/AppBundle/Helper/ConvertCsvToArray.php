<?php

namespace Capco\AppBundle\Helper;

class ConvertCsvToArray
{
    public function convert($filename, $delimiter = ';')
    {
        if (!file_exists($filename)) {
            echo "File doesn't exist !";

            return false;
        }

        $header = null;
        $data = [];

        if (false !== ($handle = fopen($filename, 'r'))) {
            while (false !== ($row = fgetcsv($handle, 0, $delimiter))) {
                if (!$header) {
                    $header = $row;
                } else {
                    $data[] = array_combine($header, $row);
                }
            }
            fclose($handle);
        }

        return $data;
    }
}
