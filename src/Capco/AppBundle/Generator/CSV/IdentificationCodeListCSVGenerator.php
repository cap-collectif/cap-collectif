<?php

namespace Capco\AppBundle\Generator\CSV;

use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Symfony\Component\HttpFoundation\Response;

class IdentificationCodeListCSVGenerator extends AbstractCSVResponseGenerator
{
    final public const HEADERS = [
        'title',
        'firstname',
        'lastname',
        'address1',
        'address2',
        'address3',
        'zipCode',
        'city',
        'country',
        'id codes',
    ];

    public static function generateFromList(UserIdentificationCodeList $list): Response
    {
        $data = [];
        foreach ($list->getCodes() as $code) {
            $data[] = $code->toArray();
        }

        return self::generate(self::HEADERS, $data);
    }
}
