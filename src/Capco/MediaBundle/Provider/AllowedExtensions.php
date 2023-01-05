<?php

namespace Capco\MediaBundle\Provider;

interface AllowedExtensions
{
    public const ALLOWED_EXTENSIONS_IMAGE = ['png', 'svg', 'webp', 'gif', 'jpeg', 'jpg', 'jfif'];

    public const ALLOWED_MIMETYPES_IMAGE = [
        'image/png', // .png
        'image/svg+xml', // .svg
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
}
