export const ALLOWED_IMAGE_MIMETYPES = [
  'image/png', // .png
  'image/svg+xml', // .svg
  'image/gif', // .gif
  'image/jpeg', // .jpeg .jpg
  'image/webp', // .webp
]

// This must be sync with API check in MediasController::ALLOWED_MIMETYPES
export const ALLOWED_MIMETYPES = [
  ...ALLOWED_IMAGE_MIMETYPES,
  'text/csv', // .csv
  'application/x-PhpStorm-csv-file', // .csv
  'text/anytext', // .csv
  'text/comma-separated-values', // .csv
  'application/pdf', // .pdf
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.oasis.opendocument.text', // .odt
  'application/vnd.oasis.opendocument.presentation', // .odp
  'application/vnd.oasis.opendocument.spreadsheet', // .ods
]

export const MAX_FILE_SIZE = 10000000 // 10 Mo
