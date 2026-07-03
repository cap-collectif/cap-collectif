<?php

namespace Capco\AppBundle\Provider;

interface AllowedExtensions
{
    public const ALLOWED_MIMETYPES_IMAGE = [
        'image/png', // .png
        'image/gif', // .gif
        'image/jpeg', // .jpeg .jpg
        'image/webp', // .webp
    ];

    public const ALLOWED_MIMETYPES = [
        ...self::ALLOWED_MIMETYPES_IMAGE,
        'application/csv', // .csv
        'text/csv', // .csv
        'text/plain', // .csv
        'application/x-PhpStorm-csv-file', // .csv
        'text/anytext', // .csv
        'text/comma-separated-values', // .csv
        'application/pdf', // .pdf
        'application/msword', // .doc
        'text/rtf', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/zip', //.docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.msexcel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.oasis.opendocument.text', // .odt
        'application/vnd.oasis.opendocument.presentation', // .odp
        'application/vnd.oasis.opendocument.spreadsheet', // .ods
    ];

    public const ALLOWED_MIMETYPES_WITH_ARCHIVES = [
        ...self::ALLOWED_MIMETYPES,
        'application/x-zip-compressed',
        'application/x-tar',
        'application/x-7z-compressed',
        'application/x-7z',
        'application/x-rar-compressed',
        'application/x-rar',
        'application/x-bzip',
        'application/x-bzip2',
        'application/gzip',
        'application/x-gzip',
    ];
}
