<?php

namespace Capco\AppBundle\Font;

use FontLib\Font;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class FontProcessor
{
    private const EXCLUDED_FILE_PATTERNS = ['__MACOSX'];
    private const ALLOWED_EXTENSIONS = ['ttf', 'otf', 'eot', 'woff', 'woff2'];
    private const CSS_FORMAT_MAPPING = [
        'ttf' => 'truetype',
        'eot' => 'eot',
        'woff' => 'woff',
        'woff2' => 'woff2',
        'otf' => 'truetype',
    ];
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function processArchive(UploadedFile $archive): array
    {
        $zip = new \ZipArchive();
        $tmp = sys_get_temp_dir();
        $fonts = [];
        if (true === $zip->open($archive->getRealPath())) {
            for ($i = 0; $i < $zip->numFiles; ++$i) {
                $filename = $zip->getNameIndex($i);
                $fileinfo = pathinfo($filename);
                if (
                    isset($fileinfo['extension']) &&
                    \in_array($fileinfo['extension'], self::ALLOWED_EXTENSIONS, true) &&
                    // Needs to filter out some temp files created by ZipArchive in macOS. See https://stackoverflow.com/questions/49985338/how-to-remove-macosx-while-using-ziparchive
                    !preg_match(
                        '/(' . implode('|', self::EXCLUDED_FILE_PATTERNS) . ')/i',
                        $filename
                    )
                ) {
                    $file = $tmp . \DIRECTORY_SEPARATOR . $fileinfo['basename'];
                    copy("zip://{$archive->getRealPath()}#${filename}", $file);
                    $fonts[] = $this->processFont(new UploadedFile($file, $fileinfo['basename']));
                }
            }
            $zip->close();
        }

        return $fonts;
    }

    public function processFont(UploadedFile $file): array
    {
        $extension = $file->getClientOriginalExtension();
        if (!\in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'The file extension ("%s") must be one of the followings: %s',
                    $file->getClientOriginalExtension(),
                    implode(', ', self::ALLOWED_EXTENSIONS)
                )
            );
        }
        $font = Font::load($file->getRealPath());
        if (!$font) {
            return [
                'file' => $file,
                'extension' => $extension,
                'name' => explode('.', $file->getClientOriginalName())[0],
                'format' => $extension,
                'style' => null,
                'fullname' => null,
                'weight' => null,
            ];
        }
        $font->parse();
        $name = $font->getFontName();
        $fullname = $font->getFontSubfamilyID();
        $style = false !== stripos($font->getFontSubfamily(), 'italic') ? 'italic' : 'normal';

        try {
            $process = new Process(['fc-scan', '--format', '%{family} | %{fullname}', $file]);
            $process->mustRun();
            if (!empty($process->getOutput())) {
                list($family, $fullname) = explode(' | ', $process->getOutput());
                $familyParts = explode(',', $family);
                $name = \count($familyParts) > 0 ? $familyParts[0] : $font->getFontName();
            }
        } catch (ProcessFailedException $exception) {
            $this->logger->warning(
                sprintf(
                    "Unable to read font name from file '%s' using fc-scan",
                    $file->getFilename()
                )
            );
        } finally {
            return [
                'file' => $file,
                'extension' => $extension,
                'name' => $name,
                'format' => self::CSS_FORMAT_MAPPING[$extension] ?? 'truetype',
                'style' => $style,
                'fullname' => $fullname,
                'weight' => (int) $font->getFontWeight(),
            ];
        }
    }
}
